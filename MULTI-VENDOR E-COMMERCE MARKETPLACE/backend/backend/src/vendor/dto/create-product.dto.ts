export class CreateProductDto {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku: string;
  category: string;
  images?: string[];
  specifications?: Record<string, string>;
}
