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
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { GetCategoriesDto } from './dto/get-categories.dto';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

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
  @ResponseMessage('category created successfully')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

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
  @ResponseMessage('Category data fetched successfully')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
