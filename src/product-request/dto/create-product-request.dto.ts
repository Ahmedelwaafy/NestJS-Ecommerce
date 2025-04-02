import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class BaseProductRequestDto {
  @ApiProperty({
    description: 'The name of the requested product.',
    example: 'Laptop',
  })
  @IsString({ message: 'validation.NAME_IS_STRING' })
  @MinLength(2, { message: 'validation.NAME_MIN_LENGTH' })
  @MaxLength(100, { message: 'validation.NAME_MAX_LENGTH' })
  name: string;

  @ApiProperty({
    description: 'The description of the requested product.',
    example: 'A high-performance laptop for gaming and work.',
  })
  @IsString({ message: 'validation.DESCRIPTION_IS_STRING' })
  @MinLength(2, { message: 'validation.DESCRIPTION_MIN_LENGTH' })
  @MaxLength(150, {
    message: 'validation.DESCRIPTION_MAX_LENGTH',
  })
  description: string;

  @ApiProperty({
    description: 'The quantity of the requested product.',
    example: '10 or 1kg',
  })
  @IsString({ message: 'validation.QUANTITY_IS_STRING' })
  @MinLength(1, { message: 'validation.QUANTITY_MIN_LENGTH' })
  @MaxLength(50, { message: 'validation.QUANTITY_MAX_LENGTH' })
  quantity: string;

  @ApiPropertyOptional({
    description: 'The category of the requested product.',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString({ message: 'validation.CATEGORY_IS_STRING' })
  @MinLength(1, { message: 'validation.CATEGORY_MIN_LENGTH' })
  @MaxLength(50, { message: 'validation.CATEGORY_MAX_LENGTH' })
  category?: string;

  @ApiPropertyOptional({
    description: 'The user who made the request.',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId({ message: 'validation.USER_IS_MONGO_ID' })
  user?: string;

  @ApiPropertyOptional({
    description: 'Availability status of the requested product.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.IS_AVAILABLE_IS_BOOLEAN' })
  isAvailable?: boolean;
}
// DTO for creating a product request (excludes user and isAvailable), user is get from the token, and isAvailable mustn't be sent from the user
export class CreateProductRequestDto extends OmitType(BaseProductRequestDto, [
  'user',
  'isAvailable',
] as const) {}
