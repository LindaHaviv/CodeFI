import { useEffect, useState, useRef } from 'react';
import { useBeat } from '../../context/BeatContext';
import { useTheme } from '../../context/ThemeContext';
import { useAudio } from '../../context/AudioContext';
import { TRACKS } from '../Audio/AudioPlayer';
import { getRandomQuote } from '../../data/zenQuotes';

const BAR_COUNT = 16;

export function BeatVisualizer() {
  const { beatData, showVisualizer, toggleVisualizer } = useBeat();
  const { theme } = useTheme();
  const { isPlaying, currentTrack } = useAudio();
  const [quote, setQuote] = useState(getRandomQuote);
  const [barHeights, setBarHeights] = useState<number[]>(Array(BAR_COUNT).fill(0.1));
  const smoothedRef = useRef<number[]>(Array(BAR_COUNT).fill(0.1));
  const waveformRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);

  const track = TRACKS[currentTrack];

  // Rotate quotes every 12 seconds
  useEffect(() => {
    if (!showVisualizer) return;
    setQuote(getRandomQuote());
    const interval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 12000);
    return () => clearInterval(interval);
  }, [showVisualizer]);

  // Store waveform in ref
  useEffect(() => {
    waveformRef.current = beatData.waveform;
  }, [beatData.waveform]);

  // Animate bars
  useEffect(() => {
    if (!showVisualizer) return;

    const animate = () => {
      const waveform = waveformRef.current;
      const newHeights = [...smoothedRef.current];

      if (waveform.length > 0) {
        const step = Math.max(1, Math.floor(waveform.length / BAR_COUNT));
        for (let i = 0; i < BAR_COUNT; i++) {
          const raw = Math.abs(waveform[i * step] || 0);
          const target = 0.08 + raw * 1.5; // More amplification
          // 50/50 interpolation for responsive movement
          newHeights[i] = smoothedRef.current[i] * 0.5 + target * 0.5;
        }
      } else {
        // Gentle idle animation - piano keys at rest
        const time = Date.now() / 1200;
        for (let i = 0; i < BAR_COUNT; i++) {
          const phase = i * 0.3;
          const idle = 0.1 + Math.sin(time + phase) * 0.08;
          newHeights[i] = smoothedRef.current[i] * 0.92 + idle * 0.08;
        }
      }

      smoothedRef.current = newHeights;
      setBarHeights([...newHeights]);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [showVisualizer]);

  return (
    <>
      {/* Toggle Button - always visible */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2">
        {!showVisualizer && (
          <div
            className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap animate-pulse"
            style={{
              backgroundColor: `${theme.accent}20`,
              color: theme.accent,
              border: `1px solid ${theme.accent}30`,
            }}
          >
            click for zen mode
          </div>
        )}
        <button
          onClick={toggleVisualizer}
          className="p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            backgroundColor: showVisualizer ? theme.accent : '#1a1a2e',
            color: showVisualizer ? '#0a0a0f' : theme.accent,
            border: `2px solid ${theme.accent}`,
            boxShadow: `0 0 20px ${theme.accent}40, inset 0 0 10px ${showVisualizer ? 'transparent' : theme.accent + '20'}`,
          }}
          title={showVisualizer ? 'Hide visualizer (V)' : 'Show visualizer (V)'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </button>
      </div>

      {/* Widget Panel */}
      {showVisualizer && (
        <div
          className="fixed bottom-[72px] left-6 z-50 font-mono transition-all duration-300"
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            className="rounded-xl overflow-hidden p-1"
            style={{
              backgroundColor: '#0d0d14',
              border: `2px solid ${theme.accent}50`,
              boxShadow: `
                0 0 30px ${theme.accent}30,
                0 4px 20px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.05)
              `,
              width: '220px',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-2 flex items-center justify-between rounded-t-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}15 0%, transparent 100%)`,
                borderBottom: `1px solid ${theme.accent}30`,
              }}
            >
              <span
                className="text-[10px] uppercase tracking-widest font-bold"
                style={{ color: theme.accent }}
              >
                ♫ zen mode
              </span>
              <button
                onClick={toggleVisualizer}
                className="opacity-50 hover:opacity-100 transition-opacity p-1"
                style={{ color: theme.text }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* BPM and Key Row */}
            <div
              className="px-4 py-3 flex items-center justify-around"
              style={{ borderBottom: `1px solid ${theme.accent}15` }}
            >
              {/* BPM */}
              <div className="text-center">
                <div
                  className="text-[9px] uppercase tracking-wider mb-1"
                  style={{ color: theme.dim }}
                >
                  tempo
                </div>
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{
                    color: isPlaying && beatData.bpm > 0 ? theme.accent : theme.dim,
                    textShadow: beatData.beatIntensity > 0.3
                      ? `0 0 15px ${theme.accent}, 0 0 30px ${theme.accent}50`
                      : 'none',
                    transition: 'text-shadow 0.1s ease-out',
                  }}
                >
                  {isPlaying && beatData.bpm > 0 ? beatData.bpm : isPlaying ? '...' : '---'}
                </div>
                <div
                  className="text-[9px] uppercase tracking-wider mt-0.5"
                  style={{ color: theme.dim, opacity: 0.6 }}
                >
                  {isPlaying && beatData.bpm === 0 ? 'detecting' : 'bpm'}
                </div>
              </div>

              {/* Divider */}
              <div
                className="w-px h-12"
                style={{ backgroundColor: `${theme.accent}20` }}
              />

              {/* Key */}
              <div className="text-center">
                <div
                  className="text-[9px] uppercase tracking-wider mb-1"
                  style={{ color: theme.dim }}
                >
                  key
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: isPlaying ? theme.text : theme.dim }}
                >
                  {isPlaying ? track?.key || '--' : '--'}
                </div>
                <div
                  className="text-[9px] uppercase tracking-wider mt-0.5"
                  style={{ color: theme.dim, opacity: 0.6 }}
                >
                  {isPlaying && track?.key?.includes('m') ? 'minor' : isPlaying ? 'major' : ''}
                </div>
              </div>
            </div>

            {/* Visualizer Bars */}
            <div className="px-4 py-3">
              <div
                className="flex items-end justify-center gap-[3px]"
                style={{ height: '36px' }}
              >
                {barHeights.map((height, i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: `${Math.max(10, Math.min(100, height * 100))}%`,
                      backgroundColor: theme.accent,
                      borderRadius: '2px',
                      opacity: isPlaying ? 0.5 + height * 0.5 : 0.2,
                      boxShadow: height > 0.4 ? `0 0 8px ${theme.accent}50` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quote */}
            <div
              className="px-4 py-2.5 text-center rounded-b-lg"
              style={{
                borderTop: `1px solid ${theme.accent}15`,
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              <p
                className="text-[10px] italic leading-snug"
                style={{ color: theme.dim, opacity: 0.7 }}
              >
                "{quote}"
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
