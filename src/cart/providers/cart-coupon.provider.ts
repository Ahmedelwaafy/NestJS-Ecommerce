import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouponService } from 'src/coupon/coupon.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { Cart } from '../schemas/cart.schema';
import { CartUtilsProvider } from './cart-utils.provider';

@Injectable()
export class CartCouponProvider {
  private t: TFunction;

  constructor(
    //* injecting cart model
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,

    private readonly i18nHelper: I18nHelperService,
    private readonly cartUtilsProvider: CartUtilsProvider,
    private readonly couponService: CouponService,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  //*** Apply Coupon To Cart ******//

  async applyCoupon(userId: string, { code }: ApplyCouponDto): Promise<Cart> {
    const coupon = await this.couponService.findActiveCoupon(code);

    const cart = await this.cartUtilsProvider.findCart(userId);

    const exists = cart.coupons.some(
      (c) => c.couponId.toString() === coupon._id.toString(),
    );

    if (exists)
      throw new BadRequestException(
        this.t('service.COUPON_ALREADY_APPLIED', { args: { code } }),
      );

    cart.coupons.push({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      couponId: coupon._id.toString(),
    });
    
    const updatedCart = await this.cartUtilsProvider.calculateCartTotals(cart);

    return await updatedCart.save();
  }

  //*** Remove Coupon From Cart ******//
  async removeCoupon(userId: string, couponId: string): Promise<Cart> {
    const cart = await this.cartUtilsProvider.findCart(userId);

    const initialLength = cart.coupons.length;

    cart.coupons = cart.coupons.filter(
      (c) => c.couponId.toString() !== couponId,
    );

    if (cart.coupons.length === initialLength)
      throw new BadRequestException(this.t('service.CART_COUPON_NOT_FOUND'));

    const updatedCart = await this.cartUtilsProvider.calculateCartTotals(cart);

    return await updatedCart.save();
  }
}
