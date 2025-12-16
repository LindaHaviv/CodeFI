import { useTimer } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';

export function TimerControls() {
  const { status, start, pause, reset, skip } = useTimer();
  const { theme } = useTheme();

  return (
    <div className="flex gap-4 items-center">
      {/* Reset button */}
      <button
        onClick={reset}
        className="p-4 rounded-full transition-all duration-200"
        style={{
          backgroundColor: `${theme.text}08`,
          color: theme.text,
          border: `1px solid ${theme.text}15`,
          opacity: 0.6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = `${theme.text}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.backgroundColor = `${theme.text}08`;
        }}
        title="Reset"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Play/Pause button - Main CTA */}
      {status === 'running' ? (
        <button
          onClick={pause}
          className="p-6 rounded-full transition-all duration-200"
          style={{
            backgroundColor: theme.accent,
            color: theme.bg,
            boxShadow: `0 0 30px ${theme.glow}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 0 40px ${theme.glow}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 0 30px ${theme.glow}40`;
          }}
          title="Pause"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={start}
          className="p-6 rounded-full transition-all duration-200"
          style={{
            backgroundColor: theme.accent,
            color: theme.bg,
            boxShadow: `0 0 30px ${theme.glow}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 0 40px ${theme.glow}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 0 30px ${theme.glow}40`;
          }}
          title="Start"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Skip button */}
      <button
        onClick={skip}
        className="p-4 rounded-full transition-all duration-200"
        style={{
          backgroundColor: `${theme.text}08`,
          color: theme.text,
          border: `1px solid ${theme.text}15`,
          opacity: 0.6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = `${theme.text}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.backgroundColor = `${theme.text}08`;
        }}
        title="Skip"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5v14l11-7L5 5zm11 0v14h2V5h-2z" />
        </svg>
      </button>
    </div>
  );
}
