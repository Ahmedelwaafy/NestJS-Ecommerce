import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { Category } from 'src/category/schemas/category.schema';
import { locales } from 'src/i18n/constants';

export type SubCategoryDocument = HydratedDocument<SubCategory>;

@Schema({ timestamps: true })
export class SubCategory {
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
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: Category.name,
  })
  category: string;

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

const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

SubCategorySchema.plugin(mongooseI18n, {
  locales,
});

export { SubCategorySchema };
