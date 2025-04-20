import { Module } from '@nestjs/common';
import { ProductRequestService } from './product-request.service';
import { ProductRequestController } from './product-request.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductRequest,
  ProductRequestSchema,
} from './schemas/product-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductRequest.name, schema: ProductRequestSchema },
    ]),
  ],
  controllers: [ProductRequestController],
  providers: [ProductRequestService],
})
export class ProductRequestModule {}
