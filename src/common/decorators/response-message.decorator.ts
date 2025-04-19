import { SetMetadata } from '@nestjs/common';

type OPERATIONS =
  | 'GET_ONE_SUCCESSFULLY'
  | 'GET_ALL_SUCCESSFULLY'
  | 'CREATED_SUCCESSFULLY'
  | 'UPDATED_SUCCESSFULLY'
  | 'DELETED_SUCCESSFULLY'
  | 'RESTORED_SUCCESSFULLY'
  | 'DEACTIVATED_SUCCESSFULLY'
  | string;
type MODULES =
  | 'USER'
  | 'CATEGORY'
  | 'SUB_CATEGORY'
  | 'BRAND'
  | 'COUPON'
  | 'SUPPLIER'
  | 'PRODUCT'
  | 'PRODUCT_REQUEST'
  | 'ORDER'
  | 'SETTING'
  | 'REVIEW'
  | 'CART'
  | 'CUSTOM';
export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (msgInfo: [OPERATIONS, MODULES?]) =>
  SetMetadata(RESPONSE_MESSAGE, msgInfo);
