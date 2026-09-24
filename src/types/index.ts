export type CustomerTier = 'normal' | 'silver' | 'gold' | 'platinum';

export type ProductCategory = 
  | 'leafy_greens' 
  | 'veggies' 
  | 'rice_bags' 
  | 'organic_specials';

export type ProductUnit = 'kg' | '500g' | 'bag' | 'bunch' | 'bottle';

export interface Address {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isCurrentForDelivery: boolean;
}

export interface UserProfile {
  uid: string;
  phone: string;
  name: string;
  email: string;
  role: 'customer' | 'owner';
  addresses: Record<string, Address>;
  activeAddressId: string;
  tierStatus: CustomerTier;
  monthlyOrderCount: number;
  totalOrdersCount: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  stockQuantity: number;
  isDisabled: boolean;
  imageUrl: string; // Royalty-free Unsplash image source
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'DISPATCHED' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface OrderItemRecord {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: ProductUnit;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerTier: CustomerTier;
  items: OrderItemRecord[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'COD';
  status: OrderStatus;
  deliveryDate: string; // YYYY-MM-DD
  deliverySlot: string; // strictly 8:00 AM - 11:59 AM
  deliveryAddress: Address;
  placedAt: string; // ISO string
}

export interface DeliverySlotOption {
  id: string;
  title: string;
  timeRange: string;
  isAvailable: boolean;
}
