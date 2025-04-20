import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from 'src/coupon/schemas/coupon.schema';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { ProductService } from 'src/product/product.service';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { Cart, CartCoupon, CartDocument } from '../schemas/cart.schema';

@Injectable()
export class CartUtilsProvider {
  private t: TFunction;

  constructor(
    //* injecting cart model
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,

    //* injecting product model
    @InjectModel(Product.name) private readonly productModel: Model<Product>,

    //* injecting coupon model
    @InjectModel(Coupon.name) private readonly couponModel: Model<Coupon>,

    private readonly productService: ProductService,

    private readonly i18nHelper: I18nHelperService,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  //*** Get Or Create Cart ******//
  async getOrCreateCart(userId: string): Promise<CartDocument> {
    let cart: CartDocument;

    try {
      cart = await this.cartModel.findOne({
        user: userId,
      });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    if (!cart) {
      cart = await this.cartModel.create({
        user: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
    return cart;
  }

  //*** Find Cart ******//
  async findCart(userId: string): Promise<CartDocument> {
    const cart: CartDocument = await this.cartModel.findOne({ user: userId });

    if (!cart)
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.CART`),
          },
        }),
      );
    return cart;
  }

  //*** Calculate Cart Totals ******//
  async calculateCartTotals(cart: CartDocument): Promise<CartDocument> {
    //**** products prices calculation ****

    const productIds = cart.cartItems.map((item) => item.product._id);

    //TODO: inform the user if there is an inactive product
    const products = await this.productModel
      .find({
        _id: { $in: productIds },
        active: true,
      })
      .select('price priceAfterDiscount');

    const productsMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    let totalPrice = 0;
    let totalCartItems = 0;

    cart.cartItems = cart.cartItems.map((item) => {
      const productId = item.product._id.toString();
      const currentProduct = productsMap[productId];
      const itemPrice =
        currentProduct.priceAfterDiscount || currentProduct.price;
      const itemTotalPrice = itemPrice * item.quantity;

      totalPrice += itemTotalPrice;
      totalCartItems += item.quantity;

      return {
        ...item,
        product: {
          ...item.product,
          //store latest fetched price
          price: currentProduct.price,
          priceAfterDiscount: currentProduct.priceAfterDiscount,
        },
        itemTotalPrice,
      };
    });

    cart.totalPrice = totalPrice;
    cart.totalCartItems = totalCartItems;
    console.log({ coupons: cart.coupons[0], length: cart.coupons.length });

    //**** coupons discounts calculation ****
    if (cart.coupons && cart.coupons.length > 0) {
      const couponIds = cart.coupons.map((c) => c.couponId);
      //TODO: inform the user if there is an invalid coupon
      const validCoupons = await this.couponModel.find({
        _id: { $in: couponIds },
        expiresAt: { $gt: new Date() },
        active: true,
      });

      const validCouponMap: Record<string, CouponDocument> =
        validCoupons.reduce((map, coupon) => {
          map[coupon._id.toString()] = coupon;
          return map;
        }, {});

      // needed to prevent having a totalPrice in minus, if the totalPrice = 0 and the user still have valid coupons
      let remainingPrice = totalPrice;
      let totalDiscount = 0;
      const updatedCoupons: CartCoupon[] = [];

      for (const coupon of cart.coupons) {
        const freshCoupon = validCouponMap[coupon.couponId.toString()];
        if (
          !freshCoupon ||
          (freshCoupon.minOrderTotal && totalPrice < freshCoupon.minOrderTotal)
        )
          throw new BadRequestException(
            this.t('service.CART_TOTAL_PRICE_MUST_EXCEED_MIN_ORDER_TOTAL', {
              args: {
                code: freshCoupon.code,
                minOrderTotal: freshCoupon.minOrderTotal,
              },
            }),
          );

        //continue;

        let discount = 0;
        if (freshCoupon.type === 'percentage') {
          discount = (totalPrice * freshCoupon.discount) / 100;
          if (freshCoupon.maxDiscount && discount > freshCoupon.maxDiscount) {
            discount = freshCoupon.maxDiscount;
          }
        } else if (freshCoupon.type === 'fixed') {
          discount = freshCoupon.discount;
        }

        const applicableDiscount = Math.min(remainingPrice, discount);
        if (applicableDiscount <= 0) break; //now totalPrice is = 0, so no need to apply more coupons, so break

        remainingPrice -= applicableDiscount;
        totalDiscount += applicableDiscount;

        updatedCoupons.push({
          code: freshCoupon.code,
          type: freshCoupon.type,
          discount: freshCoupon.discount,
          couponId: freshCoupon._id.toString(),
        });
      }

      cart.coupons = updatedCoupons; // filtered coupons
      cart.totalPriceAfterDiscount = totalDiscount
        ? totalPrice - totalDiscount
        : null;
    } else {
      cart.totalPriceAfterDiscount = null; //used to set the correct finalTotal when removing the last coupon
    }

    //**** shipping and tax calculation ****
    //TODO: get tax value from setting collection
    const shippingCost = cart.shippingCost || 0;
    const tax = cart.tax || 0;
    cart.finalTotal =
      (cart.totalPriceAfterDiscount || cart.totalPrice) + shippingCost + tax;

    cart.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return cart;
  }

  //*** Check Product Availability ******//
  async checkProductAvailability(productId: string, quantity: number = 1) {
    //check if the product exists, exception is handled internally by findOne method
    const product: ProductDocument =
      await this.productService.findOne(productId);

    if (product.quantity < quantity)
      throw new BadRequestException(
        this.t('service.PRODUCT_HAS_NOT_ENOUGH_QUANTITY'),
      );

    if (quantity > product.maxQuantityPerOrder)
      throw new BadRequestException(
        this.t('service.PRODUCT_MAX_QUANTITY_PER_ORDER', {
          args: { maxQuantity: product.maxQuantityPerOrder },
        }),
      );

    //TODO: check color and size availability

    return product;
  }
}
