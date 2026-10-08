import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { api, ApiError, getToken, setToken } from "../api/client";

export type UserRole = "ADMIN" | "CFO" | "KEPALA GUDANG" | "ADMINISTRATOR";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  password?: string;
}

const MODULE_ACCESS: Record<UserRole, string[]> = {
  ADMIN: [
    "Persediaan",
    "Master Barang & Jasa",
    "Barang Masuk",
    "Barang Keluar",
    "Laporan Stok",
    "Laporan Barang Masuk",
    "Laporan Barang Keluar",
  ],
  "KEPALA GUDANG": [
    "Persediaan",
    "Master Barang & Jasa",
    "Barang Masuk",
    "Barang Keluar",
    "Laporan Stok",
    "Laporan Barang Masuk",
    "Laporan Barang Keluar",
  ],
  ADMINISTRATOR: ["*"],
  CFO: ["*"],
};

interface AuthContextType {
  user: AuthUser | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  isReady: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addUser: (user: Omit<AuthUser, "id">) => Promise<void>;
  updateUser: (id: string, user: Partial<AuthUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  canAccessModule: (moduleId: string) => boolean;
  canPostJournal: boolean;
  canLockPeriod: boolean;
  canApproveHighValue: boolean;
  canViewConsolidated: boolean;
  role: UserRole;
  isSimulatorVisible: boolean;
  setSimulatorVisible: (visible: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSimulatorVisible, setSimulatorVisible] = useState(false);

  const loadUsers = useCallback(async () => {
    const list = await api<AuthUser[]>("/users");
    setUsers(list);
  }, []);

  useEffect(() => {
    const boot = async () => {
      if (!getToken()) {
        setIsReady(true);
        return;
      }
      try {
        const me = await api<AuthUser>("/auth/me");
        setUser(me);
        await loadUsers();
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };
    void boot();
  }, [loadUsers]);

  const login = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await api<{
          success: boolean;
          token: string;
          user: AuthUser;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
        setToken(result.token);
        setUser(result.user);
        await loadUsers();
        return { success: true };
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Username atau password salah. Silakan coba lagi.";
        return { success: false, error: message };
      }
    },
    [loadUsers],
  );

  const logout = useCallback(async () => {
    try {
      if (getToken()) await api("/auth/logout", { method: "POST" });
    } catch {
      /* token may already be invalid */
    }
    setToken(null);
    setUser(null);
    setUsers([]);
  }, []);

  const addUser = useCallback(async (newUser: Omit<AuthUser, "id">) => {
    const created = await api<AuthUser>("/users", {
      method: "POST",
      body: JSON.stringify({
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        password: newUser.password,
      }),
    });
    setUsers((prev) => [...prev, created]);
  }, []);

  const updateUser = useCallback(
    async (id: string, updatedUser: Partial<AuthUser>) => {
      const payload: Record<string, unknown> = { ...updatedUser };
      if (!updatedUser.password) delete payload.password;
      const saved = await api<AuthUser>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? saved : u)));
      if (user?.id === id) setUser(saved);
    },
    [user],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      await api(`/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (user?.id === id) await logout();
    },
    [user, logout],
  );

  const canAccessModule = useCallback(
    (moduleId: string): boolean => {
      if (!user) return false;
      const access = MODULE_ACCESS[user.role] || [];
      if (access.includes("*")) return true;
      return access.includes(moduleId);
    },
    [user],
  );

  const role: UserRole = user?.role ?? "ADMIN";
  const canPostJournal = role === "CFO" || role === "ADMINISTRATOR";
  const canLockPeriod = role === "CFO" || role === "ADMINISTRATOR";
  const canApproveHighValue = role === "CFO" || role === "ADMINISTRATOR";
  const canViewConsolidated = role === "CFO" || role === "ADMINISTRATOR";

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        isAuthenticated: user !== null,
        isReady,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        canAccessModule,
        canPostJournal,
        canLockPeriod,
        canApproveHighValue,
        canViewConsolidated,
        role,
        isSimulatorVisible,
        setSimulatorVisible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
