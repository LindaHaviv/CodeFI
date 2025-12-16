import { useEffect, useCallback } from 'react';
import { AudioProvider } from './contexts/AudioContext';
import { Terminal } from './components/Terminal';
import { AudioPlayer } from './components/AudioPlayer';
import { Controls } from './components/Controls';
import { usePomodoro } from './hooks/usePomodoro';
import './App.css';

function AppContent() {
  const pomodoro = usePomodoro();

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      pomodoro.toggle();
    } else if (e.code === 'KeyR' && !e.repeat && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      pomodoro.reset();
    }
  }, [pomodoro]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Update document title with timer
  useEffect(() => {
    const phaseEmoji = pomodoro.phase === 'work' ? '' : '';
    document.title = `${pomodoro.formattedTime} ${phaseEmoji} CodeFI`;
  }, [pomodoro.formattedTime, pomodoro.phase]);

  // Notification on phase change
  useEffect(() => {
    pomodoro.setOnPhaseComplete((phase) => {
      if (Notification.permission === 'granted') {
        const title = phase === 'work' ? 'Break time!' : 'Focus time!';
        const body = phase === 'work'
          ? 'Great work! Take a moment to rest.'
          : 'Ready to dive back in?';
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    });
  }, [pomodoro]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="app">
      <main className="app-main">
        <Terminal
          pomodoroPhase={pomodoro.phase}
          pomodoroTime={pomodoro.formattedTime}
          completedPomodoros={pomodoro.completedPomodoros}
          isRunning={pomodoro.isRunning}
        />

        <div className="app-controls">
          <Controls
            isRunning={pomodoro.isRunning}
            phase={pomodoro.phase}
            onToggle={pomodoro.toggle}
            onReset={pomodoro.reset}
            onSkip={pomodoro.skip}
          />
        </div>
      </main>

      <footer className="app-footer">
        <AudioPlayer />
      </footer>

      <div className="app-credit">
        CodeFI — focus flows
      </div>
    </div>
  );
}

function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;
