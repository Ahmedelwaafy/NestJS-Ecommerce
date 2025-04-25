import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsMongoId, IsNumber, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class GetOrdersFiltersDto {
  @ApiPropertyOptional({
    description: 'The ID of the user ',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.IS_MONGO_ID', {
      MODEL_NAME: '$t(common.MODELS_NAMES.USER)',
    }),
  })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum order items',
    example: 5,
  })
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.IS_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.MIN_ITEMS)',
      }),
    },
  )
  minOrderItems?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum final total price',
    example: 1000,
  })
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.IS_NUMBER', {
        FIELD_NAME: '$t(common.FIELDS.MIN_FINAL_TOTAL)',
      }),
    },
  )
  minFinalTotal?: number;
}
export class GetOrdersDto extends IntersectionType(
  GetOrdersFiltersDto,
  PaginationQueryDto,
) {}
