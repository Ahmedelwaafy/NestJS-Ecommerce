import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsPostalCode,
    IsString,
    IsUrl,
    Length,
    ValidateNested
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaymentMethod } from '../enums';

export class ShippingAddressDto {
  @ApiProperty({
    description: 'The full name of the shipping address',
    example: 'John Doe',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.NAME)',
    }),
  })
  @Length(2, 150, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.NAME)',
    }),
  })
  fullName: string;

  @ApiProperty({
    description: 'The first line of the shipping address',
    example: '123 Main Street',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.ADDRESS)',
    }),
  })
  @Length(2, 150, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.ADDRESS)',
    }),
  })
  addressLine1: string;

  @ApiPropertyOptional({
    description: 'The second line of the shipping address (optional)',
    example: 'Apt 101',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.ADDRESS)',
    }),
  })
  @Length(2, 150, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.ADDRESS)',
    }),
  })
  addressLine2?: string;

  @ApiProperty({
    description: 'The city of the shipping address',
    example: 'New York',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.CITY)',
    }),
  })
  @Length(2, 70, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.CITY)',
    }),
  })
  city: string;

  @ApiProperty({
    description: 'The state of the shipping address',
    example: 'NY',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.STATE)',
    }),
  })
  @Length(2, 70, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.STATE)',
    }),
  })
  state: string;

  @ApiProperty({
    description: 'The postal code of the shipping address',
    example: '10001',
  })
  @IsPostalCode('any', {
    message: 'validation.INVALID_EGYPTIAN_POSTAL_CODE',
  })
  postalCode: string;

  @ApiProperty({
    description: 'The country of the shipping address',
    example: 'USA',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.COUNTRY)',
    }),
  })
  @Length(2, 40, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.COUNTRY)',
    }),
  })
  country: string;

  @ApiProperty({
    description: 'The phone number of the shipping address',
    example: '123-456-7890',
  })
  @IsPhoneNumber('EG', {
    message: 'validation.INVALID_EGYPTIAN_PHONE_NUMBER',
  })
  phoneNumber: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'The payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
  })
  @IsEnum(PaymentMethod, { message: 'validation.PAYMENT_METHOD_TYPE' })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'The shipping address',
    type: ShippingAddressDto,
  })
  @IsOptional()
  @IsObject({
    message: i18nValidationMessage('validation.MUST_BE_OBJECT', {
      FIELD_NAME: '$t(common.FIELDS.SHIPPING_ADDRESS)',
    }),
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({
    description:
      'The success URL sent by the client side to redirect after successful payment',
    example: 'https://example.com/success',
  })
  @IsOptional()
  @IsUrl(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_URL', {
        FIELD_NAME: '$t(common.FIELDS.SUCCESS_URL)',
      }),
    },
  )
  successUrl: string;

  @ApiProperty({
    description:
      'The cancel URL sent by the client side to redirect after canceled payment',
    example: 'https://example.com/cancel',
  })
  @IsOptional()
  @IsUrl(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_URL', {
        FIELD_NAME: '$t(common.FIELDS.CANCEL_URL)',
      }),
    },
  )
  cancelUrl: string;
}
