import { useTheme } from '../../context/ThemeContext';

interface CodeLineProps {
  lineNumber: number;
  content: string;
  isCurrentLine?: boolean;
}

export function CodeLine({ lineNumber, content, isCurrentLine }: CodeLineProps) {
  const { theme } = useTheme();

  // Simple syntax highlighting based on patterns
  const highlightSyntax = (text: string) => {
    if (!text.trim()) return text;

    // Keywords
    const keywords = /\b(function|const|let|var|return|if|else|for|while|class|interface|type|import|export|from|async|await|def|fn|pub|use|struct|impl|match|go|func|package|main)\b/g;
    // Strings
    const strings = /(['"`])(.*?)\1/g;
    // Comments
    const comments = /(\/\/.*|#.*)/g;
    // Numbers
    const numbers = /\b(\d+)\b/g;
    // Functions
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;

    let result = text;

    // Apply highlighting (order matters)
    result = result.replace(comments, `<span style="color: ${theme.dim}">$1</span>`);
    result = result.replace(strings, `<span style="color: ${theme.glow}">$1$2$1</span>`);
    result = result.replace(keywords, `<span style="color: ${theme.accent}; font-weight: 500">$1</span>`);
    result = result.replace(numbers, `<span style="color: ${theme.glow}">$1</span>`);
    result = result.replace(functions, `<span style="color: ${theme.text}">$1</span>(`);

    return result;
  };

  return (
    <div
      className="code-line"
      style={{
        color: theme.text,
        opacity: isCurrentLine ? 1 : 0.9,
      }}
    >
      <span className="line-number" style={{ color: theme.dim }}>
        {lineNumber}
      </span>
      <span dangerouslySetInnerHTML={{ __html: highlightSyntax(content) }} />
      {isCurrentLine && (
        <span className="cursor" style={{ backgroundColor: theme.text }} />
      )}
    </div>
  );
}
