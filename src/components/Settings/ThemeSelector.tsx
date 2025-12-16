import { useTheme } from '../../context/ThemeContext';
import { themeList } from '../../data/themes';
import type { ThemeName } from '../../types';

export function ThemeSelector() {
  const { themeName, setTheme, theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs uppercase tracking-wider"
        style={{ color: theme.dim }}
      >
        Theme
      </span>
      <div className="flex gap-1">
        {themeList.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name as ThemeName)}
            className="w-6 h-6 rounded-full transition-all duration-200 relative"
            style={{
              backgroundColor: t.accent,
              boxShadow:
                themeName === t.name
                  ? `0 0 0 2px ${theme.bg}, 0 0 0 4px ${t.accent}`
                  : 'none',
              transform: themeName === t.name ? 'scale(1.1)' : 'scale(1)',
            }}
            title={t.label}
          >
            {themeName === t.name && (
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                style={{ color: t.bg }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
