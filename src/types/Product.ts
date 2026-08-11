export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;       // Giá bán
  costPrice?: number;  // Giá vốn
  quantity: number;
  image: string;
}