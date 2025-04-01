import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: true,
    type: String,
    maxlength: 100,
    minlength: 2,
    i18n: true,
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

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.plugin(mongooseI18n, {
  locales: ['en', 'ar'],
});

export { CategorySchema };
