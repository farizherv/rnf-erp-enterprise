import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "../../../shared/api/client";

export type ItemType = "INVENTORY" | "CONSUMABLE" | "SERVICE";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  type: ItemType;
  currentStock: number;
  minStock: number;
  unit: string;
  customerName?: string;
}

export interface ItemCategory {
  id: string;
  name: string;
}

export interface ItemUnit {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
}

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: "IN" | "OUT";
  quantity: number;
  reference: string;
  notes?: string;
}

interface InventorySnapshot {
  items: InventoryItem[];
  categories: ItemCategory[];
  units: ItemUnit[];
  customers: Customer[];
  movements: StockMovement[];
}

interface InventoryContextType {
  items: InventoryItem[];
  categories: ItemCategory[];
  units: ItemUnit[];
  movements: StockMovement[];
  customers: Customer[];
  isLoading: boolean;
  refresh: () => Promise<void>;

  issueStock: (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
  ) => void;
  receiveStock: (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
  ) => void;
  updateMovement: (
    movId: string,
    data: { itemId: string; quantity: number; date: string },
  ) => void;
  deleteMovement: (movId: string) => void;

  addItem: (item: Omit<InventoryItem, "id">) => void;
  updateItem: (id: string, data: Partial<Omit<InventoryItem, "id">>) => void;
  deleteItem: (id: string) => void;

  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;

  addUnit: (name: string) => void;
  updateUnit: (id: string, name: string) => void;
  deleteUnit: (id: string) => void;

  addCustomer: (customer: Omit<Customer, "id">) => void;
  updateCustomer: (id: string, data: Partial<Omit<Customer, "id">>) => void;
  deleteCustomer: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [units, setUnits] = useState<ItemUnit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const applySnapshot = (data: InventorySnapshot) => {
    setItems(data.items);
    setCategories(data.categories);
    setUnits(data.units);
    setCustomers(data.customers);
    setMovements(data.movements);
  };

  const refresh = useCallback(async () => {
    const data = await api<InventorySnapshot>("/inventory");
    applySnapshot(data);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await refresh();
      setIsLoading(false);
    };
    void fetchData();
  }, [refresh]);

  const issueStock = (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
  ) => {
    void (async () => {
      const result = await api<{
        movement: StockMovement;
        item: InventoryItem;
      }>("/inventory/movements/out", {
        method: "POST",
        body: JSON.stringify({ itemId, quantity, reference, date }),
      });
      setItems((prev) =>
        prev.map((item) => (item.id === result.item.id ? result.item : item)),
      );
      setMovements((prev) => [result.movement, ...prev]);
    })();
  };

  const receiveStock = (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
  ) => {
    void (async () => {
      const result = await api<{
        movement: StockMovement;
        item: InventoryItem;
      }>("/inventory/movements/in", {
        method: "POST",
        body: JSON.stringify({ itemId, quantity, reference, date }),
      });
      setItems((prev) =>
        prev.map((item) => (item.id === result.item.id ? result.item : item)),
      );
      setMovements((prev) => [result.movement, ...prev]);
    })();
  };

  const updateMovement = (
    movId: string,
    data: { itemId: string; quantity: number; date: string },
  ) => {
    void (async () => {
      await api(`/inventory/movements/${movId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      await refresh();
    })();
  };

  const deleteMovement = (movId: string) => {
    void (async () => {
      await api(`/inventory/movements/${movId}`, { method: "DELETE" });
      await refresh();
    })();
  };

  const addItem = (itemData: Omit<InventoryItem, "id">) => {
    void (async () => {
      const created = await api<InventoryItem>("/inventory/items", {
        method: "POST",
        body: JSON.stringify(itemData),
      });
      setItems((prev) => [...prev, created]);
    })();
  };

  const updateItem = (id: string, data: Partial<Omit<InventoryItem, "id">>) => {
    void (async () => {
      const saved = await api<InventoryItem>(`/inventory/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setItems((prev) => prev.map((item) => (item.id === id ? saved : item)));
    })();
  };

  const deleteItem = (id: string) => {
    void (async () => {
      await api(`/inventory/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMovements((prev) => prev.filter((m) => m.itemId !== id));
    })();
  };

  const addCategory = (name: string) => {
    void (async () => {
      const created = await api<ItemCategory>("/inventory/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setCategories((prev) => [...prev, created]);
    })();
  };

  const updateCategory = (id: string, name: string) => {
    void (async () => {
      const saved = await api<ItemCategory>(`/inventory/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setCategories((prev) => prev.map((c) => (c.id === id ? saved : c)));
    })();
  };

  const deleteCategory = (id: string) => {
    void (async () => {
      await api(`/inventory/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    })();
  };

  const addUnit = (name: string) => {
    void (async () => {
      const created = await api<ItemUnit>("/inventory/units", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setUnits((prev) => [...prev, created]);
    })();
  };

  const updateUnit = (id: string, name: string) => {
    void (async () => {
      const saved = await api<ItemUnit>(`/inventory/units/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setUnits((prev) => prev.map((u) => (u.id === id ? saved : u)));
    })();
  };

  const deleteUnit = (id: string) => {
    void (async () => {
      await api(`/inventory/units/${id}`, { method: "DELETE" });
      setUnits((prev) => prev.filter((u) => u.id !== id));
    })();
  };

  const addCustomer = (customer: Omit<Customer, "id">) => {
    void (async () => {
      const created = await api<Customer>("/inventory/customers", {
        method: "POST",
        body: JSON.stringify(customer),
      });
      setCustomers((prev) => [...prev, created]);
    })();
  };

  const updateCustomer = (id: string, data: Partial<Omit<Customer, "id">>) => {
    void (async () => {
      const saved = await api<Customer>(`/inventory/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setCustomers((prev) => prev.map((c) => (c.id === id ? saved : c)));
    })();
  };

  const deleteCustomer = (id: string) => {
    void (async () => {
      await api(`/inventory/customers/${id}`, { method: "DELETE" });
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    })();
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        categories,
        units,
        movements,
        customers,
        isLoading,
        refresh,
        issueStock,
        receiveStock,
        updateMovement,
        deleteMovement,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        updateCategory,
        deleteCategory,
        addUnit,
        updateUnit,
        deleteUnit,
        addCustomer,
        updateCustomer,
        deleteCustomer,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
