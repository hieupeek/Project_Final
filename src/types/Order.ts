import type { OrderItem } from "./OrderItem";

export interface Order {
  id?: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  employeeId: string;
  employeeName: string;
}
