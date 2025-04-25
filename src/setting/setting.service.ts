import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseFiltersDto } from 'src/common/dto/base-filters.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './schemas/setting.schema';

@Injectable()
export class SettingService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting setting model
    @InjectModel(Setting.name) private readonly settingModel: Model<Setting>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
    this.lang = this.i18nHelper.translate().lang;
  }

  /**
   *//***** Create Setting ******
   * @param createSettingDto
   * @returns Setting
   */
  async create(createSettingDto: CreateSettingDto) {
    let setting: Setting;

    try {
      setting = await this.settingModel.findOne({ key: createSettingDto.key });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    // handle exception if setting already exists
    if (setting) {
      throw new BadRequestException(
        this.t('service.ALREADY_EXISTS', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.SETTING`),
          },
        }),
      );
    }

    // create new setting
    try {
      const newSetting = await this.settingModel.create(createSettingDto);
      return newSetting;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Settings ******
   * @param paginationQuery
   * @param getSettingsQuery
   * @returns Paginated<Setting>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getSettingsQuery?: BaseFiltersDto,
  ): Promise<Paginated<Setting>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically
    const { search, sort } = getSettingsQuery;

    if (search) {
      filters.$or = [
        { 'name.en': { $regex: getSettingsQuery.search, $options: 'i' } },
        { 'name.ar': { $regex: getSettingsQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.settingModel,
      {
        filters,
        select: ' -__v',
        sort,
      },
    );
  }

  /**
   *//***** Get Single Setting ******
   * @param id
   * @returns Setting
   */
  async findOne(key: string, throwErrorIfNotFound: boolean = true) {
    let setting: Setting;
    try {
      setting = await this.settingModel.findOne({ key });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!setting) {
      if (throwErrorIfNotFound) {
        throw new NotFoundException(
          this.t('service.NOT_FOUND', {
            args: {
              MODEL_NAME: this.t(`common.MODELS_NAMES.SETTING`),
            },
          }),
        );
      } else {
        return null;
      }
    }
    const localizedSetting =
      this.settingModel.schema.methods.toJSONLocalizedOnly(setting, this.lang);

    return localizedSetting;
  }

  /**
   *//***** Update Single Setting ******
   * @param id
   * @returns Setting
   */
  async update(key: string, updateSettingDto: UpdateSettingDto) {
    //check if the setting exists
    await this.findOne(key);

    //update the setting
    try {
      const updatedSetting = await this.settingModel.findOneAndUpdate(
        { key },
        updateSettingDto,
        { new: true },
      );
      return updatedSetting;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Delete Single Setting ******
   * @param id
   */
  async remove(key: string) {
    await this.settingModel.findByIdAndDelete(key);
  }
}
