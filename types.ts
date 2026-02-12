export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  recommended?: boolean;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  COMPLETED = 'COMPLETED',
  SERVED = 'SERVED',
}

export interface Order {
  id: string;
  customerName: string;
  tableNumber: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  contactLineId?: string;
  contactEmail?: string;
  syncedToSheet?: boolean;
  sentEmail?: boolean;
  sentLine?: boolean;
}

export interface RawMenuResponse {
  categories: {
    name: string;
    items: {
      name: string;
      price: number;
      description?: string;
      recommended?: boolean;
    }[];
  }[];
}

export interface StoreSettings {
  storeName: string;
  ownerEmail: string;
  googleSheetUrl: string;
  lineToken: string;
  enableEmailNotify: boolean;
  enableSheetSync: boolean;
  enableLineNotify: boolean;
  username?: string;
  password?: string;
}