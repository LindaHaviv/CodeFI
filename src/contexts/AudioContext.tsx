import { createContext, useContext, type ReactNode } from 'react';
import { useAudioAnalyzer, type AudioData } from '../hooks/useAudioAnalyzer';

interface AudioContextType {
  audioData: AudioData;
  connectAudioElement: (element: HTMLAudioElement) => void;
  disconnect: () => void;
  isAnalyzing: boolean;
}

const AudioReactiveContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const analyzer = useAudioAnalyzer();

  return (
    <AudioReactiveContext.Provider value={analyzer}>
      {children}
    </AudioReactiveContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioReactiveContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
