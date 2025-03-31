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

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category.',
    example: {
      en: 'Clothing',
      ar: 'ملابس',
    },
  })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

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
