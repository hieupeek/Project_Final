export interface OrderItem {
  productId: number | string;
  name: string;
  price: number;       // Giá bán
  costPrice?: number;  // Giá vốn
  quantity: number;
  subtotal: number;    // Tổng tiền bán = price * quantity
  costSubtotal?: number; // Tổng giá vốn = costPrice * quantity
  profit?: number;     // Lợi nhuận = subtotal - costSubtotal
}
