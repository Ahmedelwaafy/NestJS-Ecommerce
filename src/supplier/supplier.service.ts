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
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';

@Injectable()
export class SupplierService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting supplier model
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
    this.lang = this.i18nHelper.translate().lang;
  }

  /**
   *//***** Create Supplier ******
   * @param createSupplierDto
   * @returns Supplier
   */
  async create(createSupplierDto: CreateSupplierDto) {
    const supplier = await this.findOneByName(createSupplierDto.name);

    // handle exception if supplier already exists
    if (supplier) {
      throw new BadRequestException(
        this.t('service.ALREADY_EXISTS', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.SUPPLIER`),
          },
        }),
      );
    }

    // create new supplier
    try {
      const newSupplier = await this.supplierModel.create(createSupplierDto);
      return newSupplier;
    } catch (error) {
      console.log({ error });
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Suppliers ******
   * @param paginationQuery
   * @param getSuppliersQuery
   * @returns Paginated<Supplier>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getSuppliersQuery?: BaseFiltersDto,
  ): Promise<Paginated<Supplier>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    if (getSuppliersQuery?.active !== undefined) {
      filters.active = getSuppliersQuery.active;
    }

    if (getSuppliersQuery?.search) {
      filters.$or = [
        { 'name.en': { $regex: getSuppliersQuery.search, $options: 'i' } },
        { 'name.ar': { $regex: getSuppliersQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.supplierModel,
      {
        filters,
        select: ' -__v',
        ...(getSuppliersQuery?.sort && { sort: getSuppliersQuery.sort }),
      },
    );
  }

  /**
   *//***** Get Single Supplier ******
   * @param id
   * @returns Supplier
   */
  async findOne(id: string) {
    let supplier: Supplier;
    try {
      supplier = await this.supplierModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!supplier) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.SUPPLIER`),
          },
        }),
      );
    }
    const localizedSupplier =
      this.supplierModel.schema.methods.toJSONLocalizedOnly(
        supplier,
        this.lang,
      );

    return localizedSupplier;
  }

  /**
   *//***** Get Single Supplier ******
   * @param name
   * @returns Supplier
   */
  async findOneByName(name: LocalizedFieldDto) {
    let supplier: SupplierDocument;
    try {
      supplier = await this.supplierModel.findOne({
        $or: [{ 'name.en': name.en }, { 'name.ar': name.ar }],
      });
    } catch (error) {
      console.log({ error });

      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return supplier;
  }

  /**
   *//***** Update Single Supplier ******
   * @param id
   * @returns Supplier
   */
  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    //check if the supplier exists
    await this.findOne(id);

    if (updateSupplierDto?.name) {
      const supplierNameTaken = await this.findOneByName(
        updateSupplierDto.name,
      );
      //console.log({ supplierNameTaken });
      if (supplierNameTaken && supplierNameTaken._id.toString() !== id) {
        //prevent duplicate suppliers names, while allowing changing only en or ar values
        throw new BadRequestException(
          this.t('service.ALREADY_EXISTS', {
            args: {
              MODEL_NAME: this.t(`common.MODELS_NAMES.SUPPLIER`),
            },
          }),
        );
      }
    }
    //update the supplier
    try {
      const updatedSupplier = await this.supplierModel.findByIdAndUpdate(
        id,
        updateSupplierDto,
        { new: true },
      );
      return updatedSupplier;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Deactivate Single Supplier ******
   * @param id
   */
  async deactivate(id: string) {
    await this.update(id, { active: false });
  }

  /**
   *//***** Activate Single Supplier ******
   * @param id
   */
  async activate(id: string) {
    await this.update(id, { active: true });
  }
}
