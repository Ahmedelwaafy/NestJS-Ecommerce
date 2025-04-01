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
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { GetSubCategoriesBaseDto } from './dto/get-sub-categories.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import {
  SubCategory,
  SubCategoryDocument,
} from './schemas/sub-category.schema';
import { TFunction } from 'src/i18n/types';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class SubCategoryService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting subCategory model
    @InjectModel(SubCategory.name)
    private readonly subCategoryModel: Model<SubCategory>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
    private readonly categoryService: CategoryService,
  ) {
    // Set up namespace name globally per class
    this.t = this.i18nHelper.createNamespaceTranslator('sub-category').t;
    this.lang = this.i18nHelper.createNamespaceTranslator('sub-category').lang;
  }

  /**
   *//***** Create SubCategory ******
   * @param createSubCategoryDto
   * @returns SubCategory
   */
  async create(createSubCategoryDto: CreateSubCategoryDto) {
    const subCategory = await this.findOneByName(createSubCategoryDto.name);

    // handle exception if subCategory already exists
    if (subCategory) {
      throw new BadRequestException(this.t('service.ALREADY_EXISTS'));
    }

    const category = await this.categoryService.findOne(
      createSubCategoryDto.category,
    );
    // handle exception if parent category does not already exists
    if (!category) {
      throw new BadRequestException(
        this.t('service.PARENT_CATEGORY_DOES_NOT_EXIST'),
      );
    }

    // create new subCategory
    try {
      const newSubCategory =
        await this.subCategoryModel.create(createSubCategoryDto);
      return newSubCategory;
    } catch (error) {
      console.log({ error });
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All SubCategories ******
   * @param paginationQuery
   * @param getSubCategoriesQuery
   * @returns Paginated<SubCategory>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    getSubCategoriesQuery?: GetSubCategoriesBaseDto,
  ): Promise<Paginated<SubCategory>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    if (getSubCategoriesQuery?.active !== undefined) {
      filters.active = getSubCategoriesQuery.active;
    }

    if (getSubCategoriesQuery?.search) {
      filters.$or = [
        { 'name.en': { $regex: getSubCategoriesQuery.search, $options: 'i' } },
        { 'name.ar': { $regex: getSubCategoriesQuery.search, $options: 'i' } },
      ];
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.subCategoryModel,
      {
        filters,
        select: ' -__v',
        ...(getSubCategoriesQuery?.sort && {
          sort: getSubCategoriesQuery.sort,
        }),
      },
    );
  }

  /**
   *//***** Get Single SubCategory ******
   * @param id
   * @returns SubCategory
   */
  async findOne(id: string) {
    let subCategory: SubCategory;
    try {
      subCategory = await this.subCategoryModel
        .findById(id)
        .populate('category');
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!subCategory) {
      throw new NotFoundException(this.t('service.NOT_FOUND'));
    }
    const localizedSubCategory =
      this.subCategoryModel.schema.methods.toJSONLocalizedOnly(
        subCategory,
        this.lang,
      );

    return localizedSubCategory;
  }

  /**
   *//***** Get Single SubCategory ******
   * @param name
   * @returns SubCategory
   */
  async findOneByName(name: LocalizedFieldDto) {
    let subCategory: SubCategoryDocument;
    try {
      subCategory = await this.subCategoryModel.findOne({
        $or: [{ 'name.en': name.en }, { 'name.ar': name.ar }],
      });
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }

    return subCategory;
  }

  /**
   *//***** Update Single SubCategory ******
   * @param id
   * @returns SubCategory
   */
  async update(id: string, updateSubCategoryDto: UpdateSubCategoryDto) {
    //check if the subCategory exists
    await this.findOne(id);

    if (updateSubCategoryDto?.name) {
      const subCategoryNameTaken = await this.findOneByName(
        updateSubCategoryDto.name,
      );
      //console.log({ subCategoryNameTaken });
      if (subCategoryNameTaken && subCategoryNameTaken._id.toString() !== id) {
        //prevent duplicate categories names, while allowing changing only en or ar values
        throw new BadRequestException(this.t('service.ALREADY_EXISTS'));
      }
    }

    if (updateSubCategoryDto.category) {
      const category = await this.categoryService.findOne(
        updateSubCategoryDto.category,
      );
      // handle exception if parent category does not already exists
      if (!category || !category.active) {
        throw new BadRequestException(
          this.t('service.PARENT_CATEGORY_DOES_NOT_EXIST'),
        );
      }
    }
    //update the subCategory
    try {
      const updatedSubCategory = await this.subCategoryModel.findByIdAndUpdate(
        id,
        updateSubCategoryDto,
        { new: true },
      );
      return updatedSubCategory;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Deactivate Single SubCategory ******
   * @param id
   */
  async deactivate(id: string) {
    await this.update(id, { active: false });
  }

  /**
   *//***** Activate Single SubCategory ******
   * @param id
   */
  async activate(id: string) {
    await this.update(id, { active: true });
  }
}
