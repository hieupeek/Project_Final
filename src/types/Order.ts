import type { OrderItem } from "./OrderItem";

export interface Order {
  id?: string;
  items: OrderItem[];
  total: number;       // Tổng doanh thu bán
  totalCost?: number;  // Tổng giá vốn
  totalProfit?: number; // Tổng lợi nhuận
  createdAt: string;
  employeeId: string;
  employeeName: string;
}
