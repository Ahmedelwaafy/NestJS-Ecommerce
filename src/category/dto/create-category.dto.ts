import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
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
  @IsNotEmpty({ message: 'validation.NAME_NOT_EMPTY' })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

  @ApiPropertyOptional({
    description: 'The image URL of the category.',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString({ message: 'validation.IMAGE_IS_STRING' })
  @IsUrl({}, { message: 'validation.IMAGE_IS_URL' })
  image?: string;

  @ApiPropertyOptional({
    description: 'The active status of the category.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'validation.ACTIVE_IS_BOOLEAN',
  })
  active: boolean = true;

  @ApiPropertyOptional({
    description: 'The deleted status of the category.',
    example: '2023-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate({ message: 'validation.DELETED_AT_IS_DATE' })
  deletedAt?: Date;
}
