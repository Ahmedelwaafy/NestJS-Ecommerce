import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CouponType } from '../enums/coupon-type.enum';

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
    type: String,
    enum: CouponType,
    required: true,
  })
  type: string;

  @Prop({
    type: Number,
    required: true,
  })
  discount: number;

  @Prop({
    type: Date,
    required: true,
    default: null,
    min: new Date(),
  })
  expiresAt: Date;

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
