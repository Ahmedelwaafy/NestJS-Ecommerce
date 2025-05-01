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
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('v1/brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  /**
   * //***** Create a Brand ******
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'brand created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new brand',
    description: 'Creates a new brand',
  })
  @ApiBody({
    description: 'Brand details',
    type: CreateBrandDto,
  })
  @ResponseMessage(['CREATED_SUCCESSFULLY', 'BRAND'])
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  /**
   * //***** Get all Brand ******
   */
  @Get()
  @ApiOperation({
    summary: 'Get all brands',
  })
  @ApiResponse({
    status: 200,
    description: 'Brands fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'BRAND'])
  findAll(@Query() getBrandsQuery: PaginationAndFiltersDto) {
    const { limit, page, ...filters } = getBrandsQuery;

    return this.brandService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Brand ******
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Fetches a brand by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'BRAND'])
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  /**
   * //***** Update a Brand ******
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a brand by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand id',
    type: String,
  })
  @ApiBody({
    description: 'Brand details',
    type: UpdateBrandDto,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'BRAND'])
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  /**
   * //***** Delete a Brand ******
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a brand by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand id',
    type: String,
  })
  @ResponseMessage(['DELETED_SUCCESSFULLY', 'BRAND'])
  deactivate(@Param('id') id: string) {
    return this.brandService.deactivate(id);
  }

  /**
   * //***** Restore a Brand ******
   */
  @Patch('restore/:id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Restores a brand by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand restored successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand id',
    type: String,
  })
  @ResponseMessage(['RESTORED_SUCCESSFULLY', 'BRAND'])
  activate(@Param('id') id: string) {
    return this.brandService.activate(id);
  }
}
