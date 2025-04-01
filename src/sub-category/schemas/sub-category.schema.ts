import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { Category } from 'src/category/schemas/category.schema';

export type SubCategoryDocument = HydratedDocument<SubCategory>;

@Schema({ timestamps: true })
export class SubCategory {
  @Prop({
    required: true,
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
}

const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

SubCategorySchema.plugin(mongooseI18n, {
  locales: ['en', 'ar'],
});

export { SubCategorySchema };
