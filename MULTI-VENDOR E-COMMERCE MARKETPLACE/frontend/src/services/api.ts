import {
  Product,
  Vendor,
  Order,
  Promotion,
  VendorStats,
  OrderDeliveryStatus,
  FilterState,
} from '@/types/market';
import {
  INITIAL_PRODUCTS,
  INITIAL_VENDORS,
  INITIAL_ORDERS,
  INITIAL_PROMOTIONS,
  VENDOR_STATS_MOCK,
} from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper for local state persistence when NestJS backend is offline
const STORAGE_KEYS = {
  PRODUCTS: 'markethub_products',
  ORDERS: 'markethub_orders',
  PROMOTIONS: 'markethub_promotions',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to store in local storage', err);
  }
}

// Check if actual NestJS backend is reachable
async function tryFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  // If no external NestJS URL is configured, use local database immediately
  if (!API_BASE_URL) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return (await res.json()) as T;
    }
    return null;
  } catch {
    return null; // Gracefully fallback to mock database
  }
}

// Products API
export const productsApi = {
  async getAll(filters?: Partial<FilterState>): Promise<Product[]> {
    const remote = await tryFetch<Product[]>('/products');
    let products: Product[] = remote || getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        products = products.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.vendor.name.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      if (filters.category && filters.category !== 'All') {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.vendorId && filters.vendorId !== 'all') {
        products = products.filter(p => p.vendorId === filters.vendorId);
      }
      if (filters.minPrice !== undefined) {
        products = products.filter(p => p.price >= (filters.minPrice ?? 0));
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => p.price <= (filters.maxPrice ?? 99999));
      }
      if (filters.minRating !== undefined && filters.minRating > 0) {
        products = products.filter(p => p.rating >= (filters.minRating ?? 0));
      }
      if (filters.inStockOnly) {
        products = products.filter(p => p.stock > 0);
      }
      if (filters.sortBy) {
        if (filters.sortBy === 'price-asc') {
          products.sort((a, b) => a.price - b.price);
        } else if (filters.sortBy === 'price-desc') {
          products.sort((a, b) => b.price - a.price);
        } else if (filters.sortBy === 'rating') {
          products.sort((a, b) => b.rating - a.rating);
        } else if (filters.sortBy === 'newest') {
          products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
    }

    return products;
  },

  async getById(id: string): Promise<Product | null> {
    const remote = await tryFetch<Product>(`/products/${id}`);
    if (remote) return remote;
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return products.find(p => p.id === id) || null;
  },

  async getByVendor(vendorId: string): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(p => p.vendorId === vendorId);
  },

  async create(newProduct: Partial<Product>): Promise<Product> {
    const remote = await tryFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    });
    if (remote) return remote;

    const current = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const vendor = INITIAL_VENDORS.find(v => v.id === newProduct.vendorId) || INITIAL_VENDORS[0];
    
    const created: Product = {
      id: `prod-${Date.now()}`,
      vendorId: newProduct.vendorId || vendor.id,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        verified: vendor.verified,
        location: vendor.location,
      },
      title: newProduct.title || 'Untitled Product',
      slug: (newProduct.title || 'product').toLowerCase().replace(/\s+/g, '-'),
      description: newProduct.description || '',
      price: Number(newProduct.price) || 99,
      compareAtPrice: newProduct.compareAtPrice ? Number(newProduct.compareAtPrice) : undefined,
      currency: 'USD',
      sku: newProduct.sku || `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
      category: newProduct.category || 'Electronics',
      subCategory: newProduct.subCategory || 'General',
      tags: newProduct.tags || ['new'],
      stock: Number(newProduct.stock) || 10,
      images: newProduct.images?.length ? newProduct.images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 5.0,
      reviewCount: 0,
      featured: Boolean(newProduct.featured),
      status: newProduct.status || 'active',
      specifications: newProduct.specifications || {},
      shipping: newProduct.shipping || {
        freeShipping: true,
        estimatedDays: '2-4 Days',
        cost: 0,
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...current];
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return created;
  },

  async update(id: string, patch: Partial<Product>): Promise<Product | null> {
    const remote = await tryFetch<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (remote) return remote;

    const current = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const index = current.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProduct = { ...current[index], ...patch };
    current[index] = updatedProduct;
    setStored(STORAGE_KEYS.PRODUCTS, current);
    return updatedProduct;
  },

  async delete(id: string): Promise<boolean> {
    const remote = await tryFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' });
    if (remote?.success) return true;

    const current = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const filtered = current.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },
};

// Vendors API
export const vendorsApi = {
  async getAll(): Promise<Vendor[]> {
    const remote = await tryFetch<Vendor[]>('/vendors');
    return remote || INITIAL_VENDORS;
  },

  async getById(id: string): Promise<Vendor | null> {
    const remote = await tryFetch<Vendor>(`/vendors/${id}`);
    if (remote) return remote;
    return INITIAL_VENDORS.find(v => v.id === id) || null;
  },

  async getStats(vendorId: string): Promise<VendorStats> {
    const remote = await tryFetch<VendorStats>(`/vendors/${vendorId}/stats`);
    if (remote) return remote;
    return (
      VENDOR_STATS_MOCK[vendorId] || {
        vendorId,
        totalRevenue: 24500,
        revenueGrowth: 11.2,
        activeOrders: 14,
        totalProducts: 9,
        lowStockCount: 1,
        averageRating: 4.8,
        totalReviews: 240,
        fulfillmentRate: 98.7,
        monthlyRevenue: [
          { month: 'Apr', revenue: 3000, orders: 15 },
          { month: 'May', revenue: 3500, orders: 20 },
          { month: 'Jun', revenue: 4200, orders: 25 },
          { month: 'Jul', revenue: 4900, orders: 30 },
          { month: 'Aug', revenue: 5300, orders: 35 },
          { month: 'Sep', revenue: 5800, orders: 40 },
        ],
      }
    );
  },
};

// Orders API
export const ordersApi = {
  async getAll(vendorId?: string): Promise<Order[]> {
    const remote = await tryFetch<Order[]>('/orders');
    let orders = remote || getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (vendorId && vendorId !== 'all') {
      orders = orders.filter(o => o.items.some(item => item.vendorId === vendorId));
    }
    return orders;
  },

  async getById(id: string): Promise<Order | null> {
    const remote = await tryFetch<Order>(`/orders/${id}`);
    if (remote) return remote;
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find(o => o.id === id) || null;
  },

  async create(orderPayload: Partial<Order>): Promise<Order> {
    const remote = await tryFetch<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });
    if (remote) return remote;

    const currentOrders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderId = `MH-ORD-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newOrder: Order = {
      id: orderId,
      customerName: orderPayload.customerName || 'Lokesh Sharma',
      customerEmail: orderPayload.customerEmail || 'customer@markethub.com',
      customerPhone: orderPayload.customerPhone || '+1 (555) 234-5678',
      shippingAddress: orderPayload.shippingAddress || {
        fullName: 'Lokesh Sharma',
        addressLine1: '450 Innovation Parkway, Suite 100',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'United States',
        phone: '+1 (555) 234-5678',
      },
      items: orderPayload.items || [],
      subtotal: orderPayload.subtotal || 0,
      shippingFee: orderPayload.shippingFee || 0,
      tax: orderPayload.tax || 0,
      discount: orderPayload.discount || 0,
      total: orderPayload.total || 0,
      paymentMethod: orderPayload.paymentMethod || 'credit_card',
      paymentStatus: 'paid',
      status: 'confirmed',
      tracking: {
        orderId,
        carrier: 'DHL Express Verified',
        trackingNumber: `DHL-${Math.floor(Math.random() * 900000000 + 100000000)}`,
        status: 'confirmed',
        estimatedDelivery: '3-4 Business Days',
        currentLocation: 'MarketHub Central Hub',
        checkpoints: [
          {
            id: `cp-${Date.now()}-1`,
            title: 'Order Placed & Payment Escrowed',
            location: 'MarketHub Secure Payment Hub',
            timestamp: 'Just now',
            completed: true,
            description: 'Funds held in trust until vendor dispatch confirmation.',
          },
          {
            id: `cp-${Date.now()}-2`,
            title: 'Notified Vendors for Dispatch',
            location: 'Vendor Warehouses',
            timestamp: 'In Progress',
            completed: false,
            description: 'Sellers are preparing your items.',
          },
          {
            id: `cp-${Date.now()}-3`,
            title: 'Courier Linehaul Transit',
            location: 'Distribution Network',
            timestamp: 'Estimated: Tomorrow',
            completed: false,
          },
          {
            id: `cp-${Date.now()}-4`,
            title: 'Delivered',
            location: 'Destination Address',
            timestamp: 'Estimated: 3-4 Days',
            completed: false,
          },
        ],
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [newOrder, ...currentOrders];
    setStored(STORAGE_KEYS.ORDERS, updated);
    return newOrder;
  },

  async updateStatus(id: string, status: OrderDeliveryStatus): Promise<Order | null> {
    const remote = await tryFetch<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (remote) return remote;

    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    orders[index].status = status;
    orders[index].tracking.status = status;

    // Update or add checkpoint
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cpIndex = orders[index].tracking.checkpoints.findIndex(c =>
      c.title.toLowerCase().includes(status.replace(/_/g, ' '))
    );
    if (cpIndex !== -1) {
      orders[index].tracking.checkpoints[cpIndex].completed = true;
      orders[index].tracking.checkpoints[cpIndex].timestamp = `Today, ${nowStr}`;
    }

    setStored(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  },
};

// Promotions API
export const promotionsApi = {
  async getByVendor(vendorId: string): Promise<Promotion[]> {
    const remote = await tryFetch<Promotion[]>(`/vendors/${vendorId}/promotions`);
    if (remote) return remote;

    const promotions = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    return promotions.filter(p => p.vendorId === vendorId);
  },

  async create(promo: Partial<Promotion>): Promise<Promotion> {
    const remote = await tryFetch<Promotion>('/promotions', {
      method: 'POST',
      body: JSON.stringify(promo),
    });
    if (remote) return remote;

    const current = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      vendorId: promo.vendorId || 'vendor-1',
      code: (promo.code || 'PROMO10').toUpperCase().trim(),
      description: promo.description || 'Special multi-vendor promotional discount',
      discountPercent: Number(promo.discountPercent) || 10,
      minOrderAmount: Number(promo.minOrderAmount) || 50,
      status: 'active',
      startDate: promo.startDate || new Date().toISOString().split('T')[0],
      endDate: promo.endDate || '2026-12-31',
      usageCount: 0,
      maxUses: Number(promo.maxUses) || 100,
    };

    const updated = [newPromo, ...current];
    setStored(STORAGE_KEYS.PROMOTIONS, updated);
    return newPromo;
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountPercent: number; message: string }> {
    const promotions = getStored<Promotion[]>(STORAGE_KEYS.PROMOTIONS, INITIAL_PROMOTIONS);
    const match = promotions.find(p => p.code.toUpperCase() === code.toUpperCase().trim() && p.status === 'active');

    if (!match) {
      return { valid: false, discountPercent: 0, message: 'Invalid or expired coupon code' };
    }
    if (subtotal < match.minOrderAmount) {
      return {
        valid: false,
        discountPercent: 0,
        message: `Requires minimum order of $${match.minOrderAmount}`,
      };
    }
    return {
      valid: true,
      discountPercent: match.discountPercent,
      message: `Promo applied: ${match.discountPercent}% off!`,
    };
  },
};
