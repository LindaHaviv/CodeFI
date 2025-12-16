import { useState } from 'react';
import { useTimer } from '../../context/TimerContext';
import { useTheme } from '../../context/ThemeContext';

interface TimerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimerSettings({ isOpen, onClose }: TimerSettingsProps) {
  const { settings, updateSettings } = useTimer();
  const { theme } = useTheme();

  const [workMinutes, setWorkMinutes] = useState(settings.workDuration / 60);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(
    settings.shortBreakDuration / 60
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    settings.longBreakDuration / 60
  );
  const [sessions, setSessions] = useState(settings.sessionsBeforeLongBreak);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      workDuration: workMinutes * 60,
      shortBreakDuration: shortBreakMinutes * 60,
      longBreakDuration: longBreakMinutes * 60,
      sessionsBeforeLongBreak: sessions,
      autoStartBreaks,
      autoStartPomodoros,
      soundEnabled,
    });
    onClose();
  };

  const inputClass =
    'w-20 px-3 py-2 rounded-lg text-center text-sm bg-transparent border outline-none focus:ring-1';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="p-6 rounded-xl max-w-sm w-full mx-4"
        style={{
          backgroundColor: theme.bg,
          border: `1px solid ${theme.text}20`,
          boxShadow: `0 0 40px ${theme.glow}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-lg font-medium mb-6"
          style={{ color: theme.text }}
        >
          Timer Settings
        </h2>

        <div className="space-y-4">
          {/* Work duration */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Focus duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                value={workMinutes}
                onChange={(e) => setWorkMinutes(Number(e.target.value))}
                className={inputClass}
                style={{
                  color: theme.text,
                  borderColor: `${theme.text}30`,
                }}
              />
              <span style={{ color: theme.dim }} className="text-sm">
                min
              </span>
            </div>
          </div>

          {/* Short break */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Short break
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                value={shortBreakMinutes}
                onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                className={inputClass}
                style={{
                  color: theme.text,
                  borderColor: `${theme.text}30`,
                }}
              />
              <span style={{ color: theme.dim }} className="text-sm">
                min
              </span>
            </div>
          </div>

          {/* Long break */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Long break
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                value={longBreakMinutes}
                onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
                className={inputClass}
                style={{
                  color: theme.text,
                  borderColor: `${theme.text}30`,
                }}
              />
              <span style={{ color: theme.dim }} className="text-sm">
                min
              </span>
            </div>
          </div>

          {/* Sessions before long break */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Sessions until long break
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={sessions}
              onChange={(e) => setSessions(Number(e.target.value))}
              className={inputClass}
              style={{
                color: theme.text,
                borderColor: `${theme.text}30`,
              }}
            />
          </div>

          {/* Divider */}
          <div className="border-t my-2" style={{ borderColor: `${theme.text}15` }} />

          {/* Auto-start breaks */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Auto-start breaks
            </label>
            <button
              onClick={() => setAutoStartBreaks(!autoStartBreaks)}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{
                backgroundColor: autoStartBreaks ? theme.accent : `${theme.text}20`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
                style={{
                  transform: autoStartBreaks ? 'translateX(26px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>

          {/* Auto-start pomodoros */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Auto-start focus sessions
            </label>
            <button
              onClick={() => setAutoStartPomodoros(!autoStartPomodoros)}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{
                backgroundColor: autoStartPomodoros ? theme.accent : `${theme.text}20`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
                style={{
                  transform: autoStartPomodoros ? 'translateX(26px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>

          {/* Sound enabled */}
          <div className="flex items-center justify-between">
            <label style={{ color: theme.text }} className="text-sm opacity-80">
              Notification sound
            </label>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{
                backgroundColor: soundEnabled ? theme.accent : `${theme.text}20`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform"
                style={{
                  transform: soundEnabled ? 'translateX(26px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="border-t mt-4 pt-4" style={{ borderColor: `${theme.text}15` }}>
          <h3
            className="text-xs font-medium mb-3 opacity-60 uppercase tracking-wide"
            style={{ color: theme.text }}
          >
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: theme.dim }}>
            <div className="flex justify-between">
              <span>Space</span>
              <span className="opacity-70">Play/Pause</span>
            </div>
            <div className="flex justify-between">
              <span>S</span>
              <span className="opacity-70">Skip</span>
            </div>
            <div className="flex justify-between">
              <span>R</span>
              <span className="opacity-70">Reset</span>
            </div>
            <div className="flex justify-between">
              <span>M</span>
              <span className="opacity-70">Mute</span>
            </div>
            <div className="flex justify-between">
              <span>N</span>
              <span className="opacity-70">Next Track</span>
            </div>
            <div className="flex justify-between">
              <span>P</span>
              <span className="opacity-70">Music Play</span>
            </div>
            <div className="flex justify-between">
              <span>1-8</span>
              <span className="opacity-70">Switch Theme</span>
            </div>
            <div className="flex justify-between">
              <span>Esc</span>
              <span className="opacity-70">Close</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm transition-colors"
            style={{
              color: theme.text,
              backgroundColor: `${theme.text}10`,
              border: `1px solid ${theme.text}20`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme.accent,
              color: theme.bg,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
