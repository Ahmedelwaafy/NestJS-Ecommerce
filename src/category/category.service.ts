import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesBaseDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { TFunction } from 'src/i18n/types';

@Injectable()
export class CategoryService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting category model
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
  ) {
    // Set up namespace name globally per class
    this.t = this.i18nHelper.createNamespaceTranslator('category').t;
    this.lang = this.i18nHelper.createNamespaceTranslator('category').lang;
  }

  /**
   *//***** Create Category ******
   * @param createCategoryDto
   * @returns Category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.findOneByName(createCategoryDto.name);

    // handle exception if category already exists
    if (category) {
      throw new BadRequestException(this.t('service.ALREADY_EXISTS'));
    }

    // create new category
    try {
      const newCategory = await this.categoryModel.create(createCategoryDto);
      return newCategory;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
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

  /**
   *//***** Get Single Category ******
   * @param id
   * @returns Category
   */
  async findOne(id: string) {
    let category: Category;
    try {
      category = await this.categoryModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!category) {
      throw new NotFoundException(this.t('service.NOT_FOUND'));
    }
    const localizedCategory =
      this.categoryModel.schema.methods.toJSONLocalizedOnly(
        category,
        this.lang,
      );

    return localizedCategory;
  }

  /**
   *//***** Get Single Category ******
   * @param name
   * @returns Category
   */
  async findOneByName(name: LocalizedFieldDto) {
    let category: CategoryDocument;
    try {
      category = await this.categoryModel.findOne({
        $or: [{ 'name.en': name.en }, { 'name.ar': name.ar }],
      });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return category;
  }

  /**
   *//***** Update Single Category ******
   * @param id
   * @returns Category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    //check if the category exists
    await this.findOne(id);

    if (updateCategoryDto?.name) {
      const categoryNameTaken = await this.findOneByName(
        updateCategoryDto.name,
      );
      //console.log({ categoryNameTaken });
      if (categoryNameTaken && categoryNameTaken._id.toString() !== id) {//prevent duplicate categories names, while allowing changing only en or ar values
        throw new BadRequestException(this.t('service.ALREADY_EXISTS'));
      }
    }
    //update the category
    try {
      const updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true },
      );
      return updatedCategory;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Deactivate Single Category ******
   * @param id
   */
  async deactivate(id: string) {
    await this.update(id, { active: false });
  }

  /**
   *//***** Activate Single Category ******
   * @param id
   */
  async activate(id: string) {
    await this.update(id, { active: true });
  }
}
