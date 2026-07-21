export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;       // Giá bán
  costPrice?: number;  // Giá vốn
  quantity: number;
  image: string;
}