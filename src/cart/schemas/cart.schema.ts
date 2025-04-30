import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { CouponType } from 'src/coupon/enums/coupon-type.enum';
import { Coupon } from 'src/coupon/schemas/coupon.schema';
import { User } from 'src/user/schemas/user.schema';

export type CartCoupon = {
  code: string;
  type: string;
  discount: number;
  couponId: string;
};

export type CartDocument = HydratedDocument<Cart>;

// Create a separate schema for cart items for better organization
@Schema()
class CartItem {
  @Prop({
    type: Object,
    required: true,
  })
  product: {
    _id: string;
    name: string;
    description: string;
    maxQuantityPerOrder: number;
    price: number;
    priceAfterDiscount: number;
    image: string;
  };

  @Prop({
    type: Number,
    required: true,
    min: 1,
    default: 1,
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

@Schema({ timestamps: true })
export class Cart {
  @Prop({
    type: [CartItem],
    default: [],
  })
  cartItems: CartItem[];

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  totalCartItems: number;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  totalPrice: number;

  @Prop({
    type: Number,
  })
  totalPriceAfterDiscount?: number;

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
  })
  finalTotal: number;

  @Prop({
    type: [
      {
        code: {
          type: String,
        },
        type: {
          type: String,
          enum: CouponType,
        },
        discount: {
          type: Number,
        },
        couponId: {
          type: MongooseSchema.Types.ObjectId,
          ref: Coupon.name,
        },
      },
    ],
    default: [],
  })
  coupons: CartCoupon[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: typeof User;

  @Prop({
    type: Date,
    default: null,
  })
  expiresAt: Date;
}

// Add indexes for common queries
export const CartSchema = SchemaFactory.createForClass(Cart);

// For users viewing their own cart
CartSchema.index({ user: 1 });

// Compound index for user and active status
CartSchema.index({ user: 1, active: 1 });

// For expiration/cleanup operations
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
