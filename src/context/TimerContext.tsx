import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TimerState, TimerSettings, SessionType } from '../types';

interface TimerContextType extends TimerState {
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

const SETTINGS_KEY = 'codefi-timer-settings';

const defaultSettings: TimerSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

function loadSettings(): TimerSettings {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'TICK' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<TimerSettings> };

function getDuration(sessionType: SessionType, settings: TimerSettings): number {
  switch (sessionType) {
    case 'work':
      return settings.workDuration;
    case 'shortBreak':
      return settings.shortBreakDuration;
    case 'longBreak':
      return settings.longBreakDuration;
  }
}

function getNextSession(
  currentSession: SessionType,
  sessionsCompleted: number,
  settings: TimerSettings
): { sessionType: SessionType; sessionsCompleted: number } {
  if (currentSession === 'work') {
    const newCompleted = sessionsCompleted + 1;
    if (newCompleted >= settings.sessionsBeforeLongBreak) {
      return { sessionType: 'longBreak', sessionsCompleted: 0 };
    }
    return { sessionType: 'shortBreak', sessionsCompleted: newCompleted };
  }
  return { sessionType: 'work', sessionsCompleted };
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'running' };

    case 'PAUSE':
      return { ...state, status: 'paused' };

    case 'RESET':
      return {
        ...state,
        status: 'idle',
        timeRemaining: getDuration(state.sessionType, state.settings),
      };

    case 'SKIP': {
      const next = getNextSession(state.sessionType, state.sessionsCompleted, state.settings);
      return {
        ...state,
        status: 'idle',
        sessionType: next.sessionType,
        sessionsCompleted: next.sessionsCompleted,
        timeRemaining: getDuration(next.sessionType, state.settings),
      };
    }

    case 'TICK': {
      if (state.status !== 'running') return state;

      if (state.timeRemaining <= 1) {
        const next = getNextSession(state.sessionType, state.sessionsCompleted, state.settings);
        return {
          ...state,
          status: 'idle',
          sessionType: next.sessionType,
          sessionsCompleted: next.sessionsCompleted,
          timeRemaining: getDuration(next.sessionType, state.settings),
        };
      }

      return { ...state, timeRemaining: state.timeRemaining - 1 };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      // If idle, update the time remaining to reflect new duration
      if (state.status === 'idle') {
        return {
          ...state,
          settings: newSettings,
          timeRemaining: getDuration(state.sessionType, newSettings),
        };
      }
      return { ...state, settings: newSettings };
    }

    default:
      return state;
  }
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const settings = loadSettings();

  const [state, dispatch] = useReducer(timerReducer, {
    status: 'idle',
    sessionType: 'work',
    timeRemaining: settings.workDuration,
    sessionsCompleted: 0,
    settings,
  });

  useEffect(() => {
    let interval: number | undefined;

    if (state.status === 'running') {
      interval = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.status]);

  // Play notification sound when session changes
  useEffect(() => {
    if (state.status === 'idle' && state.timeRemaining === getDuration(state.sessionType, state.settings)) {
      // Session just completed - could play a sound here
    }
  }, [state.sessionType, state.status, state.timeRemaining, state.settings]);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const skip = useCallback(() => dispatch({ type: 'SKIP' }), []);
  const updateSettings = useCallback(
    (settings: Partial<TimerSettings>) => dispatch({ type: 'UPDATE_SETTINGS', settings }),
    []
  );

  return (
    <TimerContext.Provider
      value={{
        ...state,
        start,
        pause,
        reset,
        skip,
        updateSettings,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
