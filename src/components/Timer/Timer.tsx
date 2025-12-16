import { useTimer } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';
import { useAudio } from '../../context/AudioContext';

export function Timer() {
  const { timeRemaining, status, sessionType, sessionsCompleted, settings } = useTimer();
  const { theme } = useTheme();
  const { audioData } = useAudio();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const sessionLabels = {
    work: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  // Subtle glow effect based on audio
  const glowIntensity = 0.4 + audioData.mid * 0.3;

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ color: theme.text }}
    >
      {/* Session type indicator */}
      <div
        className="text-lg uppercase tracking-[0.3em] font-medium"
        style={{ color: theme.accent }}
      >
        {sessionLabels[sessionType]}
      </div>

      {/* Timer display - HERO SIZE */}
      <div
        className="text-[10rem] font-extralight tracking-tight leading-none"
        style={{
          textShadow: `0 0 ${40 + audioData.bass * 40}px ${theme.glow}${Math.round(glowIntensity * 50).toString(16).padStart(2, '0')}, 0 0 ${80 + audioData.bass * 60}px ${theme.glow}${Math.round(glowIntensity * 25).toString(16).padStart(2, '0')}`,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      {/* Session progress dots */}
      <div className="flex gap-3 mt-4">
        {Array.from({ length: settings.sessionsBeforeLongBreak }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < sessionsCompleted ? theme.accent : `${theme.text}25`,
              boxShadow: i < sessionsCompleted ? `0 0 12px ${theme.glow}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Status indicator */}
      {status === 'running' && (
        <div
          className="text-sm opacity-60 mt-2 flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: theme.accent }}
          />
          In Progress
        </div>
      )}
      {status === 'paused' && (
        <div
          className="text-sm opacity-60 mt-2 flex items-center gap-2"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.dim }}
          />
          Paused
        </div>
      )}
    </div>
  );
}
