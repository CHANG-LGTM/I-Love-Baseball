export interface Product {
  id: number;
  name: string;
  description: string;
  originalPrice: number;
  discountPercent?: number; // Optional discount percentage
  category: string;
  image?: string;
  }