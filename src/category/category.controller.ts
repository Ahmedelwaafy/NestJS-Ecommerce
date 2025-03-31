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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { GetCategoriesDto } from './dto/get-categories.dto';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * //***** Create a Category ******
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'category created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new category',
    description: 'Creates a new category',
  })
  @ApiBody({
    description: 'Category details',
    type: CreateCategoryDto,
  })
  @ResponseMessage('category created successfully')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * //***** Get all Category ******
   */
  @Get()
  @ApiOperation({
    summary: 'Get all categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully',
  })
  @ResponseMessage('all categories data fetched successfully')
  findAll(@Query() getCategoriesQuery: GetCategoriesDto) {
    const { limit, page, ...filters } = getCategoriesQuery;

    return this.categoryService.findAll({ page, limit }, filters);
  }

  /**
   * //***** Get a Category ******
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Fetches a category by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id',
    type: String,
  })
  @ResponseMessage('category.fetched_successfully')
  
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  /**
   * //***** Update a Category ******
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a category by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id',
    type: String,
  })
  @ApiBody({
    description: 'Category details',
    type: UpdateCategoryDto,
  })
  @ResponseMessage('Category updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * //***** Delete a Category ******
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a category by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id',
    type: String,
  })
  @ResponseMessage('Category deleted successfully')
  deactivate(@Param('id') id: string) {
    return this.categoryService.deactivate(id);
  }

  /**
   * //***** Restore a Category ******
   */
  @Patch('restore/:id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Restores a category by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Category restored successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Category id',
    type: String,
  })
  @ResponseMessage('Category restored successfully')
  activate(@Param('id') id: string) {
    return this.categoryService.activate(id);
  }
}
