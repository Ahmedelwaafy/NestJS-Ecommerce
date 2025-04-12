import { PartialType, OmitType } from '@nestjs/swagger';
import { BaseReviewDto, CreateReviewDto } from './create-review.dto';

// First omit product from CreateReviewDto, then make all remaining fields optional with PartialType
export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['product'] as const),
) {}

export class BaseUpdateReviewDto extends PartialType(
  OmitType(BaseReviewDto, ['product',"user"] as const),
) {}
