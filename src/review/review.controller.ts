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
import { Role } from 'src/auth/enums/role.enum';
import { AuthGuard } from 'src/auth/gaurds/auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { ActiveUserData } from 'src/auth/interfaces/active-user.interface';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Sort } from 'src/common/enums';

@Controller('v1/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * //***** Create a Review ******
   */
  @Post()
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Review created successfully',
  })
  @ApiOperation({
    summary: 'Creates a new review',
    description: 'Creates a new review',
  })
  @ApiBody({
    description: 'Review details',
    type: CreateReviewDto,
  })
  @ResponseMessage(['CREATED_SUCCESSFULLY', 'REVIEW'])
  create(
    @Body() createReviewDto: CreateReviewDto,
    @ActiveUser('id') id: ActiveUserData['id'],
  ) {
    return this.reviewService.create({ ...createReviewDto, user: id });
  }

  /**
   * //***** Get all Review ******
   */
  @Get()
  @Roles([Role.Admin, Role.User]) //user can get all his reviews also
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all reviews',
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews fetched successfully',
  })
  @ResponseMessage(['GET_ALL_SUCCESSFULLY', 'REVIEW'])
  findAll(
    @Query() getReviewsQuery: GetReviewsDto,
    @ActiveUser() sender: ActiveUserData,
  ) {
    const { limit, page, ...filters } = getReviewsQuery;
    return this.reviewService.findAll({ page, limit }, sender, filters);
  }

  /**
   * //***** Get a Review ******
   */
  @Get(':id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Fetches a review by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Review fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Review id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'REVIEW'])
  findOne(@Param('id') id: string, @ActiveUser() sender: ActiveUserData) {
    return this.reviewService.findOne(id, sender);
  }

  /**
   * //***** Get a Product Reviews ******
   */
  @Get('/product/:id')
  @ApiOperation({
    summary: 'Fetches a product reviews by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product reviews fetched successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: String,
  })
  @ResponseMessage(['GET_ONE_SUCCESSFULLY', 'REVIEW'])
  findOneProductReviews(
    @Param('id') product: string,
    @Query() getPaginationQuery: PaginationQueryDto,
  ) {
    return this.reviewService.findAll(getPaginationQuery, null, {
      product,
      sort: Sort.desc,
    });
  }

  /**
   * //***** Update a Review ******
   */
  @Patch(':id')
  @Roles([Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Updates a user review by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Review id',
    type: String,
  })
  @ApiBody({
    description: 'Review details',
    type: UpdateReviewDto,
  })
  @ResponseMessage(['UPDATED_SUCCESSFULLY', 'REVIEW'])
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @ActiveUser() sender: ActiveUserData,
  ) {
    return this.reviewService.update(id, updateReviewDto, sender);
  }

  /**
   * //***** Accept a Review ******
   */
  @Patch('/accept/:id')
  @Roles([Role.Admin])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Accepts a user review by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Review accepted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Review id',
    type: String,
  })
  @ResponseMessage(['ACCEPTED_SUCCESSFULLY', 'REVIEW'])
  accept(@Param('id') id: string, @ActiveUser() sender: ActiveUserData) {
    return this.reviewService.accept(id, sender);
  }

  /**
   * //***** Delete a Review ******
   */
  @Delete(':id')
  @Roles([Role.Admin, Role.User])
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Deletes a review by its id',
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Review id',
    type: String,
  })
  @ResponseMessage(['DELETED_SUCCESSFULLY', 'REVIEW'])
  remove(@Param('id') id: string, @ActiveUser() sender: ActiveUserData) {
    return this.reviewService.remove(id, sender);
  }
}
