// pagination.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  public async paginateQuery<T>(
    paginationQuery: PaginationQueryDto,
    model: Model<T>,
    options?: {
      filters?: Record<string, any>;
      select?: string;
    },
  ): Promise<Paginated<T>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = options?.filters || {};
    const selectFields = options?.select || '-__v';

    const [results, totalItems] = await Promise.all([
      model.find(query).skip(skip).limit(limit).select(selectFields).exec(),
      model.countDocuments(query).exec(),
    ]);

    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = page === totalPages ? page : page + 1;
    const previousPage = page === 1 ? 1 : page - 1;

    return {
      data: results,
      meta: {
        itemsPerPage: limit,
        totalItems,
        totalPages,
        currentPage: page,
      },
      links: {
        first: `${newUrl.origin}${newUrl.pathname}?page=1&limit=${limit}`,
        previous: `${newUrl.origin}${newUrl.pathname}?page=${previousPage}&limit=${limit}`,
        next: `${newUrl.origin}${newUrl.pathname}?page=${nextPage}&limit=${limit}`,
        last: `${newUrl.origin}${newUrl.pathname}?page=${totalPages}&limit=${limit}`,
        current: `${newUrl.origin}${newUrl.pathname}?page=${page}&limit=${limit}`,
      },
    };
  }
}
