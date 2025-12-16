import { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AudioData } from '../types';

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  currentTrack: number;
  audioData: AudioData;
  analyserNode: AnalyserNode | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setTrack: (index: number) => void;
  initAudio: (audioElement: HTMLAudioElement) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const VOLUME_KEY = 'codefi-volume';

// Placeholder tracks - in production, these would be actual lofi tracks
export const tracks = [
  { name: 'Lofi Chill', src: '' },
  { name: 'Coding Beats', src: '' },
  { name: 'Night Session', src: '' },
];

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.5;
  });
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioData, setAudioData] = useState<AudioData>({
    bass: 0,
    mid: 0,
    high: 0,
    average: 0,
  });
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const audioContextRef = useRef<globalThis.AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>(0);
  const smoothedDataRef = useRef<AudioData>({ bass: 0, mid: 0, high: 0, average: 0 });

  const updateAudioData = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Split into frequency bands
    const bassEnd = Math.floor(bufferLength * 0.1);
    const midEnd = Math.floor(bufferLength * 0.5);

    let bassSum = 0;
    let midSum = 0;
    let highSum = 0;

    for (let i = 0; i < bassEnd; i++) {
      bassSum += dataArray[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += dataArray[i];
    }
    for (let i = midEnd; i < bufferLength; i++) {
      highSum += dataArray[i];
    }

    const bass = bassSum / bassEnd / 255;
    const mid = midSum / (midEnd - bassEnd) / 255;
    const high = highSum / (bufferLength - midEnd) / 255;
    const average = (bass + mid + high) / 3;

    // Apply heavy smoothing for subtle transitions
    const smoothing = 0.92;
    smoothedDataRef.current = {
      bass: smoothedDataRef.current.bass * smoothing + bass * (1 - smoothing),
      mid: smoothedDataRef.current.mid * smoothing + mid * (1 - smoothing),
      high: smoothedDataRef.current.high * smoothing + high * (1 - smoothing),
      average: smoothedDataRef.current.average * smoothing + average * (1 - smoothing),
    };

    setAudioData({ ...smoothedDataRef.current });
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, []);

  const initAudio = useCallback((audioElement: HTMLAudioElement) => {
    audioElementRef.current = audioElement;
    audioElement.volume = volume;

    // First time initialization - create audio context (requires user interaction)
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new window.AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;
      } catch (err) {
        console.warn('Web Audio API not available:', err);
        return;
      }
    }

    // Connect the audio element to the analyser
    // Note: createMediaElementSource can only be called once per element
    if (!sourceRef.current && analyserRef.current && audioContextRef.current) {
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (err) {
        console.warn('Could not connect audio source:', err);
      }
    }

    // Always update state so consumers get the analyser
    if (analyserRef.current) {
      setAnalyserNode(analyserRef.current);
    }
  }, [volume]);

  const play = useCallback(() => {
    audioContextRef.current?.resume();
    setIsPlaying(true);
    // Start audio visualization loop
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [updateAudioData]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    localStorage.setItem(VOLUME_KEY, vol.toString());
    if (audioElementRef.current) {
      audioElementRef.current.volume = vol;
    }
  }, []);

  const nextTrack = useCallback(() => {
    setCurrentTrack(prev => (prev + 1) % tracks.length);
  }, []);

  const prevTrack = useCallback(() => {
    setCurrentTrack(prev => (prev - 1 + tracks.length) % tracks.length);
  }, []);

  const setTrack = useCallback((index: number) => {
    setCurrentTrack(index);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        currentTrack,
        audioData,
        analyserNode,
        play,
        pause,
        toggle,
        setVolume,
        nextTrack,
        prevTrack,
        setTrack,
        initAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
