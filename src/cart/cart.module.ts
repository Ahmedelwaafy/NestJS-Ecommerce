import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from 'src/product/product.module';
import { Cart, CartSchema } from './schemas/cart.schema';
import { UpdateCartProvider } from './providers/update-cart.provider';
import { CouponModule } from 'src/coupon/coupon.module';
import { CartUtilsProvider } from './providers/cart-utils.provider';
import { Product, ProductSchema } from 'src/product/schemas/product.schema';
import { Coupon, CouponSchema } from 'src/coupon/schemas/coupon.schema';
import { CartCouponProvider } from './providers/cart-coupon.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Coupon.name, schema: CouponSchema },
    ]),
    ProductModule,
    CouponModule,
  ],
  controllers: [CartController],
  providers: [
    CartService,
    UpdateCartProvider,
    CartUtilsProvider,
    CartCouponProvider,
  ],
  exports: [CartService],
})
export class CartModule {}
