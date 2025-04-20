import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseFiltersDto } from 'src/common/dto/base-filters.dto';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand, BrandDocument } from './schemas/brand.schema';

@Injectable()
export class BrandService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting brand model
    @InjectModel(Brand.name) private readonly brandModel: Model<Brand>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
    this.lang = this.i18nHelper.translate().lang;
  }

  /**
   *//***** Create Brand ******
   * @param createBrandDto
   * @returns Brand
   */
  async create(createBrandDto: CreateBrandDto) {
    const brand = await this.findOneByName(createBrandDto.name);

    // handle exception if brand already exists
    if (brand) {
      throw new BadRequestException(
        this.t('service.ALREADY_EXISTS', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.BRAND`),
          },
        }),
      );
    }

    // create new brand
    try {
      const newBrand = await this.brandModel.create(createBrandDto);
      return newBrand;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Brands ******
   * @param paginationQuery
   * @param getBrandsQuery
   * @returns Paginated<Brand>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getBrandsQuery?: BaseFiltersDto,
  ): Promise<Paginated<Brand>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    if (getBrandsQuery?.active !== undefined) {
      filters.active = getBrandsQuery.active;
    }

    if (getBrandsQuery?.search) {
      filters.$or = [
        { 'name.en': { $regex: getBrandsQuery.search, $options: 'i' } },
        { 'name.ar': { $regex: getBrandsQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.brandModel,
      {
        filters,
        select: ' -__v',
        ...(getBrandsQuery?.sort && { sort: getBrandsQuery.sort }),
      },
    );
  }

  /**
   *//***** Get Single Brand ******
   * @param id
   * @returns Brand
   */
  async findOne(id: string) {
    let brand: Brand;
    try {
      brand = await this.brandModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!brand) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.BRAND`),
          },
        }),
      );
    }
    const localizedBrand = this.brandModel.schema.methods.toJSONLocalizedOnly(
      brand,
      this.lang,
    );

    return localizedBrand;
  }

  /**
   *//***** Get Single Brand ******
   * @param name
   * @returns Brand
   */
  async findOneByName(name: LocalizedFieldDto) {
    let brand: BrandDocument;
    try {
      brand = await this.brandModel.findOne({
        $or: [{ 'name.en': name.en }, { 'name.ar': name.ar }],
      });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return brand;
  }

  /**
   *//***** Update Single Brand ******
   * @param id
   * @returns Brand
   */
  async update(id: string, updateBrandDto: UpdateBrandDto) {
    //check if the brand exists
    await this.findOne(id);

    if (updateBrandDto?.name) {
      const brandNameTaken = await this.findOneByName(updateBrandDto.name);
      //console.log({ brandNameTaken });
      if (brandNameTaken && brandNameTaken._id.toString() !== id) {
        //prevent duplicate brands names, while allowing changing only en or ar values
        throw new BadRequestException(
          this.t('service.ALREADY_EXISTS', {
            args: {
              MODEL_NAME: this.t(`common.MODELS_NAMES.BRAND`),
            },
          }),
        );
      }
    }
    //update the brand
    try {
      const updatedBrand = await this.brandModel.findByIdAndUpdate(
        id,
        updateBrandDto,
        { new: true },
      );
      return updatedBrand;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Deactivate Single Brand ******
   * @param id
   */
  async deactivate(id: string) {
    await this.update(id, { active: false });
  }

  /**
   *//***** Activate Single Brand ******
   * @param id
   */
  async activate(id: string) {
    await this.update(id, { active: true });
  }
}
