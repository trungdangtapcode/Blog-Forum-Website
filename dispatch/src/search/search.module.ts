import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AccountModule } from '@/account/account.module';

@Module({
  imports: [HttpModule, AccountModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
