import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSettingDto } from './create-setting.dto';
class UpdateSettingBaseDto extends OmitType(CreateSettingDto, ['key'] as const) {}

export class UpdateSettingDto extends PartialType(UpdateSettingBaseDto) {}
