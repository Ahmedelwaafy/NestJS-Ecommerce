import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Sort } from 'src/common/enums';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class BaseFiltersDto {
  @ApiPropertyOptional({
    example: Sort.asc,
    description: 'sort query.',
    enum: Sort,
  })
  @IsOptional()
  @IsEnum(Sort, { message: 'validation.SORT_NOT_VALID' })
  sort?: Sort = Sort.desc;

  @ApiPropertyOptional({
    example: true,
    description: 'active status query.',
    enum: [true, false],
  })
  @IsOptional()
  @IsBoolean({
    message: 'validation.ACTIVE_IS_BOOLEAN',
  })
  active?: boolean;

  @ApiPropertyOptional({
    example: 'cosmetics',
    description: 'search query.',
  })
  @IsOptional()
  @IsString({
    message: 'validation.SEARCH_IS_STRING',
  })
  search?: string;
}
export class PaginationAndFiltersDto extends IntersectionType(
  BaseFiltersDto,
  PaginationQueryDto,
) {}
