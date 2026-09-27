import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ProductFilterDto } from './dto/product-filter.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * GET /customer/products
   * Public Product Discovery endpoint with Redis Cache-Aside Pattern
   */
  @Get('products')
  async discoverProducts(@Query() filters: ProductFilterDto) {
    return this.customerService.discoverProducts(filters);
  }

  /**
   * GET /customer/products/:id
   * Get single product specifications and vendor details (cached in Redis)
   */
  @Get('products/:id')
  async getProductById(@Param('id') productId: string) {
    return this.customerService.getProductById(productId);
  }

  /**
   * POST /customer/orders
   * Place a multi-vendor order with transactional stock decrement
   */
  @Post('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER) // RBAC: Only CUSTOMERS can place orders
  @HttpCode(HttpStatus.CREATED)
  async placeOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.customerService.placeOrder(customerId, dto);
  }

  /**
   * GET /customer/orders
   * View authenticated customer's order history
   */
  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  async getCustomerOrders(@CurrentUser('id') customerId: string) {
    return this.customerService.getCustomerOrders(customerId);
  }

  /**
   * GET /customer/orders/:id/track
   * Real-time GPS delivery tracking for customer consignments
   */
  @Get('orders/:id/track')
  async trackDelivery(@Param('id') orderId: string) {
    return this.customerService.trackDelivery(orderId);
  }
}
