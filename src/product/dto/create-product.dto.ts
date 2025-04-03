import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested
} from 'class-validator';
import { LocalizedFieldDto } from 'src/common/dto/localized-field.dto';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product.',
    example: { en: 'Adidas Air Max', ar: 'اديداس اير ماكس' },
  })
  @IsNotEmpty({ message: 'validation.NAME_NOT_EMPTY' })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  name: LocalizedFieldDto;

  @ApiProperty({
    description: 'The description of the product.',
    example: {
      en: 'High-quality sports shoes.',
      ar: 'أحذية رياضية عالية الجودة',
    },
  })
  @IsNotEmpty({ message: 'validation.DESCRIPTION_NOT_EMPTY' })
  @Type(() => LocalizedFieldDto)
  @ValidateNested()
  description: LocalizedFieldDto;

  @ApiProperty({ description: 'The price of the product.', example: 100 })
  @IsNumber()
  @Min(1, { message: 'validation.PRICE_MIN' })
  @Max(20000, { message: 'validation.PRICE_MAX' })
  price: number;

  @ApiProperty({
    description: 'The category ID of the product.',
    example: '60b6a2f9f1d3c8d7aeb7a3e6',
  })
  @IsString()
  @IsMongoId({ message: 'validation.USER_IS_MONGO_ID' })
  category: string;

  @ApiProperty({ description: 'The quantity of the product.', example: 10 })
  @IsNumber()
  @Min(1, { message: 'validation.QUANTITY_MIN' })
  quantity: number;

  @ApiProperty({
    description: 'The main image of the product.',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsUrl({}, { message: 'validation.IMAGE_IS_URL' })
  imageCover: string;

  @ApiPropertyOptional({
    description: 'Additional images of the product.',
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @IsOptional()
  @IsArray({ message: 'validation.IMAGES_MUST_BE_ARRAY' })
  @IsUrl({}, { each: true, message: 'validation.IMAGE_IS_URL' })
  images?: string[];

  @ApiPropertyOptional({ description: 'Number of items sold.', example: 5 })
  @IsOptional()
  @IsNumber()
  sold?: number;

  @ApiPropertyOptional({ description: 'Price after discount.', example: 80 })
  @IsOptional()
  @IsNumber()
  @Max(20000, { message: 'validation.PRICE_AFTER_DISCOUNT_MAX' })
  priceAfterDiscount?: number;

  @ApiPropertyOptional({
    description: 'Available colors.',
    example: ['red', 'blue', 'green'],
  })
  @IsOptional()
  @IsArray({ message: 'validation.COLORS_MUST_BE_ARRAY' })
  @IsString({ each: true, message: 'validation.COLOR_MUST_BE_STRING' })
  @IsNotEmpty({ each: true, message: 'validation.COLOR_NOT_EMPTY' })
  colors?: string[];
  @ApiPropertyOptional({
    description: 'Sub-category ID.',
    example: '60b6a2f9f1d3c8d7aeb7a3e7',
  })
  @IsOptional()
  @IsMongoId({ message: 'validation.USER_IS_MONGO_ID' })
  subCategory?: string;

  @ApiPropertyOptional({
    description: 'Brand ID.',
    example: '60b6a2f9f1d3c8d7aeb7a3e8',
  })
  @IsOptional()
  @IsMongoId({ message: 'validation.USER_IS_MONGO_ID' })
  brand?: string;

  @ApiPropertyOptional({
    description: 'The active status of the product.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;
}
