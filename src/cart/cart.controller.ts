import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CartService } from './cart.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { BaseCreateCartDto } from './dto/create-cart.dto';
import { GetCartsDto } from './dto/get-carts.dto';
import { BaseUpdateCartDto, UpdateCartDto } from './dto/update-cart.dto';

@Controller('v1/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * //***** Add to cart ******
   */
  @Post('add')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Added to cart successfully',
  })
  @ApiOperation({
    summary: 'Add to cart',
    description: 'Add to cart',
  })
  @ApiBody({
    description: 'Item details',
    type: BaseCreateCartDto,
  })
  @ResponseMessage(['ADDED_TO_CART_SUCCESSFULLY'])
  create(
    @Body() baseCreateCartDto: BaseCreateCartDto,
    @ActiveUser('id') userId: ActiveUserData['id'],
  ) {
    return this.cartService.addToCart({ ...baseCreateCartDto, userId });
  }

  /**
   * //***** Get all Cart ******
   */
  @Get()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all carts',
  })
  @ApiResponse({
    status: 200,
    description: 'Carts fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'CART'])
  findAll(@Query() getCartsQuery: GetCartsDto) {
    const { limit, page, ...filters } = getCartsQuery;
    return this.cartService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Cart ******
   */
  @Get('check')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Fetches a cart by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'CART'])
  findOne(@ActiveUser('id') userId: ActiveUserData['id']) {
    return this.cartService.findOne(userId);
  }

  /**
   * //***** Update a Cart ******
   */
  @Patch()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a user cart by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Cart id',
    type: String,
  })
  @ApiBody({
    description: 'Cart details',
    type: UpdateCartDto,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'CART'])
  update(
    @Body() baseUpdateCartDto: BaseUpdateCartDto,
    @ActiveUser('id') userId: ActiveUserData['id'],
  ) {
    return this.cartService.updateCartItem({
      ...baseUpdateCartDto,
      userId,
    });
  }

  /**
   * //***** Remove item from cart ******
   */
  @Delete('item/:productId')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'productId', description: 'product id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product removed from cart successfully',
  })
  @ResponseMessage(['DELETED_FROM_CART_SUCCESSFULLY'])
  removeCartItem(
    @Param('productId') productId: string,
    @Query('color') color: string,
    @Query('size') size: string,
    @ActiveUser('id') userId: string,
  ) {
    return this.cartService.removeCartItem(userId, productId, color, size);
  }

  /**
   * //***** Clear cart ******
   */
  @Delete('clear')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear all items from cart' })
  @ResponseMessage(['DELETED_SUCCESSFULLY', 'CART'])
  clearCart(@ActiveUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  /**
   * //***** Apply Coupon ******
   */
  @Patch('apply-coupon')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Apply a coupon to the cart' })
  @ApiBody({ type: ApplyCouponDto })
  @ApiResponse({
    status: 200,
    description: 'Coupon applied successfully',
  })
  @ResponseMessage(['CART_COUPON_APPLIED_SUCCESSFULLY'])
  applyCoupon(
    @Body() applyCouponDto: ApplyCouponDto,
    @ActiveUser('id') userId: string,
  ) {
    return this.cartService.applyCoupon(userId, applyCouponDto);
  }

  /**
   * //***** Remove Coupon ******
   */
  @Patch('remove-coupon/:couponId')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove a coupon from the cart' })
  @ApiParam({ name: 'couponId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Coupon removed successfully',
  })
  @ResponseMessage(['CART_COUPON_REMOVED_SUCCESSFULLY'])
  removeCoupon(
    @Param('couponId') couponId: string,
    @ActiveUser('id') userId: string,
  ) {
    return this.cartService.removeCoupon(userId, couponId);
  }
}
