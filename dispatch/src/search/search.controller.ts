import { Controller, Post, UseGuards, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { SearchService } from './search.service';
import { CachedAuth0Guard } from '@/account/guards/cached-auth0.guard';
import { SearchRequestDto } from './dto/search-request.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}  
  @Post()
  @UsePipes(new ValidationPipe())
  async search(@Body() searchRequestDto: SearchRequestDto) {
    const { q, limit, category, isVerified, author, tags } = searchRequestDto;
    
    return {
      success: true,
      results: await this.searchService.search(q, {
        limit,
        category,
        isVerified,
        author,
        tags,
      }),
    };
  }

  @Post('refresh')
  @UseGuards(CachedAuth0Guard)
  async refreshIndex() {
    await this.searchService.refreshIndex();
    return {
      success: true,
      message: 'Search index refreshed successfully',
    };
  }
}
