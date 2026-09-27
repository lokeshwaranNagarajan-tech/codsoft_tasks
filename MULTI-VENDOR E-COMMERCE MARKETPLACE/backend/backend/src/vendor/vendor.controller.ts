import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VendorService } from './vendor.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vendor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR) // Enforce RBAC: Only VENDORS can access all endpoints in this controller
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  /**
   * POST /vendor/products
   * Create a new catalog product (with optional multipart S3 image upload)
   */
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async createProduct(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    return this.vendorService.createProduct(userId, dto, file);
  }

  /**
   * GET /vendor/products
   * List all products belonging to the authenticated vendor
   */
  @Get('products')
  async getProducts(@CurrentUser('id') userId: string) {
    return this.vendorService.getProducts(userId);
  }

  /**
   * GET /vendor/products/:id
   * Get specific product with vendor ownership validation
   */
  @Get('products/:id')
  async getProductById(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
  ) {
    return this.vendorService.getProductById(userId, productId);
  }

  /**
   * PATCH /vendor/products/:id
   * Update product metadata, pricing, or specifications
   */
  @Patch('products/:id')
  async updateProduct(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.vendorService.updateProduct(userId, productId, dto);
  }

  /**
   * PATCH /vendor/products/:id/inventory
   * Quickly update or increment/decrement stock quantity
   */
  @Patch('products/:id/inventory')
  async updateInventory(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.vendorService.updateInventory(userId, productId, dto);
  }

  /**
   * DELETE /vendor/products/:id
   * Delete product and purge cached references and S3 images
   */
  @Delete('products/:id')
  async deleteProduct(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
  ) {
    return this.vendorService.deleteProduct(userId, productId);
  }

  /**
   * GET /vendor/orders
   * View orders that include products sold by this vendor
   */
  @Get('orders')
  async getOrders(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.vendorService.getOrders(userId, status);
  }

  /**
   * PATCH /vendor/orders/:id/status
   * Update order fulfillment status (Processing, Shipped, Delivered)
   */
  @Patch('orders/:id/status')
  async updateOrderStatus(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.vendorService.updateOrderStatus(userId, orderId, dto);
  }

  /**
   * GET /vendor/revenue
   * View vendor statistics: gross revenue, platform commission, net payout
   */
  @Get('revenue')
  async getRevenue(@CurrentUser('id') userId: string) {
    return this.vendorService.getRevenueAnalytics(userId);
  }
}
