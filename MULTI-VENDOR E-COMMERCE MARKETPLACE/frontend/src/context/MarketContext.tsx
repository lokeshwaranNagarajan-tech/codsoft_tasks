'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, Promotion, Vendor } from '@/types/market';
import { ordersApi, promotionsApi, vendorsApi } from '@/services/api';
import { INITIAL_VENDORS } from '@/services/mockData';

interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

interface MarketContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSummary: CartSummary;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Comparison
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;

  // Orders & Tracking
  orders: Order[];
  refreshOrders: () => Promise<void>;
  placeOrder: (shippingInfo: any, paymentMethod: any) => Promise<Order>;
  activeTrackingOrder: Order | null;
  trackOrderById: (orderId: string) => Promise<boolean>;
  setActiveTrackingOrder: (order: Order | null) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;

  // Promotions
  appliedPromo: { code: string; discountPercent: number } | null;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;

  // Multi-Vendor switcher for demo / testing
  vendors: Vendor[];
  activeVendorId: string;
  setActiveVendorId: (id: string) => void;
  currentVendor: Vendor;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [activeVendorId, setActiveVendorId] = useState<string>('vendor-1');
  const isMounted = React.useRef(false);

  // Load initial cart and orders from storage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('markethub_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedCompare = localStorage.getItem('markethub_compare');
      if (savedCompare) setCompareList(JSON.parse(savedCompare));
    } catch (e) {
      console.error(e);
    }

    isMounted.current = true;
    refreshOrders();
    vendorsApi.getAll().then(setVendors);
  }, []);

  // Save cart changes after mount
  useEffect(() => {
    if (!isMounted.current) return;
    try {
      localStorage.setItem('markethub_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save comparison changes after mount
  useEffect(() => {
    if (!isMounted.current) return;
    try {
      localStorage.setItem('markethub_compare', JSON.stringify(compareList));
    } catch (e) {
      console.error(e);
    }
  }, [compareList]);

  const refreshOrders = async () => {
    const list = await ordersApi.getAll();
    setOrders(list);
    if (!activeTrackingOrder && list.length > 0) {
      setActiveTrackingOrder(list[0]);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(next[existingIndex].quantity + quantity, product.stock),
        };
        return next;
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  // Cart financial summary calculations
  const cartSummary = React.useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    // Shipping logic: Free shipping if item qualifies, else max single vendor fee
    const shipping = cart.every(i => i.product.shipping.freeShipping) || cart.length === 0
      ? 0
      : 12.00;
    const discount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = taxableSubtotal * 0.08; // 8% sales tax
    const total = Math.max(0, taxableSubtotal + shipping + tax);
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount,
    };
  }, [cart, appliedPromo]);

  // Product Comparison
  const addToCompare = (product: Product): boolean => {
    if (compareList.length >= 4) {
      alert('You can compare a maximum of 4 products simultaneously.');
      return false;
    }
    if (compareList.some(p => p.id === product.id)) {
      removeFromCompare(product.id);
      return false;
    }
    setCompareList(prev => [...prev, product]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(p => p.id !== productId));
  };

  const clearCompare = () => setCompareList([]);

  const isComparing = (productId: string) => compareList.some(p => p.id === productId);

  // Promo Code
  const applyPromoCode = async (code: string) => {
    const result = await promotionsApi.validateCoupon(code, cartSummary.subtotal);
    if (result.valid) {
      setAppliedPromo({ code, discountPercent: result.discountPercent });
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message };
  };

  const removePromoCode = () => setAppliedPromo(null);

  // Place Order
  const placeOrder = async (shippingInfo: any, paymentMethod: any): Promise<Order> => {
    const items = cart.map(item => ({
      productId: item.product.id,
      productTitle: item.product.title,
      productImage: item.product.images[0],
      vendorId: item.product.vendorId,
      vendorName: item.product.vendor.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const orderPayload: Partial<Order> = {
      customerName: shippingInfo.fullName,
      customerEmail: shippingInfo.email || 'customer@markethub.com',
      customerPhone: shippingInfo.phone,
      shippingAddress: shippingInfo,
      items,
      subtotal: cartSummary.subtotal,
      shippingFee: cartSummary.shipping,
      tax: cartSummary.tax,
      discount: cartSummary.discount,
      total: cartSummary.total,
      paymentMethod,
    };

    const createdOrder = await ordersApi.create(orderPayload);
    await refreshOrders();
    clearCart();
    setActiveTrackingOrder(createdOrder);
    setIsTrackingModalOpen(true);
    return createdOrder;
  };

  const trackOrderById = async (orderId: string): Promise<boolean> => {
    const found = await ordersApi.getById(orderId);
    if (found) {
      setActiveTrackingOrder(found);
      setIsTrackingModalOpen(true);
      return true;
    }
    return false;
  };

  const currentVendor = vendors.find(v => v.id === activeVendorId) || vendors[0];

  return (
    <MarketContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSummary,
        isCartOpen,
        setIsCartOpen,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        isCompareOpen,
        setIsCompareOpen,
        orders,
        refreshOrders,
        placeOrder,
        activeTrackingOrder,
        trackOrderById,
        setActiveTrackingOrder,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        vendors,
        activeVendorId,
        setActiveVendorId,
        currentVendor,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}
