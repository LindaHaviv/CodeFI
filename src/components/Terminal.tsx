import { useEffect, useRef, useState, useMemo } from 'react';
import { useAudio } from '../contexts/AudioContext';
import './Terminal.css';

interface TerminalLine {
  id: number;
  content: string;
  type: 'command' | 'output' | 'comment' | 'success' | 'error' | 'info';
  typing?: boolean;
}

interface TerminalProps {
  pomodoroPhase: 'work' | 'break' | 'longBreak';
  pomodoroTime: string;
  completedPomodoros: number;
  isRunning: boolean;
}

// Inspiring code snippets and motivational terminal output
const CODE_SNIPPETS = [
  { cmd: 'git status', out: 'On branch main\nYour branch is up to date with \'origin/main\'.' },
  { cmd: 'npm run build', out: 'Build completed successfully in 2.3s' },
  { cmd: 'cargo test', out: 'running 42 tests... ok. 42 passed; 0 failed' },
  { cmd: 'python train.py', out: 'Epoch 1/100 - loss: 0.4532 - accuracy: 0.8921' },
  { cmd: 'docker compose up -d', out: 'Container api-server started\nContainer database started' },
  { cmd: 'kubectl get pods', out: 'NAME                    READY   STATUS    RESTARTS   AGE\napi-7d4f8b9c5-x2k4j    1/1     Running   0          2d' },
  { cmd: './deploy.sh production', out: 'Deploying to production...\nDeployment successful!' },
  { cmd: 'go build -o app .', out: 'Build completed. Binary size: 12.4MB' },
  { cmd: 'mix test', out: 'Finished in 0.8 seconds\n24 tests, 0 failures' },
  { cmd: 'rake db:migrate', out: 'Migrated CreateUsersTable (12ms)' },
];

const THOUGHTS = [
  '# deep work mode activated',
  '# focus is a superpower',
  '# one line at a time',
  '# shipping > perfecting',
  '# trust the process',
  '# flow state loading...',
  '# code with intention',
  '# small wins compound',
];

export function Terminal({ pomodoroPhase, pomodoroTime, completedPomodoros, isRunning }: TerminalProps) {
  const { audioData } = useAudio();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);

  // Calculate subtle visual adjustments based on audio
  const audioStyles = useMemo(() => {
    const { bass, average, treble } = audioData;

    // Very subtle glow intensity based on bass (slow, breathing feel)
    const glowIntensity = 0.08 + bass * 0.12; // Range: 0.08 - 0.20

    // Slight brightness fluctuation on text based on average
    const textBrightness = 0.85 + average * 0.15; // Range: 0.85 - 1.0

    // Very subtle scanline movement based on treble
    const scanlineOffset = treble * 2; // Slight movement

    return {
      '--glow-intensity': glowIntensity,
      '--text-brightness': textBrightness,
      '--scanline-offset': `${scanlineOffset}px`,
      '--audio-pulse': bass,
    } as React.CSSProperties;
  }, [audioData]);

  // Initial terminal content
  useEffect(() => {
    const initialLines: TerminalLine[] = [
      { id: lineIdRef.current++, content: 'CodeFI v1.0.0 - Lofi Pomodoro Terminal', type: 'info' },
      { id: lineIdRef.current++, content: '────────────────────────────────────────', type: 'info' },
      { id: lineIdRef.current++, content: '', type: 'output' },
    ];
    setLines(initialLines);
  }, []);

  // Add ambient terminal activity
  useEffect(() => {
    if (!isRunning) return;

    const addAmbientLine = () => {
      const isThought = Math.random() > 0.6;

      if (isThought) {
        const thought = THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)];
        setLines(prev => [...prev.slice(-15), {
          id: lineIdRef.current++,
          content: thought,
          type: 'comment',
        }]);
      } else {
        const snippet = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];

        // Add command
        setLines(prev => [...prev.slice(-15), {
          id: lineIdRef.current++,
          content: `$ ${snippet.cmd}`,
          type: 'command',
        }]);

        // Add output after delay
        setTimeout(() => {
          setLines(prev => [...prev.slice(-15), {
            id: lineIdRef.current++,
            content: snippet.out,
            type: 'success',
          }]);
        }, 800);
      }
    };

    // Add line every 8-15 seconds for ambient feel
    const interval = setInterval(addAmbientLine, 8000 + Math.random() * 7000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Typing cursor effect
  useEffect(() => {
    const cursor = '█';
    const interval = setInterval(() => {
      setCurrentTyping(prev => prev === cursor ? '' : cursor);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const phaseColor = pomodoroPhase === 'work' ? 'var(--text-green)' :
                     pomodoroPhase === 'break' ? 'var(--text-cyan)' : 'var(--text-amber)';

  const phaseLabel = pomodoroPhase === 'work' ? 'FOCUS' :
                     pomodoroPhase === 'break' ? 'BREAK' : 'LONG BREAK';

  return (
    <div className="terminal-container" style={audioStyles}>
      {/* Scanlines overlay */}
      <div className="terminal-scanlines" />

      {/* CRT glow effect */}
      <div className="terminal-glow" />

      {/* Terminal window */}
      <div className="terminal-window">
        {/* Title bar */}
        <div className="terminal-titlebar">
          <div className="terminal-buttons">
            <span className="terminal-btn close" />
            <span className="terminal-btn minimize" />
            <span className="terminal-btn maximize" />
          </div>
          <div className="terminal-title">codefi@focus:~</div>
          <div className="terminal-status">
            <span className="status-dot" style={{ backgroundColor: isRunning ? phaseColor : 'var(--text-muted)' }} />
            {isRunning ? 'active' : 'paused'}
          </div>
        </div>

        {/* Terminal content */}
        <div className="terminal-content" ref={terminalRef}>
          {/* Status header */}
          <div className="terminal-header">
            <div className="header-timer" style={{ color: phaseColor }}>
              <span className="timer-label">{phaseLabel}</span>
              <span className="timer-value">{pomodoroTime}</span>
            </div>
            <div className="header-stats">
              <span className="stat-pomodoros">
                {Array.from({ length: 4 }, (_, i) => (
                  <span
                    key={i}
                    className={`pomodoro-dot ${i < (completedPomodoros % 4) ? 'completed' : ''}`}
                  />
                ))}
              </span>
              <span className="stat-count">{completedPomodoros} sessions</span>
            </div>
          </div>

          <div className="terminal-divider">{'─'.repeat(50)}</div>

          {/* Terminal lines */}
          <div className="terminal-lines">
            {lines.map(line => (
              <div key={line.id} className={`terminal-line ${line.type}`}>
                {line.content.split('\n').map((text, i) => (
                  <div key={i}>{text}</div>
                ))}
              </div>
            ))}

            {/* Input line with cursor */}
            <div className="terminal-line input">
              <span className="prompt">$</span>
              <span className="cursor">{currentTyping}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
