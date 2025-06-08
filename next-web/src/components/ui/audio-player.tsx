'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, VolumeX, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  postId: string;
}

export function AudioPlayer({ postId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlay = async () => {
    setError(null);
    
    if (audioElement && isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }
    
    try {
      setLoading(true);
      
      if (!audioElement) {
        const audio = new Audio(`/api/text-to-speech/${postId}`);
        audio.addEventListener('ended', () => setIsPlaying(false));
        audio.addEventListener('error', () => {
          setError('Failed to load audio');
          setIsPlaying(false);
        });
        
        setAudioElement(audio);
        await audio.play();
      } else {
        await audioElement.play();
      }
      
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio');
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    if (audioElement) {
      audioElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handlePlay}
        className="flex items-center gap-1"
      >
        {isPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-1" />
            Read aloud
          </>
        )}
      </Button>
      
      {isPlaying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="px-2"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      )}
      
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
