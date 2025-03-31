import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LocalizedFieldDto {
  @IsNotEmpty({ message: 'validation.EN_NAME_NOT_EMPTY' }) //use the namespace directly prefixed with the translation key
  @IsString({
    message: i18nValidationMessage('validation.EN_NAME_IS_STRING'), // use i18nValidationMessage if you want to access more info like the user value and the validation constraint, also if you want to pass dynamic values like "message" to the json file
  })
  @Transform(({ value }) => value.toString().trim())
  en: string;

  @IsNotEmpty({ message: 'validation.AR_NAME_NOT_EMPTY' })
  @IsString({
    message: i18nValidationMessage('validation.AR_NAME_IS_STRING'),
  })
  @Transform(({ value }) => value.toString().trim())
  ar: string;
}
