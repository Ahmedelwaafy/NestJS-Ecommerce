import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
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
  @IsNotEmpty({ message: 'validation.NAME_NOT_EMPTY' })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

  @ApiProperty({
    description: 'The parent category id.',
    example: '5f1f1f1f1f1f1f1f1f1f1f1f',
  })
  @IsNotEmpty({
    message: 'validation.CATEGORY_IS_REQUIRED',
  })
  @IsMongoId({
    message: 'validation.CATEGORY_ID_IS_INVALID',
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

  @ApiPropertyOptional({
    description: 'The deleted status of the category.',
    example: '2023-10-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate({ message: 'validation.DELETED_AT_IS_DATE' })
  deletedAt?: Date;
}
