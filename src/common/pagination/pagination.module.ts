import { Global, Module } from '@nestjs/common';
import { PaginationService } from './providers/pagination.service';

@Global()
@Module({
  controllers: [],
  providers: [PaginationService],
  exports: [PaginationService],
  imports: [],
})
export class PaginationModule {}
