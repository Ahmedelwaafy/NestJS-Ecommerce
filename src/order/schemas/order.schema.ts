import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Cart } from 'src/cart/schemas/cart.schema';
import { OrderStatus, PaymentMethod } from '../enums';
import { IPaymentDetails, IShippingAddress } from '../interfaces';

export type OrderDocument = HydratedDocument<Order>;

@Schema()
class OrderItem {
  @Prop({
    type: Object,
    required: true,
  })
  product: {
    _id: string;
    name: string;
    price: number;
    priceAfterDiscount: number;
    image: string;
  };

  @Prop({
    type: Number,
    required: true,
    min: 1,
  })
  quantity: number;

  @Prop({
    type: String,
    default: '',
  })
  color: string;

  @Prop({
    type: String,
    default: '',
  })
  size: string;

  @Prop({
    type: Number,
  })
  itemTotalPrice: number;
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({
    type: [OrderItem],
    required: true,
  })
  orderItems: OrderItem[];

  @Prop({
    type: Number,
    required: true,
  })
  totalItems: number;

  @Prop({
    type: Number,
    required: true,
  })
  subtotal: number;

  @Prop({
    type: Number,
    default: 0,
  })
  discount: number;

  @Prop({
    type: Number,
    default: 0,
  })
  shippingCost: number;

  @Prop({
    type: Number,
    default: 0,
  })
  tax: number;

  @Prop({
    type: Number,
    required: true,
  })
  finalTotal: number;

  @Prop({
    type: String,
    enum: PaymentMethod,
    required: true,
  })
  paymentMethod: PaymentMethod;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({
    type: Object,
    default: null,
  })
  paymentDetails: IPaymentDetails;

  @Prop({
    type: MongooseSchema.Types.Mixed, // Can be either object or string
  })
  shippingAddress?: IShippingAddress | string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: typeof User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Cart.name,
  })
  cart: typeof Cart;

  @Prop({
    type: Date,
    default: null,
  })
  paidAt: Date;

  @Prop({
    type: Date,
    default: null,
  })
  deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for common queries
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'paymentDetails.sessionId': 1 });
