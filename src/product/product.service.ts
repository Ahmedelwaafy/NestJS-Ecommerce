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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting product model
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
    this.lang = this.i18nHelper.translate().lang;
  }

  /**
   *//***** Create Product ******
   * @param createProductDto
   * @returns Product
   */
  async create(createProductDto: CreateProductDto) {
    const product = await this.findOneByName(createProductDto.name);

    // handle exception if product already exists
    if (product) {
      throw new BadRequestException(
        this.t('service.ALREADY_EXISTS', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT`),
          },
        }),
      );
    }

    // create new product
    try {
      const newProduct = await this.productModel.create(createProductDto);
      return newProduct;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Products ******
   * @param paginationQuery
   * @param getProductsQuery
   * @returns Paginated<Product>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getProductsQuery?: BaseFiltersDto,
  ): Promise<Paginated<Product>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    if (getProductsQuery?.active !== undefined) {
      filters.active = getProductsQuery.active;
    }

    if (getProductsQuery?.search) {
      filters.$or = [
        { 'name.en': { $regex: getProductsQuery.search, $options: 'i' } },
        { 'name.ar': { $regex: getProductsQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.productModel,
      {
        filters,
        select: ' -__v',
        ...(getProductsQuery?.sort && { sort: getProductsQuery.sort }),
      },
    );
  }

  /**
   *//***** Get Single Product ******
   * @param id
   * @returns Product
   */
  async findOne(id: string) {
    let product: Product;
    try {
      product = await this.productModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!product) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT`),
          },
        }),
      );
    }
    const localizedProduct = this.productModel.schema.methods.toJSONLocalizedOnly(
      product,
      this.lang,
    );

    return localizedProduct;
  }

  /**
   *//***** Get Single Product ******
   * @param name
   * @returns Product
   */
  async findOneByName(name: LocalizedFieldDto) {
    let product: ProductDocument;
    try {
      product = await this.productModel.findOne({
        $or: [{ 'name.en': name.en }, { 'name.ar': name.ar }],
      });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return product;
  }

  /**
   *//***** Update Single Product ******
   * @param id
   * @returns Product
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    //check if the product exists
    await this.findOne(id);

    if (updateProductDto?.name) {
      const productNameTaken = await this.findOneByName(updateProductDto.name);
      //console.log({ productNameTaken });
      if (productNameTaken && productNameTaken._id.toString() !== id) {
        //prevent duplicate products names, while allowing changing only en or ar values
        throw new BadRequestException(
          this.t('service.ALREADY_EXISTS', {
            args: {
              MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT`),
            },
          }),
        );
      }
    }
    //update the product
    try {
      const updatedProduct = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true },
      );
      return updatedProduct;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Deactivate Single Product ******
   * @param id
   */
  async deactivate(id: string) {
    await this.update(id, { active: false });
  }

  /**
   *//***** Activate Single Product ******
   * @param id
   */
  async activate(id: string) {
    await this.update(id, { active: true });
  }
}
