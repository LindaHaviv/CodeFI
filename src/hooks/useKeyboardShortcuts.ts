import { useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { useAudio } from '../context/AudioContext';
import { useTheme } from '../context/ThemeContext';
import { themeList } from '../data/themes';

interface UseKeyboardShortcutsOptions {
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
}

export function useKeyboardShortcuts({ onToggleSettings, isSettingsOpen }: UseKeyboardShortcutsOptions) {
  const { status, start, pause, reset, skip } = useTimer();
  const { toggle: toggleMusic, nextTrack, volume, setVolume } = useAudio();
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Escape - close settings modal
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          onToggleSettings();
        }
        return;
      }

      // Don't process other shortcuts if settings modal is open
      if (isSettingsOpen) return;

      switch (e.key.toLowerCase()) {
        // Space - toggle timer
        case ' ':
          e.preventDefault();
          if (status === 'running') {
            pause();
          } else {
            start();
          }
          break;

        // M - toggle mute
        case 'm':
          e.preventDefault();
          if (volume > 0) {
            setVolume(0);
          } else {
            setVolume(0.5);
          }
          break;

        // N - next track
        case 'n':
          e.preventDefault();
          nextTrack();
          break;

        // S - skip session
        case 's':
          e.preventDefault();
          skip();
          break;

        // R - reset timer
        case 'r':
          e.preventDefault();
          reset();
          break;

        // P - toggle music play/pause
        case 'p':
          e.preventDefault();
          toggleMusic();
          break;

        // 1-5 - switch themes
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
          const themeIndex = parseInt(e.key) - 1;
          if (themeIndex < themeList.length) {
            e.preventDefault();
            setTheme(themeList[themeIndex].name);
          }
          break;

        // ? - show keyboard shortcuts (open settings)
        case '?':
          e.preventDefault();
          onToggleSettings();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, start, pause, reset, skip, toggleMusic, nextTrack, volume, setVolume, setTheme, isSettingsOpen, onToggleSettings]);
}
