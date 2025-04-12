import { PartialType } from '@nestjs/swagger';
import { BaseProductDto, CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class BaseUpdateProductDto extends PartialType(BaseProductDto) {}

