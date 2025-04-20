import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BaseReviewDto {
  @ApiProperty({
    description: 'The product being reviewed',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.PRODUCT)',
    }),
  })
  product: string;

  @ApiProperty({
    description: 'The user who submitted the review',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.USER)',
    }),
  })
  user: string;

  @ApiProperty({
    description: 'The review comment',
    example: 'This product exceeded my expectations in every way!',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.COMMENT)',
    }),
  })
  @Length(10, 1000, {
    message: i18nValidationMessage('validation.LENGTH', {
      FIELD_NAME: '$t(common.FIELDS.COMMENT)',
    }),
  })
  comment: string;

  @ApiProperty({
    description: 'The rating given to the product (1-5)',
    example: 5,
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.IS_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.RATING)',
      }),
    },
  )
  @Min(1, {
    message: i18nValidationMessage('validation.MIN', {
      FIELD_NAME: '$t(common.FIELDS.RATING)',
    }),
  })
  @Max(5, {
    message: i18nValidationMessage('validation.MAX', {
      FIELD_NAME: '$t(common.FIELDS.RATING)',
    }),
  })
  rating: number;

  @ApiPropertyOptional({
    description: 'Whether the review has been approved by admin',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage('validation.MUST_BE_BOOLEAN', {
      FIELD_NAME: '$t(common.FIELDS.COMMENT)',
    }),
  })
  isApproved?: boolean;
}

// DTO for creating a review (excludes user and isApproved)
export class CreateReviewDto extends OmitType(BaseReviewDto, [
  'user',
  'isApproved',
] as const) {}
