export class OrderItemDto {
  productId: string;
  quantity: number;
}

export class ShippingAddressDto {
  fullName: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export class CreateOrderDto {
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: 'credit_card' | 'upi' | 'cod' | 'escrow';
  couponCode?: string;
}
