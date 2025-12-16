import { useRef, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useTheme } from '../../context/ThemeContext';
import { VinylDisc } from './VinylDisc';

// Local audio tracks - served from public folder
// Use import.meta.env.BASE_URL for GitHub Pages compatibility
const BASE = import.meta.env.BASE_URL;
export const TRACKS = [
  {
    name: 'Shipping Lanes',
    artist: 'Chad Crouch',
    src: `${BASE}audio/lofi1.mp3`,
    key: 'Am',
  },
  {
    name: 'Algorithms',
    artist: 'Chad Crouch',
    src: `${BASE}audio/lofi2.mp3`,
    key: 'Dm',
  },
  {
    name: 'Drifting',
    artist: 'Chad Crouch',
    src: `${BASE}audio/lofi3.mp3`,
    key: 'C',
  },
  {
    name: 'Ambient Dreams',
    artist: 'Jamendo',
    src: `${BASE}audio/lofi4.mp3`,
    key: 'Em',
  },
  {
    name: 'Night Flow',
    artist: 'Jamendo',
    src: `${BASE}audio/lofi5.mp3`,
    key: 'Gm',
  },
  {
    name: 'Calm Waters',
    artist: 'Jamendo',
    src: `${BASE}audio/lofi6.mp3`,
    key: 'F',
  },
];

export function AudioPlayer() {
  const { volume, setVolume, play, pause, isPlaying, currentTrack: currentTrackIndex, setTrack, initAudio } = useAudio();
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Initialize audio context when audio element is ready
  useEffect(() => {
    if (audioRef.current) {
      initAudio(audioRef.current);
    }
  }, [initAudio]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialize audio context on first play (requires user interaction)
    initAudio(audio);

    if (isPlaying) {
      audio.pause();
      pause();
    } else {
      try {
        await audio.play();
        play();
      } catch (err) {
        console.error('Play failed:', err);
      }
    }
  };

  const handleTrackChange = async (newIndex: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const wasPlaying = isPlaying;

    // Stop current playback
    audio.pause();
    pause();

    // Change track via context
    setTrack(newIndex);
    audio.src = TRACKS[newIndex].src;

    // Resume if was playing
    if (wasPlaying) {
      audio.addEventListener('canplaythrough', async function onCanPlay() {
        audio.removeEventListener('canplaythrough', onCanPlay);
        try {
          await audio.play();
          play();
        } catch (err) {
          console.error('Resume failed:', err);
        }
      });
      audio.load();
    }
  };

  const nextTrack = () => handleTrackChange((currentTrackIndex + 1) % TRACKS.length);
  const prevTrack = () => handleTrackChange((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="flex flex-col items-center gap-6">
      <VinylDisc />

      {/* Track info */}
      <div className="text-center">
        <div className="text-sm font-medium" style={{ color: theme.text }}>
          {currentTrack.name}
        </div>
        <div className="text-xs opacity-50" style={{ color: theme.text }}>
          {currentTrack.artist}
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        loop
        preload="auto"
      />

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        {/* Previous */}
        <button
          onClick={prevTrack}
          className="p-2 rounded-full transition-opacity duration-200 hover:opacity-100"
          style={{
            backgroundColor: `${theme.text}08`,
            color: theme.text,
            opacity: 0.6,
          }}
          title="Previous track"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          className="p-3 rounded-full transition-all duration-200"
          style={{
            backgroundColor: isPlaying ? theme.accent : `${theme.text}15`,
            color: isPlaying ? theme.bg : theme.text,
            boxShadow: isPlaying ? `0 0 20px ${theme.glow}40` : 'none',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          className="p-2 rounded-full transition-opacity duration-200 hover:opacity-100"
          style={{
            backgroundColor: `${theme.text}08`,
            color: theme.text,
            opacity: 0.6,
          }}
          title="Next track"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: theme.dim }}>
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
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 h-1 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${theme.accent} ${volume * 100}%, ${theme.text}20 ${volume * 100}%)`,
          }}
        />
      </div>

      {/* Track dots */}
      <div className="flex gap-2">
        {TRACKS.map((track, index) => (
          <button
            key={index}
            onClick={() => handleTrackChange(index)}
            className="w-2 h-2 rounded-full transition-all duration-200"
            style={{
              backgroundColor: index === currentTrackIndex ? theme.accent : `${theme.text}30`,
              transform: index === currentTrackIndex ? 'scale(1.2)' : 'scale(1)',
            }}
            title={track.name}
          />
        ))}
      </div>
    </div>
  );
}
