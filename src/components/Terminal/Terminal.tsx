import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAudio } from '../../context/AudioContext';
import { CodeLine } from './CodeLine';
import { getAllLines } from '../../data/codeSnippets';
import './terminal.css';

const BASE_SCROLL_SPEED = 0.5; // pixels per frame
const AUDIO_SCROLL_MULTIPLIER = 0.3; // How much audio affects scroll

function TerminalColumn({
  lines,
  scrollOffset,
  startLineNumber,
  reverse = false
}: {
  lines: string[];
  scrollOffset: number;
  startLineNumber: number;
  reverse?: boolean;
}) {
  // Use modulo to create seamless infinite scroll
  const lineHeight = 22.4;
  const singleSetHeight = (lines.length / 3) * lineHeight;
  const normalizedOffset = scrollOffset % singleSetHeight;
  const offset = reverse ? normalizedOffset - singleSetHeight : -normalizedOffset;

  return (
    <div
      className="terminal-content flex-1 min-w-[300px] px-4"
      style={{
        transform: `translateY(${offset}px)`,
      }}
    >
      {lines.map((line, index) => (
        <CodeLine
          key={index}
          lineNumber={startLineNumber + (index % (lines.length / 3)) + 1}
          content={line}
        />
      ))}
    </div>
  );
}

export function Terminal() {
  const { theme } = useTheme();
  const { audioData } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [columns, setColumns] = useState<string[][]>([]);
  const animationRef = useRef<number>(0);
  const allLinesRef = useRef<string[]>([]);

  // Initialize code lines and split into columns
  useEffect(() => {
    const lines = getAllLines();
    // Repeat lines to create infinite scroll effect
    const repeatedLines = [...lines, ...lines, ...lines];
    allLinesRef.current = repeatedLines;

    // Split into 3 columns with different starting points for variety
    const third = Math.floor(repeatedLines.length / 3);
    setColumns([
      repeatedLines,
      [...repeatedLines.slice(third), ...repeatedLines.slice(0, third)],
      [...repeatedLines.slice(third * 2), ...repeatedLines.slice(0, third * 2)],
    ]);
  }, []);

  // Auto-scroll with audio reactivity
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Base scroll speed + audio influence
      const audioInfluence = audioData.bass * AUDIO_SCROLL_MULTIPLIER;
      const speed = BASE_SCROLL_SPEED * (1 + audioInfluence) * (deltaTime / 16);

      setScrollOffset((prev) => prev + speed);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioData.bass]);

  // Calculate glow intensity based on audio
  const glowIntensity = 0.3 + audioData.mid * 0.3;
  const scanlineOpacity = 0.02 + audioData.bass * 0.06;

  return (
    <div
      className="crt-container w-full h-full"
      style={{
        backgroundColor: theme.bg,
        boxShadow: `inset 0 0 ${60 + audioData.mid * 40}px ${theme.glow}${Math.round(glowIntensity * 25).toString(16).padStart(2, '0')}`,
      }}
      ref={containerRef}
    >
      {/* Scanlines overlay */}
      <div
        className="scanlines"
        style={{ opacity: scanlineOpacity }}
      />

      {/* Scrolling code content - multiple columns */}
      <div
        className="terminal-scroll terminal-glow h-full overflow-hidden flex"
      >
        {columns.map((columnLines, colIndex) => (
          <TerminalColumn
            key={colIndex}
            lines={columnLines}
            scrollOffset={scrollOffset}
            startLineNumber={colIndex * 100}
            reverse={colIndex % 2 === 1} // Alternate scroll direction for visual interest
          />
        ))}
      </div>

      {/* Ambient glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${theme.glow}${Math.round(glowIntensity * 8).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          zIndex: 5,
        }}
      />
    </div>
  );
}
