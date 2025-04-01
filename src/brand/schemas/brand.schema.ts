import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { locales } from 'src/i18n/constants';

export type BrandDocument = HydratedDocument<Brand>;

@Schema({ timestamps: true })
export class Brand {
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

const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.plugin(mongooseI18n, {
  locales,
});

export { BrandSchema };
