import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsNumber,
    IsOptional
} from 'class-validator';


export class RangeFilterDto {
  @ApiPropertyOptional({ description: 'Greater than or equal to', example: 50 })
  @IsOptional()
  @IsNumber({}, { message: 'Must be a number' })
  @Type(() => Number)
  gte?: number;

  @ApiPropertyOptional({ description: 'Less than or equal to', example: 100 })
  @IsOptional()
  @IsNumber({}, { message: 'Must be a number' })
  @Type(() => Number)
  lte?: number;
}