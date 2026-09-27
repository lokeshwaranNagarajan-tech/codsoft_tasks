export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  rating: number;
  reviewCount: number;
  joinedDate: string;
  verified: boolean;
  location: string;
  description: string;
  responseRate: string;
  shippingSpeed: string;
  badge: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    location: string;
  };
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  sku: string;
  category: string;
  subCategory?: string;
  tags: string[];
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  specifications: Record<string, string>;
  shipping: {
    freeShipping: boolean;
    estimatedDays: string;
    cost: number;
  };
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderDeliveryStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface TrackingCheckpoint {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  description?: string;
}

export interface DeliveryTracking {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: OrderDeliveryStatus;
  estimatedDelivery: string;
  currentLocation: string;
  checkpoints: TrackingCheckpoint[];
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  vendorId: string;
  vendorName: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'credit_card' | 'upi' | 'cod' | 'escrow';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  status: OrderDeliveryStatus;
  tracking: DeliveryTracking;
  createdAt: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface VendorStats {
  vendorId: string;
  totalRevenue: number;
  revenueGrowth: number;
  activeOrders: number;
  totalProducts: number;
  lowStockCount: number;
  averageRating: number;
  totalReviews: number;
  fulfillmentRate: number;
  monthlyRevenue: MonthlyRevenue[];
}

export interface Promotion {
  id: string;
  vendorId: string;
  code: string;
  description: string;
  discountPercent: number;
  minOrderAmount: number;
  status: 'active' | 'scheduled' | 'expired';
  startDate: string;
  endDate: string;
  usageCount: number;
  maxUses: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  vendorId: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
