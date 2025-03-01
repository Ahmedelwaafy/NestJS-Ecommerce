import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'limit query.',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsPositive()
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 1,
    description: 'page query.',
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  page?: number = 1;
}
