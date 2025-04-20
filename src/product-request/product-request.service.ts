import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BaseProductRequestDto,
  CreateProductRequestDto,
} from './dto/create-product-request.dto';
import { UpdateProductRequestDto } from './dto/update-product-request.dto';
import { TFunction } from 'src/i18n/types';
import { InjectModel } from '@nestjs/mongoose';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import {
  ProductRequest,
  ProductRequestDocument,
} from './schemas/product-request.schema';
import { Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { BaseFiltersDto } from 'src/common/dto/base-filters.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class ProductRequestService {
  private t: TFunction;

  constructor(
    //* injecting productRequest model
    @InjectModel(ProductRequest.name)
    private readonly productRequestModel: Model<ProductRequest>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  /**
   *//***** Create Product Request ******
   * @param createProductRequestDto
   * @returns ProductRequest
   */
  async create(createProductRequestDto: BaseProductRequestDto) {
    const productRequest = await this.findOneByName(
      createProductRequestDto.name,
      createProductRequestDto.user,
    );

    // handle exception if productRequest already exists for the same user
    if (productRequest) {
      throw new BadRequestException(
        this.t('service.ALREADY_EXISTS', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT_REQUEST`),
          },
        }),
      );
    }

    // create new productRequest
    try {
      const newProductRequest = await this.productRequestModel.create(
        createProductRequestDto,
      );
      return newProductRequest;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Product Requests ******
   * @param paginationQuery
   * @param getProductRequestsQuery
   * @returns Paginated<ProductRequest>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    sender: ActiveUserData,
    getProductRequestsQuery?: BaseFiltersDto,
  ): Promise<Paginated<ProductRequest>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically
    const { active, search, sort } = getProductRequestsQuery;

    if (active) {
      filters.active = active;
    }

    if (search) {
      filters.$or = [{ name: { $regex: search, $options: 'i' } }];
    }

    //allow the user to find all his product Requests only
    if (sender.role !== Role.Admin) {
      filters.user = sender.id;
    }
    return this.paginationService.paginateQuery(
      paginationQuery,
      this.productRequestModel,
      {
        filters,
        populate: { path: 'user', select: 'name email age gender' },
        sort,
      },
    );
  }

  /**
   *//***** Get Single Product Request ******
   * @param id
   * @param sender
   * @returns ProductRequest
   */
  async findOne(id: string, sender: ActiveUserData) {
    let productRequest: ProductRequest;
    try {
      productRequest = await this.productRequestModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!productRequest) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT_REQUEST`),
          },
        }),
      );
    }

    if (
      sender.role !== Role.Admin &&
      productRequest.user.toString() !== sender.id
    ) {
      throw new UnauthorizedException(this.t(`common.ACCESS_NOT_ALLOWED`));
    }
    return productRequest;
  }

  /**
   *//***** Get Single Product Request By Name And User ID, checks if there is another productRequest with the same name for the same user ******
   * @param name
   * @returns ProductRequest | null
   */
  async findOneByName(name: string, user: string) {
    let productRequest: ProductRequestDocument;
    try {
      productRequest = await this.productRequestModel.findOne({ name, user });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return productRequest;
  }

  /**
   *//***** Update Single ProductRequest ******
   * @param id
   * @returns ProductRequest
   */
  async update(
    id: string,
    updateProductRequestDto: UpdateProductRequestDto,
    sender: ActiveUserData,
  ) {
    //check if the productRequest exists and the sender is allowed to perform this action
    await this.findOne(id, sender);

    if (updateProductRequestDto?.name) {
      const productRequestCodeTaken = await this.findOneByName(
        updateProductRequestDto.name,
        sender.id,
      );
      //console.log({ productRequestCodeTaken });
      if (
        productRequestCodeTaken &&
        productRequestCodeTaken._id.toString() === id //use === not !==, because the same user cannot have the same productRequest name, but different users can
      ) {
        //prevent duplicate productRequests codes
        throw new BadRequestException(
          this.t('service.ALREADY_EXISTS', {
            args: {
              MODEL_NAME: this.t(`common.MODELS_NAMES.PRODUCT_REQUEST`),
            },
          }),
        );
      }
    }
    //update the productRequest
    try {
      const updatedProductRequest =
        await this.productRequestModel.findByIdAndUpdate(
          id,
          updateProductRequestDto,
          { new: true },
        );
      return updatedProductRequest;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** accept Single Product Request ******
   * @param id
   * @returns ProductRequest
   */
  async acceptProductRequest(id: string, sender: ActiveUserData) {
    //check if the productRequest exists
    await this.findOne(id, sender);

    //accept the productRequest
    try {
      const updatedProductRequest =
        await this.productRequestModel.findByIdAndUpdate(
          id,
          { isAvailable: true },
          { new: true },
        );
      return updatedProductRequest;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Delete Single Product Request ******
   * @param id
   */
  async remove(id: string, sender: ActiveUserData) {
    //check if the productRequest exists and the sender is allowed to perform this action
    await this.findOne(id, sender);

    //delete the productRequest
    await this.productRequestModel.findByIdAndDelete(id);
  }
}
