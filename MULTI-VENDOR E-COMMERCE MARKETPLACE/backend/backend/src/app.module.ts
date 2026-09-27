import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { S3Module } from './common/s3/s3.module';
import { VendorModule } from './vendor/vendor.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    S3Module,
    VendorModule,
    CustomerModule,
  ],
})
export class AppModule {}
