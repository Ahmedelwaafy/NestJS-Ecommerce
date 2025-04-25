import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sort } from 'src/common/enums';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { SHIPPING_COST_KEY, TAXES_KEY } from 'src/setting/constants';
import { CartService } from '../cart/cart.service';
import { SettingService } from '../setting/setting.service';
import { UserService } from '../user/user.service';
import { DEFAULT_CANCEL_URL, DEFAULT_SUCCESS_URL } from './constants';
import { CreateOrderDto, ShippingAddressDto } from './dto/create-order.dto';
import { GetOrdersFiltersDto } from './dto/get-orders.dto';
import { OrderStatus, PaymentMethod } from './enums';
import { OrderUtilsProvider } from './providers/order-utils.provider';
import { StripeProvider } from './providers/stripe.provider';
import { Order, OrderDocument } from './schemas/order.schema';
import { PaymobProvider } from './providers/paymob.provider';

/**
 * operations:
 *
 * -update paidAt
 * -update deliveredAt
 * -clear cart
 * -update products quantity and sold
 */

@Injectable()
export class OrderService {
  private t: TFunction;
  private readonly paymentGateway: 'stripe' | 'paymob' = 'paymob';
  private readonly DEFAULT_SUCCESS_URL = DEFAULT_SUCCESS_URL;
  private readonly DEFAULT_CANCEL_URL = DEFAULT_CANCEL_URL;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    private orderUtilsProvider: OrderUtilsProvider,
    private userService: UserService,
    private settingService: SettingService,
    private readonly i18nHelper: I18nHelperService,
    private readonly paginationService: PaginationService,
    private readonly stripeProvider: StripeProvider,
    private readonly paymobProvider: PaymobProvider,
  ) {
    this.t = this.i18nHelper.translate().t;
  }

  /**
   *//***** Create Order ******
   * @param userId d
   * @param createOrderDto
   * @returns OrderDocument
   */
  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<Order> {
    const user = await this.userService.findOne(userId);

    const cart = await this.cartService.findCart(userId);

    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException(this.t('service.CART.IS_EMPTY'));
    }

    // Get tax and shipping costs from settings
    const taxSetting = await this.settingService.findOne(TAXES_KEY, false);

    const shippingCostSetting = await this.settingService.findOne(
      SHIPPING_COST_KEY,
      false,
    );

    const tax = taxSetting ? Number(taxSetting.value) : 0;
    const shippingCost = shippingCostSetting
      ? Number(shippingCostSetting.value)
      : 0;

    // Handle shipping address
    let shippingAddress: ShippingAddressDto | string =
      createOrderDto.shippingAddress;

    // If no shipping address provided, try to get it from user
    if (!shippingAddress) {
      if (!user.address) {
        throw new BadRequestException(
          this.t('service.ORDER.NO_SHIPPING_ADDRESS'),
        );
      }
      shippingAddress = user.address;
    }

    // Calculate the final total with tax and shipping
    const subtotal = cart.totalPriceAfterDiscount || cart.totalPrice;
    const finalTotal = subtotal + tax + shippingCost;

    // Create order from cart data
    const orderData = {
      orderItems: cart.cartItems,
      totalItems: cart.totalCartItems,
      subtotal: cart.totalPrice,
      discount:
        cart.totalPrice - (cart.totalPriceAfterDiscount || cart.totalPrice),
      shippingCost,
      tax,
      finalTotal,
      paymentMethod: createOrderDto.paymentMethod,
      status: OrderStatus.PENDING,
      shippingAddress,
      user: userId,
      cart: cart._id,
    };

    const order = await this.orderModel.create(orderData);

    // If payment method is card, create Stripe checkout session
    if (createOrderDto.paymentMethod === PaymentMethod.CARD) {
      let session;

      if (this.paymentGateway === 'stripe') {
        session = await this.stripeProvider.createStripeCheckoutSession(
          order,
          user,
          createOrderDto.successUrl || this.DEFAULT_SUCCESS_URL,
          createOrderDto.cancelUrl || this.DEFAULT_CANCEL_URL,
        );
      } else if (this.paymentGateway === 'paymob') {
        session = await this.paymobProvider.createPaymobCheckoutSession(
          order,
          user,
          createOrderDto.successUrl || this.DEFAULT_SUCCESS_URL, //paymob accepts only one redirect url called redirection_url or Transaction response callback
        );
      }
      order.paymentDetails = session;
      await order.save();
    }

    return order;
  }

  /**
   *//***** Find Order By Id for admin  ******
   * @param orderId
   * @returns OrderDocument
   */
  async findOrderById(orderId: string): Promise<OrderDocument> {
    let order: OrderDocument;

    try {
      order = await this.orderModel.findById(orderId);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    if (!order) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.ORDER`),
          },
        }),
      );
    }

    return order;
  }

  /**
   *//***** Get User Orders ******
   * @param userId
   * @returns Order[]
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return this.orderModel.find({ user: userId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Orders for admin ******
   * @returns Order[]
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getOrdersQuery?: GetOrdersFiltersDto,
  ): Promise<Paginated<Order>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    const { minOrderItems, minFinalTotal, userId } = getOrdersQuery;

    if (minOrderItems !== undefined) {
      filters.totalItems = { $gte: minOrderItems };
    }

    if (minFinalTotal !== undefined) {
      filters.finalTotal = { $gte: minFinalTotal };
    }

    if (userId !== undefined) {
      filters.user = userId;
    }
    return this.paginationService.paginateQuery(
      paginationQuery,
      this.orderModel,
      {
        filters,
        sort: Sort.desc,
      },
    );
  }

  /**
   *//***** Handle Stripe Webhook ******
   * @param payload
   * @param signature
   */
  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    return this.stripeProvider.handleStripeWebhook(payload, signature);
  }

  /**
   *//***** Handle Paymob Webhook ******
   * @param payload
   * @param signature
   */
  async handlePaymobWebhook(payload: any, hmacHeader: string): Promise<void> {
    return this.paymobProvider.handlePaymobWebhook(payload, hmacHeader);
  }

  /**
   *//***** Handle Cash Order Delivered ******
   * @param orderId
   * @returns Order
   */
  async handleCashOrderDelivered(orderId: string): Promise<Order> {
    const order = await this.findOrderById(orderId);

    if (order.paymentMethod !== 'cash') {
      throw new NotFoundException(this.t(`service.ORDER.NOT_PAID_BY_CASH`));
    }
    order.paidAt = new Date();
    order.deliveredAt = new Date();
    order.status = OrderStatus.DELIVERED;

    // Update product quantities and sold counts and clear cart
    await this.orderUtilsProvider.updateProductsInventoryAndClearCart(order);

    return order.save();
  }

  /**
   *//***** handle Card Order Delivered  ******
   * @param orderId
   * @returns Order
   */
  async handleCardOrderDelivered(orderId: string): Promise<Order> {
    const order = await this.findOrderById(orderId);

    order.deliveredAt = new Date();
    order.status = OrderStatus.DELIVERED;

    return order.save();
  }

  //TODO: refund logic
}
