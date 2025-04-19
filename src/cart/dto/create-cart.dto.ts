import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BaseCreateCartDto {
  @ApiProperty({
    description: 'The product ID to add to the cart',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.PRODUCT)',
    }),
  })
  productId: string;

  @ApiPropertyOptional({
    description: 'The quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @Min(1, {
    message: i18nValidationMessage('validation.MIN', {
      FIELD_NAME: '$t(common.FIELDS.QUANTITY)',
    }),
  })
  @IsPositive({
    message: i18nValidationMessage('validation.MUST_BE_POSITIVE', {
      FIELD_NAME: '$t(common.FIELDS.QUANTITY)',
    }),
  })
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Selected color of the product',
    example: 'red',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.COLOR)',
    }),
  })
  color?: string = '';

  @ApiPropertyOptional({
    description: 'Selected size of the product',
    example: 'M',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.SIZE)',
    }),
  })
  size?: string = '';
  /*
    keep the default value here, to enable correct checking over the size 
    (item.product._id.toString() === productId &&
        item.color === color &&
        item.size === size) 
    */
}

export class AddToCartDto extends BaseCreateCartDto {
  @ApiProperty({
    description: 'The ID of the user who submitted the cart',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.USER)',
    }),
  })
  userId: string;
}
