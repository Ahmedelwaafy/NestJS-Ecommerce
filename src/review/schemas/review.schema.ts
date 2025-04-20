import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Product } from 'src/product/schemas/product.schema';
import { User } from 'src/user/schemas/user.schema';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true })
export class Review {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  product: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    trim: true,
  })
  comment?: string;

  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  isApproved: boolean;
}

// Add indexes for common queries
export const ReviewSchema = SchemaFactory.createForClass(Review);

// For users viewing approved reviews for a specific product, sorted by rating
ReviewSchema.index({ product: 1, isApproved: 1, rating: -1 });

// For admin viewing all reviews, potentially filtered by approval status
ReviewSchema.index({ isApproved: 1, createdAt: -1 });

// For user viewing their own reviews (both approved and unapproved)
ReviewSchema.index({ user: 1, createdAt: -1 });
