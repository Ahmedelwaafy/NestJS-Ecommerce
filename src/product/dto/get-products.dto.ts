import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { BaseFiltersDto } from 'src/common/dto/base-filters.dto';
import { RangeFilterDto } from 'src/common/dto/custom.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class GetProductsFiltersDto extends BaseFiltersDto {
  @ApiPropertyOptional({
    description: 'The category ID of the product.',
    example: '60b6a2f9f1d3c8d7aeb7a3e6',
  })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.CATEGORY)',
    }),
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated list of specific fields to return.',
    example: 'name,price,category',
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      FIELD_NAME: '$t(common.FIELDS.COLOR)',
    }),
  })
  fields?: string;

  @ApiPropertyOptional({
    description: 'Number of items sold.',
    type: RangeFilterDto,
  })
  @IsOptional()
  @Type(() => RangeFilterDto)
  sold?: RangeFilterDto;

  @ApiPropertyOptional({
    description: 'The price range.',
    type: RangeFilterDto,
  })
  @IsOptional()
  @Type(() => RangeFilterDto)
  price?: RangeFilterDto;
}
export class GetProductsDto extends IntersectionType(
  GetProductsFiltersDto,
  PaginationQueryDto,
) {}
