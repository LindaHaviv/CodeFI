export type ThemeName = 'matrix' | 'dracula' | 'nord' | 'monokai' | 'amber';

export interface Theme {
  name: ThemeName;
  label: string;
  bg: string;
  text: string;
  accent: string;
  glow: string;
  dim: string;
}

export interface AudioData {
  bass: number;
  mid: number;
  high: number;
  average: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused';
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export interface TimerState {
  status: TimerStatus;
  sessionType: SessionType;
  timeRemaining: number;
  sessionsCompleted: number;
  settings: TimerSettings;
}

export interface CodeSnippet {
  language: string;
  title: string;
  lines: string[];
}
