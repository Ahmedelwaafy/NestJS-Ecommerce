import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested
} from 'class-validator';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';

export class CreateBrandDto {
  @ApiProperty({
    description: 'The name of the brand.',
    example: {
      en: 'Nike',
      ar: 'نايكي',
    },
  })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

  @ApiPropertyOptional({
    description: 'The image URL of the brand.',
    example: 'https://example.com/brand-image.jpg',
  })
  @IsOptional()
  @IsString({ message: 'brand.dto.IMAGE_IS_STRING' })
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'The active status of the brand.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'validation.ACTIVE_IS_BOOLEAN',
  })
  active: boolean = true;
}

