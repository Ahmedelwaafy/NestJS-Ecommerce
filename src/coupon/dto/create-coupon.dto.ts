import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinDate,
  MinLength,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({
    description: 'The code of the coupon.',
    example: 'SUMMER20',
  })
  @IsString({ message: 'coupon.dto.CODE_IS_STRING' })
  @MinLength(3, { message: 'coupon.dto.CODE_MIN_LENGTH' })
  @MaxLength(50, { message: 'coupon.dto.CODE_MAX_LENGTH' })
  code: string;

  @ApiProperty({
    description: 'The discount percentage of the coupon.',
    example: 20,
  })
  @IsNumber({}, { message: 'coupon.dto.DISCOUNT_IS_NUMBER' })
  @Min(1, { message: 'coupon.dto.DISCOUNT_MIN' })
  @Max(100, { message: 'coupon.dto.DISCOUNT_MAX' })
  discount: number;

  @ApiPropertyOptional({
    description: 'The expiration date of the coupon.',
    example: '2023-10-01T00:00:00Z',
  })
  @IsDate({ message: 'coupon.dto.EXPIRATION_DATE_IS_DATE' })
  @MinDate(new Date(), { message: 'coupon.dto.EXPIRATION_DATE_IS_IN_FUTURE' })
  expirationDate: Date;

  @ApiPropertyOptional({
    description: 'The active status of the coupon.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'coupon.dto.ACTIVE_IS_BOOLEAN',
  })
  active: boolean = true;

  @ApiPropertyOptional({
    description: 'The minimum order total to apply the coupon.',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'coupon.dto.MIN_ORDER_TOTAL_IS_NUMBER' })
  minOrderTotal?: number;

  @ApiPropertyOptional({
    description: 'The maximum discount amount of the coupon.',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'coupon.dto.MAX_DISCOUNT_IS_NUMBER' })
  maxDiscount?: number;
}
