import { useState, useCallback, useRef, useEffect } from 'react';

export type PomodoroPhase = 'work' | 'break' | 'longBreak';

export interface PomodoroState {
  phase: PomodoroPhase;
  timeRemaining: number;    // in seconds
  isRunning: boolean;
  completedPomodoros: number;
}

export interface PomodoroConfig {
  workDuration: number;      // in minutes
  breakDuration: number;     // in minutes
  longBreakDuration: number; // in minutes
  pomodorosUntilLongBreak: number;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
};

export function usePomodoro(config: PomodoroConfig = DEFAULT_CONFIG) {
  const [state, setState] = useState<PomodoroState>({
    phase: 'work',
    timeRemaining: config.workDuration * 60,
    isRunning: false,
    completedPomodoros: 0,
  });

  const intervalRef = useRef<number | null>(null);
  const onPhaseCompleteRef = useRef<((phase: PomodoroPhase) => void) | null>(null);

  const getDurationForPhase = useCallback((phase: PomodoroPhase): number => {
    switch (phase) {
      case 'work': return config.workDuration * 60;
      case 'break': return config.breakDuration * 60;
      case 'longBreak': return config.longBreakDuration * 60;
    }
  }, [config]);

  const getNextPhase = useCallback((currentPhase: PomodoroPhase, completedCount: number): PomodoroPhase => {
    if (currentPhase === 'work') {
      // After work, determine if short or long break
      const newCount = completedCount + 1;
      if (newCount % config.pomodorosUntilLongBreak === 0) {
        return 'longBreak';
      }
      return 'break';
    }
    // After any break, go back to work
    return 'work';
  }, [config.pomodorosUntilLongBreak]);

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.timeRemaining <= 1) {
        // Phase complete
        const newCompletedPomodoros = prev.phase === 'work'
          ? prev.completedPomodoros + 1
          : prev.completedPomodoros;

        const nextPhase = getNextPhase(prev.phase, prev.completedPomodoros);

        // Notify phase completion
        if (onPhaseCompleteRef.current) {
          onPhaseCompleteRef.current(prev.phase);
        }

        return {
          phase: nextPhase,
          timeRemaining: getDurationForPhase(nextPhase),
          isRunning: true, // Auto-continue
          completedPomodoros: newCompletedPomodoros,
        };
      }

      return {
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      };
    });
  }, [getDurationForPhase, getNextPhase]);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, tick]);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const toggle = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRemaining: getDurationForPhase(prev.phase),
      isRunning: false,
    }));
  }, [getDurationForPhase]);

  const skip = useCallback(() => {
    setState(prev => {
      const newCompletedPomodoros = prev.phase === 'work'
        ? prev.completedPomodoros + 1
        : prev.completedPomodoros;
      const nextPhase = getNextPhase(prev.phase, prev.completedPomodoros);

      return {
        phase: nextPhase,
        timeRemaining: getDurationForPhase(nextPhase),
        isRunning: false,
        completedPomodoros: newCompletedPomodoros,
      };
    });
  }, [getDurationForPhase, getNextPhase]);

  const setOnPhaseComplete = useCallback((callback: (phase: PomodoroPhase) => void) => {
    onPhaseCompleteRef.current = callback;
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    formattedTime: formatTime(state.timeRemaining),
    start,
    pause,
    toggle,
    reset,
    skip,
    setOnPhaseComplete,
    config,
  };
}
