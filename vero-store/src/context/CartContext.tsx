import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "../data/products";

export type CartOptions = {
  size?: string;
  colorId?: string;
};

export type CartLine = {
  key: string;
  productId: string;
  size?: string;
  colorId?: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: string, options?: CartOptions) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  itemCount: number;
  subtotal: number;
  hasPricedItems: boolean;
  enriched: Array<CartLine & { product: Product }>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vero-cart-v2";

function lineKey(productId: string, options?: CartOptions) {
  return `${productId}::${options?.colorId ?? "default"}::${options?.size ?? "default"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", isOpen);
  }, [isOpen]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const addItem = useCallback((productId: string, options?: CartOptions) => {
    const key = lineKey(productId, options);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [
        ...prev,
        {
          key,
          productId,
          size: options?.size,
          colorId: options?.colorId,
          qty: 1,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.key !== key);
      return prev.map((l) => (l.key === key ? { ...l, qty } : l));
    });
  }, []);

  const enriched = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProduct(line.productId);
          return product ? { ...line, product } : null;
        })
        .filter(Boolean) as Array<CartLine & { product: Product }>,
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines],
  );

  const hasPricedItems = useMemo(
    () => enriched.some((l) => typeof l.product.price === "number"),
    [enriched],
  );

  const subtotal = useMemo(
    () =>
      enriched.reduce(
        (sum, l) =>
          sum +
          (typeof l.product.price === "number"
            ? l.product.price * l.qty
            : 0),
        0,
      ),
    [enriched],
  );

  const value = useMemo(
    () => ({
      lines,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQty,
      itemCount,
      subtotal,
      hasPricedItems,
      enriched,
    }),
    [
      lines,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQty,
      itemCount,
      subtotal,
      hasPricedItems,
      enriched,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
