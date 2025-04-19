import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinDate,
  MinLength,
} from 'class-validator';
import { CouponType } from '../enums/coupon-type.enum';

export class CreateCouponDto {
  @ApiProperty({
    description: 'The code of the coupon.',
    example: 'SUMMER20',
  })
  @IsString({ message: 'validation.coupon.CODE_IS_STRING' })
  @MinLength(3, { message: 'validation.coupon.CODE_MIN_LENGTH' })
  @MaxLength(50, { message: 'validation.coupon.CODE_MAX_LENGTH' })
  code: string;

  @ApiProperty({
    description: 'The type of the coupon',
    example: CouponType.Fixed,
    enum: CouponType,
  })
  @IsEnum(CouponType, { message: 'validation.coupon.TYPE' })
  type: CouponType;

  @ApiProperty({
    description: 'The discount percentage of the coupon.',
    example: 20,
  })
  @IsNumber({}, { message: 'validation.coupon.DISCOUNT_IS_NUMBER' })
  @Min(1, { message: 'validation.coupon.DISCOUNT_MIN' })
  discount: number;

  @ApiPropertyOptional({
    description: 'The expiration date of the coupon.',
    example: '2023-10-01T00:00:00Z',
  })
  @IsDate({ message: 'validation.coupon.EXPIRATION_DATE_IS_DATE' })
  @MinDate(new Date(), {
    message: 'validation.coupon.EXPIRATION_DATE_IS_IN_FUTURE',
  })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'The active status of the coupon.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'validation.ACTIVE_IS_BOOLEAN',
  })
  active: boolean = true;

  @ApiPropertyOptional({
    description: 'The minimum order total to apply the coupon.',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'validation.coupon.MIN_ORDER_TOTAL_IS_NUMBER' })
  minOrderTotal?: number;

  @ApiPropertyOptional({
    description: 'The maximum discount amount of the coupon.',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'validation.coupon.MAX_DISCOUNT_IS_NUMBER' })
  maxDiscount?: number;
}
