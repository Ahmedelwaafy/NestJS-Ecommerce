import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category.',
    minLength: 3,
    maxLength: 30,
    example: 'Electronics',
  })
  @IsString()
  @MinLength(3, {
    message: i18nValidationMessage('validation.MinLength'),
  })
  @MaxLength(30, { message: 'Name must be at most 30 characters long.' })
  name: string;

  @ApiPropertyOptional({
    description: 'The image URL of the category.',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'The active status of the category.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active: boolean = true;
}
