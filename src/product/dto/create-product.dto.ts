import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CompareWith } from 'src/common/decorators/custom.decorator';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product.',
    example: { en: 'Adidas Air Max', ar: 'اديداس اير ماكس' },
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      FIELD_NAME: '$t(common.FIELDS.NAME)',
    }),
  })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

  @ApiProperty({
    description: 'The description of the product.',
    example: {
      en: 'High-quality sports shoes.',
      ar: 'أحذية رياضية عالية الجودة',
    },
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      FIELD_NAME: '$t(common.FIELDS.DESCRIPTION)',
    }),
  })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  /* @Transform(({ value }) => {
    if (value) {
      value._FIELD_NAME = 'DESCRIPTION';
    }
    return value;
  }) */
  description: LocalizedFieldDto;

  @ApiProperty({ description: 'The price of the product.', example: 100 })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.PRICE)',
      }),
    },
  )
  @Min(1, {
    message: i18nValidationMessage('validation.MIN_VALUE', {
      FIELD_NAME: '$t(common.FIELDS.PRICE)',
    }),
  })
  @Max(20000, {
    message: i18nValidationMessage('validation.MAX_VALUE', {
      FIELD_NAME: '$t(common.FIELDS.PRICE)',
    }),
  })
  price: number;

  @ApiProperty({
    description: 'The category ID of the product.',
    example: '60b6a2f9f1d3c8d7aeb7a3e6',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.INVALID_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.CATEGORY)',
    }),
  })
  category: string;

  @ApiProperty({ description: 'The quantity of the product.', example: 10 })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.QUANTITY)',
      }),
    },
  )
  @Min(1, {
    message: i18nValidationMessage('validation.MIN_VALUE', {
      FIELD_NAME: '$t(common.FIELDS.QUANTITY)',
    }),
  })
  quantity: number;

  @ApiProperty({
    description: 'The main image of the product.',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      FIELD_NAME: '$t(common.FIELDS.IMAGE_COVER)',
    }),
  })
  @IsUrl(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_URL', {
        FIELD_NAME: '$t(common.FIELDS.IMAGE_COVER)',
      }),
    },
  )
  imageCover: string;

  @ApiPropertyOptional({
    description: 'Additional images of the product.',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @IsOptional()
  @IsArray({
    message: i18nValidationMessage('validation.MUST_BE_ARRAY', {
      FIELD_NAME: '$t(common.FIELDS.IMAGES)',
    }),
  })
  @IsUrl(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.MUST_BE_URL', {
        FIELD_NAME: '$t(common.FIELDS.IMAGE)',
      }),
    },
  )
  images?: string[];

  @ApiPropertyOptional({ description: 'Number of items sold.', example: 5 })
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.SOLD)',
      }),
    },
  )
  @CompareWith(
    'quantity',
    '<=',
    '$t(common.FIELDS.SOLD)',
    '$t(common.FIELDS.QUANTITY)',
  )
  sold?: number;

  @ApiPropertyOptional({ description: 'Price after discount.', example: 80 })
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.PRICE_AFTER_DISCOUNT)',
      }),
    },
  )
  @Max(20000, {
    message: i18nValidationMessage('validation.MAX_VALUE', {
      FIELD_NAME: '$t(common.FIELDS.PRICE_AFTER_DISCOUNT)',
    }),
  })
  @CompareWith(
    'price',
    '<',
    '$t(common.FIELDS.PRICE_AFTER_DISCOUNT)',
    '$t(common.FIELDS.PRICE)',
  )
  priceAfterDiscount?: number;

  @ApiPropertyOptional({
    description: 'Available colors.',
    example: ['red', 'blue', 'green'],
  })
  @IsOptional()
  @IsArray({
    message: i18nValidationMessage('validation.MUST_BE_ARRAY', {
      FIELD_NAME: '$t(common.FIELDS.COLORS)',
    }),
  })
  @IsString({
    each: true,
    message: i18nValidationMessage('validation.MUST_BE_STRING', {
      FIELD_NAME: '$t(common.FIELDS.COLOR)',
    }),
  })
  @IsNotEmpty({
    each: true,
    message: i18nValidationMessage('validation.NOT_EMPTY', {
      FIELD_NAME: '$t(common.FIELDS.COLOR)',
    }),
  })
  colors?: string[];

  @ApiPropertyOptional({
    description: 'Sub-category ID.',
    example: '60b6a2f9f1d3c8d7aeb7a3e7',
  })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.INVALID_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.SUB_CATEGORY)',
    }),
  })
  subCategory?: string;

  @ApiPropertyOptional({
    description: 'Brand ID.',
    example: '60b6a2f9f1d3c8d7aeb7a3e8',
  })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.INVALID_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.BRAND)',
    }),
  })
  brand?: string;

  @ApiPropertyOptional({
    description: 'The active status of the product.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage('validation.MUST_BE_BOOLEAN', {
      FIELD_NAME: '$t(common.FIELDS.ACTIVE)',
    }),
  })
  active?: boolean = true;
}
