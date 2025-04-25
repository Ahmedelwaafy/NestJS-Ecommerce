import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Headers,
  Patch,
  RawBodyRequest,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { GetOrdersDto } from './dto/get-orders.dto';
import { Request } from 'express';

@Controller('v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * //***** Create Order ******
   */
  @Post()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Creates a new order',
    description: 'Creates a new order',
  })
  @ApiBody({
    description: 'Order details',
    type: CreateOrderDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
  })
  @ResponseMessage(['CREATED_SUCCESSFULLY', 'ORDER'])
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @ActiveUser('id') userId: ActiveUserData['id'],
  ): Promise<Order> {
    return this.orderService.createOrder(createOrderDto, userId);
  }

  /**
   * //***** get all orders (admin) ******
   */
  @Get('all')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'ORDER'])
  findAll(@Query() getOrdersQuery: GetOrdersDto) {
    const { limit, page, ...filters } = getOrdersQuery;
    return this.orderService.findAll({ page, limit }, filters);
  }

  /**
   * //***** get all orders (user) ******
   */
  @Get()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'ORDER'])
  async getUserOrders(
    @ActiveUser('id') userId: ActiveUserData['id'],
  ): Promise<Order[]> {
    return this.orderService.getUserOrders(userId);
  }

  /**
   * //***** Get order by id ******
   */
  @Get(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get order by id',
  })
  @ApiResponse({
    status: 200,
    description: 'Order fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Order id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'ORDER'])
  async getOrderById(@Param('id') id: string): Promise<Order> {
    return this.orderService.findOrderById(id);
  }

  /**
   * //***** Update Cash Order Statuses (paidAt & deliveredAt) ******
   */
  @Patch(':id/cash-completed')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'update Cash Order Statuses (paidAt & deliveredAt)',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Order id',
    type: String,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'ORDER'])
  async handleCashOrderDelivered(@Param('id') id: string): Promise<Order> {
    return this.orderService.handleCashOrderDelivered(id);
  }

  /**
   * //***** Update order delivering time ******
   */
  @Patch(':id/delivered')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update order delivering time',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Order id',
    type: String,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'ORDER'])
  async handleCardOrderDelivered(@Param('id') id: string): Promise<Order> {
    return this.orderService.handleCardOrderDelivered(id);
  }

  @Post('stripe-webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    await this.orderService.handleStripeWebhook(req.rawBody, signature);
    return { received: true };
  }

  @Post('paymob-webhook')
  async handlePaymobWebhook(
    @Body() payload: any,
    @Headers('hmac') hmacHeader: string,
  ): Promise<{ received: boolean }> {
    await this.orderService.handlePaymobWebhook(payload, hmacHeader);
    return { received: true };
  }
}
