import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { locales } from 'src/i18n/constants';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: true,
    unique: true,
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

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  deletedAt: Date;
}

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.plugin(mongooseI18n, {
  locales,
});

export { CategorySchema };
