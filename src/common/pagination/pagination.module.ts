import { Module } from '@nestjs/common';
import { PaginationService } from './providers/pagination.service';

@Module({
  controllers: [],
  providers: [PaginationService],
  exports: [PaginationService],
  imports: [],
})
export class PaginationModule {}
