export class UpdateOrderStatusDto {
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}
