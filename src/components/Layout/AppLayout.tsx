import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useTheme();

  return (
    <div
      className="w-full h-full relative"
      style={{ backgroundColor: theme.bg }}
    >
      {children}
    </div>
  );
}
