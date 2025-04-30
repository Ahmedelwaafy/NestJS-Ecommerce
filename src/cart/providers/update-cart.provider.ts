import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { AddToCartDto } from '../dto/create-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { CartUtilsProvider } from './cart-utils.provider';

@Injectable()
export class UpdateCartProvider {
  private t: TFunction;

  constructor(
    //* injecting cart model
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly i18nHelper: I18nHelperService,
    private readonly cartUtilsProvider: CartUtilsProvider,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  //*** Add To Cart ******//

  async addToCart(addToCartDto: AddToCartDto): Promise<CartDocument> {
    const { userId, productId, quantity = 1, color, size } = addToCartDto;

    const product = await this.cartUtilsProvider.checkProductAvailability(
      productId,
      quantity,
    );

    const cart = await this.cartUtilsProvider.getOrCreateCart(userId);

    const itemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        item.color === color &&
        item.size === size,
    );

    if (itemIndex > -1) {
      const newQuantity = cart.cartItems[itemIndex].quantity + quantity;
      if (newQuantity > product.maxQuantityPerOrder) {
        throw new BadRequestException(
          this.t('service.PRODUCT_MAX_QUANTITY_PER_ORDER', {
            args: { maxQuantity: product.maxQuantityPerOrder },
          }),
        );
      }
      cart.cartItems[itemIndex].quantity = newQuantity;
    } else {
      cart.cartItems.push({
        product: {
          _id: product._id.toString(),
          name: product.name,
          description: product.description,
          maxQuantityPerOrder: product.maxQuantityPerOrder,
          price: product.price,
          priceAfterDiscount: product.priceAfterDiscount,
          image: product.imageCover,
        },
        quantity,
        color: color || '',
        size: size || '',
        itemTotalPrice:
          (product.priceAfterDiscount || product.price) * quantity,
      });
    }

    const updatedCart = await this.cartUtilsProvider.calculateCartTotals(cart);

    return await updatedCart.save();
  }

  //**** Update Cart ******//

  async updateCartItem(updateCartDto: UpdateCartDto): Promise<CartDocument> {
    const { userId, productId, quantity = 1, color, size } = updateCartDto;

    await this.cartUtilsProvider.checkProductAvailability(productId, quantity);

    const cart = await this.cartUtilsProvider.findCart(userId);

    const itemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product._id.toString() === productId &&
        item.color === color &&
        item.size === size,
    );

    if (itemIndex === -1)
      throw new NotFoundException(this.t('service.PRODUCT_NOT_FOUND_IN_CART'));

    /*  if (quantity <= 0) {
      cart.cartItems.splice(itemIndex, 1);
    } else { */

    //overwrite quantity
    cart.cartItems[itemIndex].quantity = quantity;

    const updatedCart = await this.cartUtilsProvider.calculateCartTotals(cart);

    return await updatedCart.save();
  }

  //**** Remove Cart Item ******//
  async removeCartItem(
    userId: string,
    productId: string,
    color: string = '',
    size: string = '',
  ): Promise<Cart> {
    const cart = await this.cartUtilsProvider.findCart(userId);

    const initialLength = cart.cartItems.length;
    cart.cartItems = cart.cartItems.filter(
      (item) =>
        !(
          item.product._id.toString() === productId &&
          item.color === color &&
          item.size === size
        ),
    );

    if (cart.cartItems.length === initialLength)
      throw new NotFoundException(this.t('service.PRODUCT_NOT_FOUND_IN_CART'));

    const updatedCart = await this.cartUtilsProvider.calculateCartTotals(cart);

    return await updatedCart.save();
  }

  //**** Clear Cart ******//
  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartUtilsProvider.findCart(userId);

    cart.cartItems = [];
    cart.totalPrice = 0;
    cart.totalPriceAfterDiscount = undefined;
    cart.totalCartItems = 0;
    cart.coupons = [];
    cart.finalTotal = 0;

    return await cart.save();
  }
}
