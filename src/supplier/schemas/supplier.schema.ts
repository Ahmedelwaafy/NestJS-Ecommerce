import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { locales } from 'src/i18n/constants';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema({ timestamps: true })
export class Supplier {
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
    type: String,
  })
  website?: string;

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

const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.plugin(mongooseI18n, {
  locales,
});

export { SupplierSchema };
