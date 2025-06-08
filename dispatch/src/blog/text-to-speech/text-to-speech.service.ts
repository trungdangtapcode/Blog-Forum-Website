import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../post/post.chema';
import { firstValueFrom } from 'rxjs';
import { PostService } from '../post/post.service';

@Injectable()
export class TextToSpeechService {
  private readonly ttsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly postService: PostService,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {
    this.ttsServiceUrl = this.configService.get<string>('SERVICE_TTS_URL', 'http://localhost:8001');
  }

  async convertPostToSpeech(postId: string): Promise<any> {
    try {
      // Get post content by ID
      const post = await this.postService.findOne(postId);

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Prepare the content to convert (combine title and content)
      const markdownText = `# ${post.title}\n\n${post.content}`;

      // Create form data
      const formData = new FormData();
      formData.append('markdown_text', markdownText);

      // Call text-to-speech service
      const response = await firstValueFrom(
        this.httpService.post(`${this.ttsServiceUrl}/tts/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'arraybuffer',
        }),
      );

      // Return the audio data with appropriate metadata
      return {
        audio: response.data,
        contentType: 'audio/mpeg',
        post: {
          id: post._id,
          title: post.title,
          summary: post.summary,
          author: post.author,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to convert post to speech: ${error.message}`);
    }
  }
}
