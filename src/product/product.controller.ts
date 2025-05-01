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
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  AnyFilesInterceptor
} from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('v1/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * //***** Create a Product ******
   */
  @Post()
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  //? both cannot be used together
  /* @UseInterceptors(
    FileInterceptor('imageCover'), // for single image
    FilesInterceptor('images', 3, { preservePath: true }), // for multiple images
  ) */
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new product',
    description: 'Creates a new product',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product details',
    type: CreateProductDto,
  })
  @ResponseMessage(['CREATED_SUCCESSFULLY', 'PRODUCT'])
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imageCover = files.find((file) => file.fieldname === 'imageCover');
    const images = files.filter((file) => file.fieldname === 'images');

    return this.productService.create(createProductDto, imageCover, images);
  }

  /**
   * //***** Get all Product ******
   */
  @Get()
  @ApiOperation({
    summary: 'Get all products',
  })
  @ApiResponse({
    status: 200,
    description: 'Products fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'PRODUCT'])
  findAll(@Query() getProductsQuery: GetProductsDto) {
    const { limit, page, ...filters } = getProductsQuery;
    return this.productService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Product ******
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Fetches a product by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'PRODUCT'])
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  /**
   * //***** Update a Product ******
   */
  @Patch(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a product by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: String,
  })
  @ApiBody({
    description: 'Product details',
    type: UpdateProductDto,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'PRODUCT'])
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * //***** Delete a Product ******
   */
  @Delete(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a product by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: String,
  })
  @ResponseMessage(['DELETED_SUCCESSFULLY', 'PRODUCT'])
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
