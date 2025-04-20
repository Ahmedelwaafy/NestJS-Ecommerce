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
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CouponType } from './enums/coupon-type.enum';

@Injectable()
export class CouponService {
  private t: TFunction;

  constructor(
    //* injecting coupon model
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  /**
   *//***** Create Coupon ******
   * @param createCouponDto
   * @returns Coupon
   */
  async create(createCouponDto: CreateCouponDto) {
    const coupon = await this.findOneByName(createCouponDto.code);

    // handle exception if coupon already exists
    if (coupon) {
      throw new BadRequestException(
        this.t('service.ALREADY_EXISTS', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.COUPON`),
          },
        }),
      );
    }

    if (
      createCouponDto.type === CouponType.Percentage &&
      createCouponDto.discount > 100
    ) {
      throw new BadRequestException(this.t('validation.coupon.DISCOUNT_MAX'));
    }

    // create new coupon
    try {
      const newCoupon = await this.couponModel.create(createCouponDto);
      return newCoupon;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Coupons ******
   * @param paginationQuery
   * @param getCouponsQuery
   * @returns Paginated<Coupon>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getCouponsQuery?: BaseFiltersDto,
  ): Promise<Paginated<Coupon>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    if (getCouponsQuery?.active !== undefined) {
      filters.active = getCouponsQuery.active;
    }

    if (getCouponsQuery?.search) {
      filters.$or = [
        { code: { $regex: getCouponsQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.couponModel,
      {
        filters,
        select: ' -__v',
        ...(getCouponsQuery?.sort && { sort: getCouponsQuery.sort }),
      },
    );
  }

  /**
   *//***** Get Single Coupon ******
   * @param id
   * @returns Coupon
   */
  async findOne(id: string) {
    let coupon: Coupon;
    try {
      coupon = await this.couponModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!coupon) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.COUPON`),
          },
        }),
      );
    }

    return coupon;
  }

  /**
   *//***** Get Single Coupon ******
   * @param name
   * @returns Coupon
   */
  async findOneByName(code: string) {
    let coupon: CouponDocument;
    try {
      coupon = await this.couponModel.findOne({ code });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return coupon;
  }

  /**
   *//***** Get Active Coupon ******
   * @param name
   * @returns Coupon
   */
  async findActiveCoupon(code: string) {
    let coupon: CouponDocument;
    try {
      coupon = await this.couponModel.findOne({
        code,
        expiresAt: { $gt: new Date() },
        active: true,
      });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    if (!coupon) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.COUPON`),
          },
        }),
      );
    }

    return coupon;
  }

  /**
   *//***** Update Single Coupon ******
   * @param id
   * @returns Coupon
   */
  async update(id: string, updateCouponDto: UpdateCouponDto) {
    //check if the coupon exists
    const coupon = await this.findOne(id);

    if (updateCouponDto?.code) {
      const couponCodeTaken = await this.findOneByName(updateCouponDto.code);
      //console.log({ couponCodeTaken });
      if (couponCodeTaken && couponCodeTaken._id.toString() !== id) {
        //prevent duplicate coupons codes
        throw new BadRequestException(
          this.t('service.ALREADY_EXISTS', {
            args: {
              MODEL_NAME: this.t(`common.MODELS_NAMES.COUPON`),
            },
          }),
        );
      }
    }

    if (
      updateCouponDto.type &&
      updateCouponDto.type === CouponType.Percentage &&
      (updateCouponDto.discount ||
        (!updateCouponDto.discount && coupon.discount)) > 100
    ) {
      throw new BadRequestException(this.t('validation.coupon.DISCOUNT_MAX'));
    }
    //update the coupon
    try {
      const updatedCoupon = await this.couponModel.findByIdAndUpdate(
        id,
        updateCouponDto,
        { new: true },
      );
      return updatedCoupon;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Delete Single Coupon ******
   * @param id
   */
  async remove(id: string) {
    await this.couponModel.findByIdAndDelete(id);
  }
}
