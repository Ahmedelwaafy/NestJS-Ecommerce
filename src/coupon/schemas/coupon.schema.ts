import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({
    required: true,
    unique: true,
    type: String,
    maxlength: 50,
    minlength: 3,
  })
  code: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 100,
  })
  discount: number;

  @Prop({
    type: Date,
    required: true,
    default: null,
    min: new Date(),
  })
  expirationDate: Date;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @Prop({
    type: Number,
    required: false,
    default: null,
  })
  minOrderTotal?: number;

  @Prop({
    type: Number,
    required: false,
    default: null,
  })
  maxDiscount?: number;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
