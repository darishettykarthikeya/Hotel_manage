import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, FoodItem } from '../api/types';

interface CartContextValue {
  cart: CartLine[];
  addToCart: (food: FoodItem) => void;
  decrement: (foodItemId: number) => void;
  removeFromCart: (foodItemId: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);

  function addToCart(food: FoodItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.foodItemId === food.id);
      if (existing) {
        return prev.map((l) =>
          l.foodItemId === food.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { foodItemId: food.id, name: food.name, price: food.price, quantity: 1 }];
    });
  }

  function decrement(foodItemId: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.foodItemId === foodItemId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeFromCart(foodItemId: number) {
    setCart((prev) => prev.filter((l) => l.foodItemId !== foodItemId));
  }

  function clearCart() {
    setCart([]);
  }

  const totalItems = useMemo(() => cart.reduce((sum, l) => sum + l.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, l) => sum + l.price * l.quantity, 0), [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, decrement, removeFromCart, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
