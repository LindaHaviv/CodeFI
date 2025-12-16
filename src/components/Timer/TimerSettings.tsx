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

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      workDuration: workMinutes * 60,
      shortBreakDuration: shortBreakMinutes * 60,
      longBreakDuration: longBreakMinutes * 60,
      sessionsBeforeLongBreak: sessions,
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
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
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
