import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { Category } from './schemas/category.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { GetCategoriesBaseDto } from './dto/get-categories.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';

@Injectable()
export class CategoryService {
  constructor(
    //* injecting category model
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,

    private readonly paginationService: PaginationService,
  ) {}

  /**
   *//***** Create Category ******
   * @param createCategoryDto
   * @returns Category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.findOneByName(createCategoryDto.name);

    // handle exception if category already exists
    if (category) {
      throw new BadRequestException('category already exists');
    }

    // create new category
    try {
      const newCategory = await this.categoryModel.create(createCategoryDto);
      return newCategory;
    } catch (error) {
      throw new RequestTimeoutException('an error occurred', {
        description: error.message || 'unable to connect to the database',
      });
    }
  }

  /**
   *//***** Get All Categories ******
   * @param paginationQuery
   * @param getCategoriesQuery
   * @returns Paginated<Category>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getCategoriesQuery?: GetCategoriesBaseDto,
  ): Promise<Paginated<Category>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    if (getCategoriesQuery?.active !== undefined) {
      filters.active = getCategoriesQuery.active;
    }

    if (getCategoriesQuery?.search) {
      filters.$or = [
        { name: { $regex: getCategoriesQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.categoryModel,
      {
        filters,
        select: ' -__v',
        ...(getCategoriesQuery?.sort && { sort: getCategoriesQuery.sort }),
      },
    );
  }

  async findOne(id: number) {
    let category: Category;
    try {
      category = await this.categoryModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException('an error occurred', {
        description: error.message || 'unable to connect to the database',
      });
    }
    if (!category) {
      throw new NotFoundException('category not found');
    }
    return category;
  }
  async findOneByName(name: string) {
    let category: Category;
    try {
      category = await this.categoryModel.findOne({ name });
    } catch (error) {
      throw new RequestTimeoutException('an error occurred', {
        description: error.message || 'unable to connect to the database',
      });
    }

    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
