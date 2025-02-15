import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';
import { Sort } from 'src/common/enums';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';



export class GetUsersBaseDto {
  @ApiPropertyOptional({
    example: Role.User,
    description: 'role query.',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

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
    example: 25,
    description: 'age query.',
    minimum: 18,
    maximum: 100,
  })
  @IsOptional()
  //@Type(() => Number)
  @IsNumber()
  @Min(18, {
    message: 'Age must be at least 18.',
  })
  @Max(100, {
    message: 'Age must be at most 100.',
  })
  age?: number;

  @ApiPropertyOptional({
    example: 'mohammed',
    description: 'search query.',
    minimum: 18,
    maximum: 100,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetUsersDto extends IntersectionType(
  GetUsersBaseDto,
  PaginationQueryDto,
) {}
