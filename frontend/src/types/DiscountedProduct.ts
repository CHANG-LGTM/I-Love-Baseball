export interface DiscountedProduct {
  id: number;
  name: string;
  description: string;
  originalPrice: number;
  discountPercent: number;
  category: string;
  imageUrl: string;
}