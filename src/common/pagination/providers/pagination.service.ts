// pagination.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Model, PopulateOptions } from 'mongoose';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';
import { Sort } from 'src/common/enums';
import { I18nHelperService } from 'src/i18n/providers/I18n-helper-service';

@Injectable()
export class PaginationService {
  private lang: string;

  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly i18nHelper: I18nHelperService,
  ) {
    this.lang = this.i18nHelper.createNamespaceTranslator('').lang;
  }

  public async paginateQuery<T>(
    paginationQuery: PaginationQueryDto,
    model: Model<T>,
    options?: {
      filters?: Record<string, any>;
      select?: string;
      sort: Sort; // default value set in the BaseFiltersDto
      populate?: PopulateOptions | (string | PopulateOptions)[];
    },
  ): Promise<Paginated<T>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const query = options?.filters || {};
    const selectFields = options?.select || '-__v';

    let findQuery = model
      .find(query)
      .skip(skip)
      .limit(limit)
      .select(selectFields)
      .sort({ createdAt: options.sort });

    // Apply populate if provided
    if (options?.populate) {
      findQuery = findQuery.populate(options.populate);
    }

    const [results, totalItems] = await Promise.all([
      findQuery.exec(),
      model.countDocuments(query).exec(),
    ]);

    const baseUrl =
      this.request.protocol + '://' + this.request.headers.host + '/';
    const newUrl = new URL(this.request.url, baseUrl);

    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = page === totalPages ? page : page + 1;
    const previousPage = page === 1 ? 1 : page - 1;

    const localizedResults = model.schema.methods.toJSONLocalizedOnly
      ? model.schema.methods.toJSONLocalizedOnly(results, this.lang)
      : results;
    return {
      data: localizedResults,
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
