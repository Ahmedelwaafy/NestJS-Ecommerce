import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';
import Stripe from 'stripe';
import { OrderStatus } from '../enums';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrderUtilsProvider } from './order-utils.provider';
import { ConfigService } from '@nestjs/config';

//stripe listen --forward-to localhost:3000/api/v1/order/stripe-webhook
// eslint-disable-next-line @typescript-eslint/no-require-imports
/* const stripe = require('stripe')(
  `sk_test_51RF...`,
); */

@Injectable()
export class StripeProvider {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private orderUtilsProvider: OrderUtilsProvider,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get('paymentGateway.stripe.secretKey'),
      {
        apiVersion: '2025-03-31.basil',
      },
    );
  }

  //***** Create Stripe Checkout Session ******

  async createStripeCheckoutSession(
    order: OrderDocument,
    user: UserDocument,
    successUrl: string,
    cancelUrl: string,
  ) {
    //: Promise<Stripe.Checkout.Session>

    // Map cart items to line items for Stripe
    const lineItems = order.orderItems.map((item) => {
      return {
        price_data: {
          currency: 'egp', // Change as appropriate
          product_data: {
            name: item.product.name,
            description: `Order #${order._id}`,
            images: [item.product.image],
            metadata: {
              productId: item.product._id,
              color: item.color || '',
              size: item.size || '',
            },
          },
          unit_amount: Math.round(
            (item.product.priceAfterDiscount || item.product.price) * 100,
          ), // Convert to cents
          tax_behavior: 'exclusive',
        },
        quantity: item.quantity,
      };
    });

    // Add shipping and taxes as separate line items
    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'egp',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          product_data: {
            name: 'Shipping',
            description: 'Shipping costs',
          },
          unit_amount: Math.round(order.shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'egp',
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          product_data: {
            name: 'Tax',
            description: 'Tax',
          },
          unit_amount: Math.round(order.tax * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const session = await this.stripe.checkout.sessions.create({
      //payment_method_types: ['card'],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      client_reference_id: user._id.toString(),
      customer_email: user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
      },
      invoice_creation: { enabled: true },
    });

    return {
      sessionUrl: session.url,
      sessionId: session.id,
      finalTotal: session.amount_total,
      gateway: 'stripe',
      status: 'pending',
      expiresAt: new Date(session.expires_at * 1000),
    };
  }

  //***** Handle Stripe Webhook ******

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    let event;
    const endpointSecret = this.configService.get(
      'paymentGateway.stripe.webhookSecret',
    );
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        console.log({ event });
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  //***** Handle Checkout Session Completed ******

  async handleCheckoutSessionCompleted(
    session: any,
    //session: Stripe.Checkout.Session,
  ): Promise<void> {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      throw new BadRequestException('Order ID not found in session metadata');
    }

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Update order status and set paidAt timestamp
    order.status = OrderStatus.PAID;
    order.paidAt = new Date();
    order.paymentDetails = {
      ...order.paymentDetails,
      status: 'paid',
      receiptUrl: session.charges?.data[0]?.receipt_url,
    };

    await order.save();

    // Update product quantities and sold counts and clear cart
    await this.orderUtilsProvider.updateProductsInventoryAndClearCart(order);
  }
}
