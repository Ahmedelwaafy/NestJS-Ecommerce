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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('v1/coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * //***** Create a Coupon ******
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'coupon created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new coupon',
    description: 'Creates a new coupon',
  })
  @ApiBody({
    description: 'Coupon details',
    type: CreateCouponDto,
  })
  @ResponseMessage('coupon.controller.CREATED_SUCCESSFULLY')
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  /**
   * //***** Get all Coupon ******
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all coupons',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupons fetched successfully',
  })
  @ResponseMessage('coupon.controller.GET_ALL_SUCCESSFULLY')
  findAll(@Query() getCouponsQuery: PaginationAndFiltersDto) {
    const { limit, page, ...filters } = getCouponsQuery;

    return this.couponService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Coupon ******
   */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Fetches a coupon by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Coupon id',
    type: String,
  })
  @ResponseMessage('coupon.controller.GET_ONE_SUCCESSFULLY')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  /**
   * //***** Update a Coupon ******
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a coupon by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Coupon id',
    type: String,
  })
  @ApiBody({
    description: 'Coupon details',
    type: UpdateCouponDto,
  })
  @ResponseMessage('coupon.controller.UPDATED_SUCCESSFULLY')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  /**
   * //***** Delete a Coupon ******
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a coupon by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Coupon deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Coupon id',
    type: String,
  })
  @ResponseMessage('coupon.controller.DELETED_SUCCESSFULLY')
  deactivate(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}
