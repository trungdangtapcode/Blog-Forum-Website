import { Controller, Get, Param, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TextToSpeechService } from './text-to-speech.service';
import { CachedAuth0Guard } from '@/account/guards/cached-auth0.guard';

@Controller('text-to-speech')
export class TextToSpeechController {
  constructor(private readonly textToSpeechService: TextToSpeechService) {}

  @Get('post/:postId')
  @UseGuards(CachedAuth0Guard)
  async getPostAudio(@Param('postId') postId: string, @Res() response: Response): Promise<void> {
    try {
      const result = await this.textToSpeechService.convertPostToSpeech(postId);
      
      // Set appropriate headers for audio streaming
      response.setHeader('Content-Type', result.contentType);
      response.setHeader('Content-Disposition', `attachment; filename="post_${postId}.mp3"`);
      
      // Send the audio data
      response.send(result.audio);
    } catch (error) {
      response.status(500).json({
        error: error.message,
        status: 'error',
        message: 'Failed to convert post to speech',
      });
    }
  }

  @Post('post/:postId')
  @UseGuards(CachedAuth0Guard)
  async convertPostToSpeech(@Param('postId') postId: string, @Res() response: Response): Promise<void> {
    try {
      const result = await this.textToSpeechService.convertPostToSpeech(postId);
      
      // Set appropriate headers for audio streaming
      response.setHeader('Content-Type', result.contentType);
      response.setHeader('Content-Disposition', `attachment; filename="post_${postId}.mp3"`);
      
      // Send the audio data
      response.send(result.audio);
    } catch (error) {
      response.status(500).json({
        error: error.message,
        status: 'error',
        message: 'Failed to convert post to speech',
      });
    }
  }
}
