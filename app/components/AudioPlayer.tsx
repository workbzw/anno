'use client';

import { useEffect } from 'react';

interface AudioPlayerProps {
  recordedAudio: string | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setIsPlaying: (playing: boolean) => void;
}

export default function AudioPlayer({ 
  recordedAudio, 
  isPlaying, 
  onPlayPause, 
  audioRef, 
  setIsPlaying 
}: AudioPlayerProps) {
  // 当录音音频改变时，重置播放状态
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [recordedAudio, audioRef, setIsPlaying]);

  // 清理音频引用
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioRef]);

  if (!recordedAudio) return null;

  return (
    <div className="flex items-center justify-center mt-4">
      <button
        onClick={onPlayPause}
        className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200"
      >
        {isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </div>
  );
}