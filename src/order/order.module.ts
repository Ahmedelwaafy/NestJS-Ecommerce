import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { SettingModule } from '../setting/setting.module';
import { StripeProvider } from './providers/stripe.provider';
import { OrderUtilsProvider } from './providers/order-utils.provider';
import { PaymobProvider } from './providers/paymob.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartModule,
    ProductModule,
    UserModule,
    SettingModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, StripeProvider, PaymobProvider, OrderUtilsProvider],
  exports: [OrderService],
})
export class OrderModule {}
