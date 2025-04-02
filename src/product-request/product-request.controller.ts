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
} from '@nestjs/common';
import { ProductRequestService } from './product-request.service';
import { CreateProductRequestDto } from './dto/create-product-request.dto';
import { UpdateProductRequestDto } from './dto/update-product-request.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';

@Controller('v1/product-request')
export class ProductRequestController {
  constructor(private readonly productRequestService: ProductRequestService) {}

  /**
   * //***** Create a Coupon ******
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

  @Get()
  findAll() {
    return this.productRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productRequestService.findOne(+id);
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
