// /Users/webasebrandings/Downloads/new_far-main 2/src/Screen1/Shopping/ShoppingContent.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  stock?: number;
  description?: string;
  originalPrice?: number;
  discount?: number;
  category?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
  getCartTotal: () => 0,
  getCartItemsCount: () => 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { 
        ...product, 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import ProfessionalShoppingContent from './ProfessionalShoppingContent';

const ShoppingContent = () => {
  return <ProfessionalShoppingContent />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default ShoppingContent;

