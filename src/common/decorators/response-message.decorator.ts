import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (translationKey: string) =>
  SetMetadata(RESPONSE_MESSAGE, translationKey);
