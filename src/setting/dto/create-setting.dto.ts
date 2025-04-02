import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';

export class CreateSettingDto {
  @ApiProperty({
    description: 'The name of the setting.',
    example: {
      en: 'Site Title',
      ar: 'عنوان الموقع',
    },
  })
  @IsNotEmpty({ message: 'validation.NAME_NOT_EMPTY' })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

  @ApiProperty({
    description: 'The unique key of the setting.',
    example: 'site_title',
  })
  @IsNotEmpty({ message: 'validation.KEY_NOT_EMPTY' })
  @IsString({ message: 'validation.KEY_IS_STRING' })
  @MinLength(2, { message: 'validation.KEY_MIN_LENGTH' })
  @MaxLength(150, { message: 'validation.KEY_MAX_LENGTH' })
  key: string;

  @ApiProperty({
    description: 'The value of the setting (string or object).',
    example: 'My Amazing Website',
    oneOf: [
      { type: 'string' },
      {
        type: 'object',
        example: {
          facebook: 'https://facebook.com/myprofile',
          twitter: 'https://twitter.com/myprofile',
        },
      },
    ],
  })
  @IsNotEmpty({ message: 'validation.VALUE_NOT_EMPTY' })
  value: string | Record<string, any>;

  @ApiPropertyOptional({
    description: 'The hint for the setting.',
    example: {
      en: 'Enter the title of your website',
      ar: 'أدخل عنوان موقع الويب الخاص بك',
    },
  })
  @IsOptional()
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  hint?: LocalizedFieldDto;
}
