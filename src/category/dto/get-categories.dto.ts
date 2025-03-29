import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString
} from 'class-validator';
import { Sort } from 'src/common/enums';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

export class GetCategoriesBaseDto {
  @ApiPropertyOptional({
    example: Sort.asc,
    description: 'sort query.',
    enum: Sort,
  })
  @IsOptional()
  @IsEnum(Sort)
  sort?: Sort = Sort.desc;

  @ApiPropertyOptional({
    example: true,
    description: 'active status query.',
    enum: [true, false],
  })
  @IsOptional()
  @IsBoolean({
    message: 'Active status must be true or false.',
  })
  active?: boolean;

  @ApiPropertyOptional({
    example: 'cosmetics',
    description: 'search query.',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetCategoriesDto extends IntersectionType(
  GetCategoriesBaseDto,
  PaginationQueryDto,
) {}
