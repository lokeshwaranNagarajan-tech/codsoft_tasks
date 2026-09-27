import * as fs from 'fs';
import * as path from 'path';

// Load .env automatically without external package
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {}

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('MarketHubBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js frontend (http://localhost:3000)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API Prefix: /api
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`MarketHub Backend Service is running on: http://localhost:${port}/api`);
  logger.log(`Customer Endpoints: http://localhost:${port}/api/customer/products`);
  logger.log(`Vendor Endpoints:   http://localhost:${port}/api/vendor/products`);
}
bootstrap();
