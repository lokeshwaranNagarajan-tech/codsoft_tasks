export class ProductFilterDto {
  search?: string;
  category?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number = 1;
  limit?: number = 20;
}
