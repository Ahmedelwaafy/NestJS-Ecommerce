import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrandService } from 'src/brand/brand.service';
import { CategoryService } from 'src/category/category.service';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { SubCategoryService } from 'src/sub-category/sub-category.service';
import { SupplierService } from 'src/supplier/supplier.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsFiltersDto } from './dto/get-products.dto';
import { BaseUpdateProductDto } from './dto/update-product.dto';
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
    private readonly categoryService: CategoryService,
    private readonly subCategoryService: SubCategoryService,
    private readonly brandService: BrandService,
    private readonly supplierService: SupplierService,
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

    //check if the category exists, exception is handled internally by findOne method
    await this.categoryService.findOne(createProductDto.category);

    //check if the sub-category exists, exception is handled internally by findOne method
    if (createProductDto.subCategory) {
      await this.subCategoryService.findOne(createProductDto.subCategory);
    }

    //check if the supplier exists, exception is handled internally by findOne method
    if (createProductDto.supplier) {
      await this.supplierService.findOne(createProductDto.supplier);
    }

    //check if the brand exists, exception is handled internally by findOne method
    if (createProductDto.brand) {
      await this.brandService.findOne(createProductDto.brand);
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
    getProductsQuery?: GetProductsFiltersDto,
  ): Promise<Paginated<Product>> {
    let filters: Record<string, any> = {};

    // Build filters dynamically

    const { active, search, sort, category, fields, ...restFilters } =
      getProductsQuery;

    const formattedFilters = JSON.parse(
      JSON.stringify(restFilters).replace(
        /\b(gte|lte|lt|gt)\b/g,
        (match) => `$${match}`,
      ),
    );

    if (active !== undefined) {
      filters.active = active;
    }
    if (category !== undefined) {
      filters.category = category;
    }

    if (search) {
      filters.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { 'description.ar': { $regex: search, $options: 'i' } },
      ];
    }
    filters = { ...filters, ...formattedFilters };
    const select = `${fields ?? ''} `.replaceAll(',', ' ');
    console.log({
      restFilters,
      formattedFilters,
      filters,
      fields,
      select,
      sort,
    });
    return this.paginationService.paginateQuery(
      paginationQuery,
      this.productModel,
      {
        filters,
        select,
        sort,
        populate: [
          { path: 'category', select: 'name _id' },
          { path: 'subCategory', select: 'name _id' },
          { path: 'brand', select: 'name _id' },
        ],
      },
    );
  }

  /**
   *//***** Get Single Product ******
   * @param id
   * @returns Product
   */
  async findOne(id: string, localized: boolean = true) {
    let product: Product;
    try {
      product = await this.productModel
        .findById(id)
        .populate('category subCategory brand', 'name _id');
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!product || !product.active) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT`),
          },
        }),
      );
    }
    if (localized) {
      const localizedProduct =
        this.productModel.schema.methods.toJSONLocalizedOnly(
          product,
          this.lang,
        );

      return localizedProduct;
    }
    return product;
  }

  /**
   *//***** Get Single Product By Name ******
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
  async update(id: string, updateProductDto: BaseUpdateProductDto) {
    //check if the product exists
    const product = await this.findOne(id);

    //check product name availability
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
    //ensure that price > price after discount
    const price = updateProductDto?.price || product.price;
    const priceAfterDiscount =
      updateProductDto?.priceAfterDiscount || product.priceAfterDiscount;
    if (price <= priceAfterDiscount) {
      throw new BadRequestException(
        this.t('validation.INVALID_COMPARISON', {
          args: {
            FIRST_FIELD_NAME: '$t(common.FIELDS.PRICE_AFTER_DISCOUNT)',
            OPERATOR: '<',
            SECOND_FIELD_NAME: '$t(common.FIELDS.PRICE)',
          },
        }),
      );
    }

    //ensure that quantity > sold
    const quantity = updateProductDto?.quantity || product.quantity;
    const sold = updateProductDto?.sold || product.sold;
    if (quantity < sold) {
      throw new BadRequestException(
        this.t('validation.INVALID_COMPARISON', {
          args: {
            FIRST_FIELD_NAME: '$t(common.FIELDS.SOLD)',
            OPERATOR: '<=',
            SECOND_FIELD_NAME: '$t(common.FIELDS.QUANTITY)',
          },
        }),
      );
    }

    //check if the category exists, exception is handled internally by findOne method
    if (updateProductDto.category) {
      await this.categoryService.findOne(updateProductDto.category);
    }
    //check if the sub-category exists, exception is handled internally by findOne method
    if (updateProductDto.subCategory) {
      await this.subCategoryService.findOne(updateProductDto.subCategory);
    }

    //check if the brand exists, exception is handled internally by findOne method
    if (updateProductDto.brand) {
      await this.brandService.findOne(updateProductDto.brand);
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
  async remove(id: string) {
    //check if the product exists
    await this.findOne(id);

    //delete the product
    await this.productModel.findByIdAndDelete(id);
  }

  /**
   * //***** Update Product After Purchase ******
   * @param productId
   * @param quantity
   */
  async updateProductAfterPurchase(
    productId: string,
    quantity: number,
  ): Promise<void> {
    //check if the product exists
    const product = await this.findOne(productId, false);

    // Increment sold count and decrement available quantity
    product.sold = (product.sold || 0) + quantity;
    product.quantity = Math.max(0, product.quantity - quantity);

    await product.save();
  }
}
