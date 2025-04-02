import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ProductRequestService } from './product-request.service';
import { CreateProductRequestDto } from './dto/create-product-request.dto';
import { UpdateProductRequestDto } from './dto/update-product-request.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';

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
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all product requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Product requests fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'PRODUCT_REQUEST'])
  findAll(@Query() getCouponsQuery: PaginationAndFiltersDto) {
    const { limit, page, ...filters } = getCouponsQuery;
    return this.productRequestService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Product request ******
   */
  @Get(':id')
  @Roles(['admin', 'user'])
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductRequestDto: UpdateProductRequestDto,
  ) {
    return this.productRequestService.update(+id, updateProductRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productRequestService.remove(+id);
  }
}
