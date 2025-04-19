import { AddToCartDto, BaseCreateCartDto } from './create-cart.dto';

//not partial
export class BaseUpdateCartDto extends BaseCreateCartDto {}

//not partial
export class UpdateCartDto extends AddToCartDto {}
