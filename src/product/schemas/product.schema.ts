import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { Brand } from 'src/brand/schemas/brand.schema';
import { Category } from 'src/category/schemas/category.schema';
import { locales } from 'src/i18n/constants';
import { SubCategory } from 'src/sub-category/schemas/sub-category.schema';
import { Supplier } from 'src/supplier/schemas/supplier.schema';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: String,
    required: true,
    min: [3, 'Title must be at least 3 characters'],
    i18n: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    min: [20, 'Description must be at least 20 characters'],
    i18n: true,
  })
  description: string;

  @Prop({
    type: Number,
    required: true,
    min: [1, 'Price must be at least 1 L.E'],
    max: [20000, 'Price must be at least 20000 L.E'],
  })
  price: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Category.name,
  })
  category: string;

  @Prop({
    type: Number,
    required: true,
    default: 1,
    min: [1, 'quantity must be at least 1'],
  })
  quantity: number;

  @Prop({
    type: Number,
    default: 5,
    min: [1, 'maxQuantityPerOrder must be at least 1'],
  })
  maxQuantityPerOrder?: number;

  @Prop({
    type: String,
    required: true,
  })
  imageCover: string;

  @Prop({
    type: Array,
    required: false,
  })
  images: string[];

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  sold: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
    max: [20000, 'Price must be at least 20000 L.E'],
  })
  priceAfterDiscount: number;

  @Prop({
    type: Array,
    required: false,
  })
  colors: string[];

  @Prop({
    type: Array,
    required: false,
  })
  sizes: string[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: SubCategory.name,
  })
  subCategory: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: Brand.name,
  })
  brand: string;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  ratingsAverage: number;

  @Prop({
    type: Number,
    required: false,
    default: 0,
  })
  ratingsQuantity: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: Supplier.name,
  })
  supplier?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;
}

const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.plugin(mongooseI18n, {
  locales,
});

export { ProductSchema };
