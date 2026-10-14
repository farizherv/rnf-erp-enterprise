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
  itemGroup?: string;
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

export interface Vendor {
  id: string;
  name: string;
}

export interface ItemGroup {
  id: string;
  name: string;
}

export type MovementType = "IN" | "OUT" | "EXCHANGE_OUT" | "EXCHANGE_IN";

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: MovementType | string;
  quantity: number;
  reference: string;
  notes?: string;
  part_number?: string;
  item_group?: string;
  po_number?: string;
  vendor?: string;
  price_each?: number;
  tax_type?: string;
  price_total?: number;
}

interface InventorySnapshot {
  items: InventoryItem[];
  categories: ItemCategory[];
  units: ItemUnit[];
  customers: Customer[];
  vendors: Vendor[];
  itemGroups: ItemGroup[];
  movements: StockMovement[];
}

interface InventoryContextType {
  items: InventoryItem[];
  categories: ItemCategory[];
  units: ItemUnit[];
  movements: StockMovement[];
  customers: Customer[];
  vendors: Vendor[];
  itemGroups: ItemGroup[];
  isLoading: boolean;
  refresh: () => Promise<void>;

  issueStock: (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
    extraData?: Partial<StockMovement>
  ) => Promise<StockMovement>;
  receiveStock: (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
    extraData?: Partial<StockMovement>
  ) => Promise<StockMovement>;
  updateMovement: (
    movId: string,
    data: { itemId: string; quantity: number; date: string } & Partial<StockMovement>,
  ) => Promise<StockMovement>;
  deleteMovement: (movId: string) => Promise<void>;

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

  addVendor: (name: string) => void;
  updateVendor: (id: string, name: string) => void;
  deleteVendor: (id: string) => void;

  addItemGroup: (name: string) => void;
  updateItemGroup: (id: string, name: string) => void;
  deleteItemGroup: (id: string) => void;
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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const applySnapshot = (data: InventorySnapshot) => {
    setItems(data.items);
    setCategories(data.categories);
    setUnits(data.units);
    setCustomers(data.customers || []);
    setVendors(data.vendors || []);
    setItemGroups(data.itemGroups || []);
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

  const issueStock = async (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
    extraData?: Partial<StockMovement>
  ): Promise<StockMovement> => {
    const result = await api<{
      movement: StockMovement;
      item: InventoryItem;
    }>("/inventory/movements/out", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity, reference, date, ...extraData }),
    });
    setItems((prev) =>
      prev.map((item) => (item.id === result.item.id ? result.item : item)),
    );
    setMovements((prev) => [result.movement, ...prev]);
    return result.movement;
  };

  const receiveStock = async (
    itemId: string,
    quantity: number,
    reference: string,
    date: string,
    extraData?: Partial<StockMovement>
  ): Promise<StockMovement> => {
    const result = await api<{
      movement: StockMovement;
      item: InventoryItem;
    }>("/inventory/movements/in", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity, reference, date, ...extraData }),
    });
    setItems((prev) =>
      prev.map((item) => (item.id === result.item.id ? result.item : item)),
    );
    setMovements((prev) => [result.movement, ...prev]);
    return result.movement;
  };

  const updateMovement = async (
    movId: string,
    data: { itemId: string; quantity: number; date: string } & Partial<StockMovement>,
  ): Promise<StockMovement> => {
    const result = await api<{
      movement: StockMovement;
      item: InventoryItem;
    }>(`/inventory/movements/${movId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    setItems((prev) =>
      prev.map((item) => (item.id === result.item.id ? result.item : item)),
    );
    setMovements((prev) =>
      prev.map((m) => (m.id === movId ? result.movement : m)),
    );
    return result.movement;
  };

  const deleteMovement = async (movId: string): Promise<void> => {
    await api(`/inventory/movements/${movId}`, { method: "DELETE" });
    await refresh();
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

  const addVendor = (name: string) => {
    void (async () => {
      const created = await api<Vendor>("/inventory/vendors", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setVendors((prev) => [...prev, created]);
    })();
  };

  const updateVendor = (id: string, name: string) => {
    void (async () => {
      const saved = await api<Vendor>(`/inventory/vendors/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setVendors((prev) => prev.map((v) => (v.id === id ? saved : v)));
    })();
  };

  const deleteVendor = (id: string) => {
    void (async () => {
      await api(`/inventory/vendors/${id}`, { method: "DELETE" });
      setVendors((prev) => prev.filter((v) => v.id !== id));
    })();
  };

  const addItemGroup = (name: string) => {
    void (async () => {
      const created = await api<ItemGroup>("/inventory/item-groups", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setItemGroups((prev) => [...prev, created]);
    })();
  };

  const updateItemGroup = (id: string, name: string) => {
    void (async () => {
      const saved = await api<ItemGroup>(`/inventory/item-groups/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setItemGroups((prev) => prev.map((g) => (g.id === id ? saved : g)));
    })();
  };

  const deleteItemGroup = (id: string) => {
    void (async () => {
      await api(`/inventory/item-groups/${id}`, { method: "DELETE" });
      setItemGroups((prev) => prev.filter((g) => g.id !== id));
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
        vendors,
        itemGroups,
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
        addVendor,
        updateVendor,
        deleteVendor,
        addItemGroup,
        updateItemGroup,
        deleteItemGroup,
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
