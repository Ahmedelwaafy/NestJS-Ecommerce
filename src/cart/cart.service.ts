import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sort } from 'src/common/enums';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { AddToCartDto } from './dto/create-cart.dto';
import { GetCartsFiltersDto } from './dto/get-carts.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartCouponProvider } from './providers/cart-coupon.provider';
import { CartUtilsProvider } from './providers/cart-utils.provider';
import { UpdateCartProvider } from './providers/update-cart.provider';
import { Cart } from './schemas/cart.schema';

@Injectable()
export class CartService {
  private t: TFunction;

  constructor(
    //* injecting cart model
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,

    private readonly paginationService: PaginationService,

    private readonly i18nHelper: I18nHelperService,

    private readonly updateCartProvider: UpdateCartProvider,

    private readonly cartUtilsProvider: CartUtilsProvider,

    private readonly cartCouponProvider: CartCouponProvider,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  /**
   *//***** Add To Cart ******
   * @param addToCartDto
   * @returns Cart
   */
  async addToCart(addToCartDto: AddToCartDto): Promise<Cart> {
    return this.updateCartProvider.addToCart(addToCartDto);
  }

  /**
   *//***** Get All Carts ******
   * @param paginationQuery
   * @param getCartsQuery
   * @returns Paginated<Cart>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getCartsQuery?: GetCartsFiltersDto,
  ): Promise<Paginated<Cart>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    const { minCartItems, minFinalTotal, userId } = getCartsQuery;

    if (minCartItems !== undefined) {
      filters.totalCartItems = { $gte: minCartItems };
    }

    if (minFinalTotal !== undefined) {
      filters.finalTotal = { $gte: minFinalTotal };
    }

    if (userId !== undefined) {
      filters.user = userId;
    }
    return this.paginationService.paginateQuery(
      paginationQuery,
      this.cartModel,
      {
        filters,
        sort: Sort.desc,
      },
    );
  }

  /**
   *//***** Get Single Cart or Create one if non exists ******
   * @param id
   * @returns Cart
   */
  async findOne(userId: string) {
    return await this.cartUtilsProvider.getOrCreateCart(userId);
  }

  /**
   *//***** Get Single Cart and throw an error if non exists ******
   * @param id
   * @returns Cart
   */
  async findCart(userId: string) {
    return await this.cartUtilsProvider.findCart(userId);
  }

  /**
   *//***** Update Single Cart ******
   * @param id
   * @returns Cart
   */

  async updateCartItem(updateCartDto: UpdateCartDto): Promise<Cart> {
    return this.updateCartProvider.updateCartItem(updateCartDto);
  }

  /**
   *//***** Remove Single Cart Item ******
   * @param userId
   * @param productId
   * @param color
   * @param size
   * @returns Cart
   */
  async removeCartItem(
    userId: string,
    productId: string,
    color: string,
    size: string,
  ): Promise<Cart> {
    return this.updateCartProvider.removeCartItem(
      userId,
      productId,
      color,
      size,
    );
  }

  /**
   *//***** Clear Cart ******
   * @param userId
   * @returns Cart
   */
  async clearCart(userId: string): Promise<Cart> {
    return this.updateCartProvider.clearCart(userId);
  }

  /**
   *//***** Apply Coupon ******
   * @param userId
   * @param applyCouponDto
   * @returns Cart
   */
  async applyCoupon(
    userId: string,
    applyCouponDto: ApplyCouponDto,
  ): Promise<Cart> {
    return this.cartCouponProvider.applyCoupon(userId, applyCouponDto);
  }
  /**
   *//***** Remove Coupon ******
   * @param userId
   * @param couponId
   * @returns Cart
   */
  async removeCoupon(userId: string, couponId: string): Promise<Cart> {
    return this.cartCouponProvider.removeCoupon(userId, couponId);
  }
}
