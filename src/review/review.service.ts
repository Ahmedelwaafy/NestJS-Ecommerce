import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/auth/enums/role.enum';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { PaginationService } from 'src/common/pagination/providers/pagination.service';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';
import { TFunction } from 'src/i18n/types';
import { ProductService } from 'src/product/product.service';
import { BaseReviewDto } from './dto/create-review.dto';
import { GetReviewsFiltersDto } from './dto/get-reviews.dto';
import { BaseUpdateReviewDto } from './dto/update-review.dto';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewService {
  private t: TFunction;
  private lang: string;

  constructor(
    //* injecting review model
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
    private readonly paginationService: PaginationService,
    private readonly i18nHelper: I18nHelperService,
    private readonly productService: ProductService,
  ) {
    this.t = this.i18nHelper.translate().t;
    this.lang = this.i18nHelper.translate().lang;
  }

  /**
   *//***** Create Review ******
   * @param createReviewDto
   * @returns Review
   */
  async create(createReviewDto: BaseReviewDto) {
    const review = await this.reviewModel.findOne({
      user: createReviewDto.user,
      product: createReviewDto.product,
    });

    // handle exception if a review for this product from this user already exists
    if (review) {
      throw new BadRequestException(this.t('service.REVIEW_ALREADY_EXISTS'));
    }

    //check if the product exists, exception is handled internally by findOne method
    await this.productService.findOne(createReviewDto.product);

    // create new review
    try {
      const newReview = await this.reviewModel.create(createReviewDto);
      return newReview;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Get All Reviews ******
   * @param paginationQuery
   * @param getReviewsQuery
   * @returns Paginated<Review>
   */
  async findAll(
    paginationQuery: PaginationQueryDto,
    sender: ActiveUserData,
    getReviewsQuery?: GetReviewsFiltersDto,
  ): Promise<Paginated<Review>> {
    const filters: Record<string, any> = {};

    // Build filters dynamically

    const { isApproved, product, sort, minRating } = getReviewsQuery;
    /* console.log({
      sort,
      sender,
      isApproved,
    }); */
    if (isApproved !== undefined) {
      filters.isApproved = isApproved;
    }
    if (product !== undefined) {
      filters.product = product;
    }
    if (minRating !== undefined) {
      filters.rating = { $gte: minRating };
    }

    //allow the user to find all his reviews only
    if (sender && sender.role !== Role.Admin) {
      //keep sender&& condition to allow findOneProductReviews to work
      filters.user = sender.id;
    }

    return this.paginationService.paginateQuery(
      paginationQuery,
      this.reviewModel,
      {
        filters,
        sort,
        populate: [
          { path: 'user', select: 'name _id' },
          { path: 'product', select: 'name _id' },
        ],
      },
    );
  }

  /**
   *//***** Get Single Review ******
   * @param id
   * @returns Review
   */
  async findOne(id: string, sender: ActiveUserData) {
    let review: Review;
    try {
      review = await this.reviewModel.findById(id);
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
    if (!review) {
      throw new NotFoundException(
        this.t('service.NOT_FOUND', {
          args: {
            MODEL_NAME: this.t(`common.MODELS_NAMES.REVIEW`),
          },
        }),
      );
    }

    if (sender.role !== Role.Admin && review.user.toString() !== sender.id) {
      throw new UnauthorizedException(this.t(`common.ACCESS_NOT_ALLOWED`));
    }
    return review;
  }

  /**
   *//***** Update Single Review ******
   * @param id
   * @returns Review
   */
  async update(
    id: string,
    updateReviewDto: BaseUpdateReviewDto,
    sender: ActiveUserData,
  ) {
    //check if the review exists
    const review = await this.findOne(id, sender);

    //check if the product exists, exception is handled internally by findOne method
    await this.productService.findOne(review.product.toString());

    //update the review
    try {
      const updatedReview = await this.reviewModel.findByIdAndUpdate(
        id,
        updateReviewDto,
        {
          new: true,
        },
      );

      // Only update product ratings if review is approved
      if (updatedReview.isApproved) {
        await this.updateProductRatings(updatedReview.product.toString());
      }

      return updatedReview;
    } catch (error) {
      throw new RequestTimeoutException(this.t('service.ERROR_OCCURRED'), {
        description:
          error.message || this.t('service.DATABASE_CONNECTION_FAILED'),
      });
    }
  }

  /**
   *//***** Accept Single Review ******
   * @param id
   * @returns Review
   */
  async accept(id: string, sender: ActiveUserData) {
    return await this.update(id, { isApproved: true }, sender);
  }

  /**
   *//***** Deactivate Single Review ******
   * @param id
   */
  async remove(id: string, sender: ActiveUserData) {
    //check if the review exists
    const review = await this.findOne(id, sender);

    //delete the review
    await this.reviewModel.findByIdAndDelete(id);

    // Only update product ratings if deleted review was approved
    if (review.isApproved) {
      await this.updateProductRatings(review.product.toString());
    }
  }

  /**
   *//***** Updates the product ratings statistics ******
   *  whenever reviews are created, updated, or deleted
   * @param product ID of the product to update ratings for
   */
  async updateProductRatings(product: string): Promise<void> {
    // Get all approved reviews for this product
    const reviews = await this.reviewModel
      .find({
        product,
        isApproved: true,
      })
      .select('rating');

    const ratingsQuantity = reviews.length;

    if (ratingsQuantity > 0) {
      // Calculate average using reduce
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const ratingsAverage = totalRating / ratingsQuantity;
      /* console.log({
        ratingsAverage,
        ratingsQuantity,
      }); */
      // Update product with new rating statistics
      await this.productService.update(product, {
        ratingsAverage: Math.round(ratingsAverage),
        ratingsQuantity,
      });
    } else {
      // No reviews - reset ratings
      await this.productService.update(product, {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      });
    }
  }
}
