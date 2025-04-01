import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { PaginationAndFiltersDto } from 'src/common/dto/base-filters.dto';

@Controller('v1/sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  /**
   * //***** Create a SubCategory ******
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'subCategory created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new subCategory',
    description: 'Creates a new subCategory',
  })
  @ApiBody({
    description: 'SubCategory details',
    type: CreateSubCategoryDto,
  })
  @ResponseMessage('sub-category.controller.CREATED_SUCCESSFULLY')
  create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    return this.subCategoryService.create(createSubCategoryDto);
  }

  /**
   * //***** Get all SubCategory ******
   */
  @Get()
  @ApiOperation({
    summary: 'Get all categories',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategories fetched successfully',
  })
  @ResponseMessage('sub-category.controller.GET_ALL_SUCCESSFULLY')
  findAll(@Query() getSubCategoriesQuery: PaginationAndFiltersDto) {
    const { limit, page, ...filters } = getSubCategoriesQuery;

    return this.subCategoryService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a SubCategory ******
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Fetches a subCategory by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'SubCategory id',
    type: String,
  })
  @ResponseMessage('sub-category.controller.GET_ONE_SUCCESSFULLY')
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(id);
  }

  /**
   * //***** Update a SubCategory ******
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a subCategory by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'SubCategory id',
    type: String,
  })
  @ApiBody({
    description: 'SubCategory details',
    type: UpdateSubCategoryDto,
  })
  @ResponseMessage('sub-category.controller.UPDATED_SUCCESSFULLY')
  update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    return this.subCategoryService.update(id, updateSubCategoryDto);
  }

  /**
   * //***** Delete a SubCategory ******
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a subCategory by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'SubCategory id',
    type: String,
  })
  @ResponseMessage('sub-category.controller.DELETED_SUCCESSFULLY')
  deactivate(@Param('id') id: string) {
    return this.subCategoryService.deactivate(id);
  }

  /**
   * //***** Restore a SubCategory ******
   */
  @Patch('restore/:id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Restores a subCategory by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory restored successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'SubCategory id',
    type: String,
  })
  @ResponseMessage('sub-category.controller.RESTORED_SUCCESSFULLY')
  activate(@Param('id') id: string) {
    return this.subCategoryService.activate(id);
  }
}
