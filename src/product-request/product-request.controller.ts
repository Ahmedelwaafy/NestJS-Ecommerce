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
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';
import { CreateProductRequestDto } from './dto/create-product-request.dto';
import { UpdateProductRequestDto } from './dto/update-product-request.dto';
import { ProductRequestService } from './product-request.service';

@Controller('v1/product-request')
export class ProductRequestController {
  constructor(private readonly productRequestService: ProductRequestService) {}

  /**
   * //***** Create a product request ******
   */
  @Post()
  @Roles(['user'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product requested created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new product request',
    description: 'Creates a new product request',
  })
  @ApiBody({
    description: 'The product request details',
    type: CreateProductRequestDto,
  })
  @ResponseMessage(['CREATED_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  create(
    @Body() createProductRequestDto: CreateProductRequestDto,
    @ActiveUser('id') id: ActiveUserData['id'],
  ) {
    return this.productRequestService.create({
      ...createProductRequestDto,
      user: id,
    });
  }

  /**
   * //***** Get all product requests ******
   */
  @Get()
  @Roles([Role.Admin, Role.User]) //user can get all his product requests also
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all product requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Product requests fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  findAll(
    @Query() getCouponsQuery: PaginationAndFiltersDto,
    @ActiveUser() sender: ActiveUserData,
  ) {
    const { limit, page, ...filters } = getCouponsQuery;
    return this.productRequestService.findAll({ page, limit }, sender, filters);
  }

  /**
   * //***** Get a Product request ******
   */
  @Get(':id')
  @Roles([Role.Admin, Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Fetches a product request by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product request fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product request id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  findOne(@Param('id') id: string, @ActiveUser() sender: ActiveUserData) {
    return this.productRequestService.findOne(id, sender);
  }

  /**
   * //***** Update a Product request ******
   */
  @Patch(':id')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a product request by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product request updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product request id',
    type: String,
  })
  @ApiBody({
    description: 'Product request details',
    type: UpdateProductRequestDto,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  update(
    @Param('id') id: string,
    @Body() updateProductRequestDto: UpdateProductRequestDto,
    @ActiveUser() sender: ActiveUserData,
  ) {
    return this.productRequestService.update(
      id,
      updateProductRequestDto,
      sender,
    );
  }

  /**
   * //***** Accept a Product request ******
   */
  @Patch('accept/:id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'accept a product request by the admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Product request accepted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product request id',
    type: String,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  accept(@Param('id') id: string, @ActiveUser() sender: ActiveUserData) {
    return this.productRequestService.acceptProductRequest(id, sender);
  }

  /**
   * //***** Delete a Coupon ******
   */
  @Delete(':id')
  @Roles([Role.Admin, Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a product request by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product request deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product request id',
    type: String,
  })
  @ResponseMessage(['DELETED_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  remove(@Param('id') id: string, @ActiveUser() sender: ActiveUserData) {
    return this.productRequestService.remove(id, sender);
  }
}
