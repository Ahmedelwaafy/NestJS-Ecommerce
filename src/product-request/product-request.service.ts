import { BadRequestException, Injectable, RequestTimeoutException } from '@nestjs/common';
import { BaseProductRequestDto, CreateProductRequestDto } from './dto/create-product-request.dto';
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

  findAll() {
    return `This action returns all productRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productRequest`;
  }

  /**
   *//***** Get Single Product Request By Name And User ID ******
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
  update(id: number, updateProductRequestDto: UpdateProductRequestDto) {
    return `This action updates a #${id} productRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} productRequest`;
  }
}
