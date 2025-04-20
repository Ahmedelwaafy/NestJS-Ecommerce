import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type ProductRequestDocument = HydratedDocument<ProductRequest>;

@Schema({ timestamps: true })
export class ProductRequest {
  @Prop({
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  })
  name: string;

  @Prop({
    type: String,
    minlength: 2,
    maxlength: 150,
    required: true,
  })
  description: string;

  @Prop({
    type: String,
    minlength: 1,
    maxlength: 50,
    required: true,
  })
  quantity: string;

  @Prop({
    type: String,
    minlength: 1,
    maxlength: 50,
  })
  category: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isAvailable: boolean; //updated by the admin when the product becomes available
}

export const ProductRequestSchema = SchemaFactory.createForClass(ProductRequest);
