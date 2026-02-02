export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: StockStatus;
  image: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface RiderInfo {
  name: string;
  phone: string;
  arrivalTime: number; // minutes
  status: 'ASSIGNED' | 'ARRIVED' | 'WAITING';
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  rider?: RiderInfo;
  riderMessage?: string; // e.g., "5 min delay"
}

export enum Tab {
  ORDERS = 'ORDERS',
  INVENTORY = 'INVENTORY',
  INSIGHTS = 'INSIGHTS',
  SETTINGS = 'SETTINGS'
}