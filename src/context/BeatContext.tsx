import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useAudio } from './AudioContext';
import { useBeatDetection } from '../hooks/useBeatDetection';
import type { BeatData } from '../types';

interface BeatContextType {
  beatData: BeatData;
  showVisualizer: boolean;
  toggleVisualizer: () => void;
}

const BeatContext = createContext<BeatContextType | null>(null);

export function BeatProvider({ children }: { children: ReactNode }) {
  const { analyserNode, isPlaying } = useAudio();
  const [showVisualizer, setShowVisualizer] = useState(false);

  const beatData = useBeatDetection(analyserNode, isPlaying);

  const toggleVisualizer = () => {
    setShowVisualizer(prev => !prev);
  };

  return (
    <BeatContext.Provider value={{ beatData, showVisualizer, toggleVisualizer }}>
      {children}
    </BeatContext.Provider>
  );
}

export function useBeat() {
  const context = useContext(BeatContext);
  if (!context) {
    throw new Error('useBeat must be used within a BeatProvider');
  }
  return context;
}
