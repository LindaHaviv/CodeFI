import { useRef, useState, useEffect, useCallback } from 'react';
import { useAudio } from '../contexts/AudioContext';
import './AudioPlayer.css';

// Free lofi streams and tracks (royalty-free sources)
const LOFI_STREAMS = [
  {
    name: 'Lofi Girl Radio',
    url: 'https://play.streamafrica.net/lofiradio',
    type: 'stream' as const,
  },
  {
    name: 'ChillHop Radio',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    type: 'stream' as const,
  },
  {
    name: 'Jazz Lofi',
    url: 'https://streams.ilovemusic.de/iloveradio29.mp3',
    type: 'stream' as const,
  },
];

interface AudioPlayerProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function AudioPlayer({ onPlayStateChange }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { connectAudioElement } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasConnectedRef = useRef(false);

  const currentStream = LOFI_STREAMS[currentStreamIndex];

  const handlePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);

    try {
      // Connect to analyzer only once
      if (!hasConnectedRef.current) {
        connectAudioElement(audio);
        hasConnectedRef.current = true;
      }

      await audio.play();
      setIsPlaying(true);
      onPlayStateChange?.(true);
    } catch (err) {
      console.error('Playback error:', err);
      setError('Unable to play. Try another stream.');
    } finally {
      setIsLoading(false);
    }
  }, [connectAudioElement, onPlayStateChange]);

  const handlePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
    onPlayStateChange?.(false);
  }, [onPlayStateChange]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const nextStream = useCallback(() => {
    setCurrentStreamIndex(prev => (prev + 1) % LOFI_STREAMS.length);
    hasConnectedRef.current = false;
    setIsPlaying(false);
    setError(null);
  }, []);

  const prevStream = useCallback(() => {
    setCurrentStreamIndex(prev => (prev - 1 + LOFI_STREAMS.length) % LOFI_STREAMS.length);
    hasConnectedRef.current = false;
    setIsPlaying(false);
    setError(null);
  }, []);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play on stream change if was playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    // Handle errors
    const handleError = () => {
      setError('Stream unavailable. Try another.');
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentStreamIndex]);

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={currentStream.url}
        crossOrigin="anonymous"
        preload="none"
      />

      <div className="player-controls">
        {/* Stream navigation */}
        <button className="player-btn nav" onClick={prevStream} title="Previous stream">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          className={`player-btn play ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          disabled={isLoading}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <span className="loading-spinner" />
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Stream navigation */}
        <button className="player-btn nav" onClick={nextStream} title="Next stream">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Stream info */}
      <div className="stream-info">
        <span className="stream-name">{currentStream.name}</span>
        {error && <span className="stream-error">{error}</span>}
      </div>

      {/* Volume */}
      <div className="volume-control">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" className="volume-icon">
          {volume === 0 ? (
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          ) : volume < 0.5 ? (
            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
          ) : (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          )}
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
}
