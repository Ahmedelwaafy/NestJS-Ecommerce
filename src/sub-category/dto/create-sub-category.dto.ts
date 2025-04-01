import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';

export class CreateSubCategoryDto {
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

  @ApiProperty({
    description: 'The parent category id.',
    example: '5f1f1f1f1f1f1f1f1f1f1f1f',
  })
  @IsNotEmpty({
    message: 'sub-category.dto.CATEGORY_IS_REQUIRED',
  })
  @IsMongoId({
    message: 'sub-category.dto.CATEGORY_ID_IS_INVALID',
  })
  category: string;

  @ApiPropertyOptional({
    description: 'The active status of the category.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'validation.ACTIVE_IS_BOOLEAN',
  })
  active: boolean = true;
}
