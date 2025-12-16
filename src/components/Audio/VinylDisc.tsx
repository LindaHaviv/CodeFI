import { useAudio } from '../../context/AudioContext';
import { useTheme } from '../../context/ThemeContext';

export function VinylDisc() {
  const { isPlaying, audioData } = useAudio();
  const { theme } = useTheme();

  // Subtle size pulse with audio
  const scale = 1 + audioData.bass * 0.02;

  return (
    <div
      className="relative"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          backgroundColor: theme.glow,
          opacity: isPlaying ? 0.2 + audioData.mid * 0.1 : 0.1,
        }}
      />

      {/* Vinyl disc */}
      <div
        className="w-32 h-32 rounded-full relative"
        style={{
          background: `
            radial-gradient(circle at 50% 50%,
              ${theme.bg} 0%,
              ${theme.bg} 15%,
              #1a1a1a 16%,
              #0d0d0d 17%,
              #1a1a1a 18%,
              #0d0d0d 22%,
              #1a1a1a 23%,
              #0d0d0d 35%,
              #1a1a1a 36%,
              #0d0d0d 50%,
              #1a1a1a 51%,
              #0d0d0d 65%,
              #1a1a1a 66%,
              #0d0d0d 80%,
              #1a1a1a 81%,
              #0d0d0d 90%,
              #1a1a1a 91%,
              #0d0d0d 100%
            )
          `,
          boxShadow: `0 0 30px ${theme.glow}30, inset 0 0 20px rgba(0,0,0,0.5)`,
          animation: isPlaying ? 'spin 3s linear infinite' : 'none',
        }}
      >
        {/* Center label */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.glow} 100%)`,
            boxShadow: `0 0 15px ${theme.glow}50`,
          }}
        >
          {/* Center hole */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.bg }}
          />
        </div>

        {/* Shine effect */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
