import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: true,
    type: String,
    min: [3, 'Name must be at least 3 characters long.'],
    max: [30, 'Name must be at most 30 characters long.'],
  })
  name: string;

  @Prop({
    type: String,
  })
  image?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
