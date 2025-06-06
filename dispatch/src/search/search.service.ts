import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class SearchService {
  private readonly searchServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.searchServiceUrl = this.configService.get<string>('SERVICE_SEARCHING_URL') || 'http://localhost:8000';
	console.log(this.searchServiceUrl )
  }  async search(query: string, options: {
    limit?: number;
    category?: string;
    isVerified?: boolean;
    author?: string;
    tags?: string[];
  } = {}) {
    const { limit = 10, category, isVerified, author, tags } = options;
    
    // Build request body
    const requestBody = {
      q: query,
      limit,
    };

    if (category) requestBody['category'] = category;
    if (isVerified !== undefined) requestBody['isVerified'] = isVerified;
    if (author) requestBody['author'] = author;
    if (tags && tags.length > 0) requestBody['tags'] = tags;

    // Call the search service with POST and body payload
    const response = await lastValueFrom(
      this.httpService.post(`${this.searchServiceUrl}/search`, requestBody).pipe(
        map(res => res.data)
      )
    );

    return response.results;
  }

  async refreshIndex() {
    const response = await lastValueFrom(
      this.httpService.post(`${this.searchServiceUrl}/refresh`).pipe(
        map(res => res.data)
      )
    );

    return response;
  }
}
