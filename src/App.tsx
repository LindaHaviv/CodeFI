import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { TimerProvider } from './context/TimerContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Terminal } from './components/Terminal/Terminal';
import { Timer } from './components/Timer/Timer';
import { TimerControls } from './components/Timer/TimerControls';
import { TimerSettings } from './components/Timer/TimerSettings';
import { AudioPlayer } from './components/Audio/AudioPlayer';
import { ThemeSelector } from './components/Settings/ThemeSelector';
import { Particles } from './components/Effects/Particles';

function AppContent() {
  const { theme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AppLayout>
      {/* Terminal as full background - more visible */}
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          maskImage: 'radial-gradient(ellipse at center, transparent 10%, black 60%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 10%, black 60%)',
        }}
      >
        <Terminal />
      </div>

      {/* Softer vignette overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, ${theme.bg}70 60%, ${theme.bg}dd 100%)`,
        }}
      />

      {/* Ambient particles */}
      <Particles />

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-10 py-6 flex-shrink-0">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: theme.text }}
          >
            code<span style={{ color: theme.accent }}>FI</span>
          </h1>

          <div className="flex items-center gap-4">
            <ThemeSelector />
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: theme.dim,
                backgroundColor: `${theme.text}05`,
              }}
              title="Timer Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center px-6 pb-6 gap-8 min-h-0">
          {/* Center - Timer hero */}
          <div className="flex flex-col items-center justify-center gap-6">
            <Timer />
            <TimerControls />

            {/* Motivational text */}
            <p
              className="text-sm text-center opacity-30 max-w-[280px]"
              style={{ color: theme.text }}
            >
              Stay in the zone. Write great code.
            </p>
          </div>

          {/* Right side - Audio player with vinyl */}
          <div
            className="w-[260px] flex-shrink-0 py-6 px-4 rounded-2xl"
            style={{
              backgroundColor: `${theme.bg}cc`,
              border: `1px solid ${theme.text}10`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <AudioPlayer />
          </div>
        </div>
      </div>

      {/* Settings modal */}
      <TimerSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <TimerProvider>
          <AppContent />
        </TimerProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;
