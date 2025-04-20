import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  Max,
  Min
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { BaseFiltersDto } from 'src/common/dto/base-filters.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';


export class GetReviewsFiltersDto extends BaseFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by product ID',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.PRODUCT)',
    }),
  })
  product?: string;

  @ApiPropertyOptional({
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage('validation.MUST_BE_BOOLEAN', {
      FIELD_NAME: '$t(common.FIELDS.COMMENT)',
    }),
  })
  isApproved?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by minimum rating',
    example: 4,
  })
  @IsOptional()
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
  minRating?: number;
}
export class GetReviewsDto extends IntersectionType(
  GetReviewsFiltersDto,
  PaginationQueryDto,
) {}
