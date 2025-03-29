import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Gender } from '../enums/gender.enum';
import { Role } from '../../auth/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    type: String,
    min: [3, 'Name must be at least 3 characters long.'],
    max: [30, 'Name must be at most 30 characters long.'],
  })
  name: string;

  @Prop({
    required: true,
    type: String,
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    type: String,
  })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @Prop({
    type: String,
  })
  avatar?: string;

  @Prop({
    type: Number,
    min: [18, 'Age must be at least 18.'],
    max: [100, 'Age must be at most 100.'],
  })
  age?: number;

  @Prop({
    type: String,
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Phone number must be a valid international number.',
    ],
  })
  phoneNumber?: string;

  @Prop({
    type: String,
  })
  address?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @Prop({
    type: String,
  })
  PasswordVerificationCode?: number;

  @Prop({
    type: Date,
  })
  passwordVerificationCodeExpiresAt?: Date;

  @Prop({
    type: String,
  })
  passwordResetToken?: string;

  @Prop({
    type: Date,
  })
  passwordChangedAt?: Date;

  @Prop({
    type: String,
    enum: Gender,
  })
  gender?: Gender;
}

export const UserSchema = SchemaFactory.createForClass(User);
