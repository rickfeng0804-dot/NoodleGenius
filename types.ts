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
  PENDING = 'PENDING',   // 顧客已點餐，等待結帳
  PAID = 'PAID',         // 已結帳，等待製作
  COOKING = 'COOKING',   // 製作中
  COMPLETED = 'COMPLETED', // 製作完成
  SERVED = 'SERVED',     // 已出餐
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
  googleScriptUrl: string;
  lineToken: string;
  enableEmailNotify: boolean;
  enableSheetSync: boolean;
  enableLineNotify: boolean;
  username?: string;
  password?: string;
}