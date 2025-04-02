import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseI18n from 'mongoose-i18n-localize';
import { locales } from 'src/i18n/constants';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true })
export class Setting {
  @Prop({
    type: String,
    required: true,
    maxlength: 150,
    minlength: 2,
    i18n: true,
  })
  name: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
    maxlength: 150,
    minlength: 2,
  })
  key: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed, // Allows both string and object
    required: true,
  })
  value: string | Record<string, any>;

  @Prop({
    type: String,
    maxlength: 150,
    minlength: 2,
    i18n: true,
  })
  hint?: string;
}

const SettingSchema = SchemaFactory.createForClass(Setting);

SettingSchema.plugin(mongooseI18n, {
  locales,
});

export { SettingSchema };
