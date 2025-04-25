import { Injectable } from '@nestjs/common';
import { CartService } from 'src/cart/cart.service';
import { ProductService } from 'src/product/product.service';
import { Order } from '../schemas/order.schema';

@Injectable()
export class OrderUtilsProvider {
  constructor(
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  //***** Update Products Inventory And Clear Cart ******
  // executed after delivering if payment method is cash
  //executed after paying if payment method is card

  async updateProductsInventoryAndClearCart(order: Order): Promise<void> {
    for (const item of order.orderItems) {
      await this.productService.updateProductAfterPurchase(
        item.product._id,
        item.quantity,
      );
    }

    // Clear the user's cart if needed
    await this.cartService.clearCart(order.user.toString());
  }
}
