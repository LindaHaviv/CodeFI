import { useRef, useState, useCallback, useEffect } from 'react';

export interface AudioData {
  // Normalized values between 0-1, smoothed for subtle reactions
  bass: number;      // Low frequencies (good for slow pulsing)
  mid: number;       // Mid frequencies
  treble: number;    // High frequencies (good for subtle sparkles)
  average: number;   // Overall energy level
  // Raw frequency data if needed
  frequencyData: Uint8Array | null;
}

const SMOOTHING = 0.85; // High smoothing for subtle, felt-not-noticed reactions

export function useAudioAnalyzer() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  const [audioData, setAudioData] = useState<AudioData>({
    bass: 0,
    mid: 0,
    treble: 0,
    average: 0,
    frequencyData: null,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Smooth transition helper
  const smoothValueRef = useRef({ bass: 0, mid: 0, treble: 0, average: 0 });

  const connectAudioElement = useCallback((audioElement: HTMLAudioElement) => {
    // Create audio context if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create analyzer with settings for smooth, subtle reactions
    if (!analyzerRef.current) {
      analyzerRef.current = ctx.createAnalyser();
      analyzerRef.current.fftSize = 256;
      analyzerRef.current.smoothingTimeConstant = SMOOTHING;
    }

    // Connect source only once
    if (!sourceRef.current) {
      try {
        sourceRef.current = ctx.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(ctx.destination);
      } catch {
        // Source might already be connected
        console.log('Audio source already connected');
      }
    }

    setIsAnalyzing(true);
  }, []);

  const analyze = useCallback(() => {
    if (!analyzerRef.current || !isAnalyzing) return;

    const analyzer = analyzerRef.current;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyzer.getByteFrequencyData(dataArray);

    // Split frequencies into bands
    const bassEnd = Math.floor(bufferLength * 0.15);   // ~0-150Hz
    const midEnd = Math.floor(bufferLength * 0.5);     // ~150-500Hz

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i];
      if (i < bassEnd) {
        bassSum += value;
      } else if (i < midEnd) {
        midSum += value;
      } else {
        trebleSum += value;
      }
    }

    // Normalize to 0-1
    const rawBass = bassSum / (bassEnd * 255);
    const rawMid = midSum / ((midEnd - bassEnd) * 255);
    const rawTreble = trebleSum / ((bufferLength - midEnd) * 255);
    const rawAverage = (rawBass + rawMid + rawTreble) / 3;

    // Apply additional smoothing for subtle, ambient feel
    const smooth = smoothValueRef.current;
    const factor = 0.15; // How fast to respond (lower = smoother)

    smooth.bass = smooth.bass + (rawBass - smooth.bass) * factor;
    smooth.mid = smooth.mid + (rawMid - smooth.mid) * factor;
    smooth.treble = smooth.treble + (rawTreble - smooth.treble) * factor;
    smooth.average = smooth.average + (rawAverage - smooth.average) * factor;

    setAudioData({
      bass: smooth.bass,
      mid: smooth.mid,
      treble: smooth.treble,
      average: smooth.average,
      frequencyData: dataArray,
    });

    animationRef.current = requestAnimationFrame(analyze);
  }, [isAnalyzing]);

  useEffect(() => {
    if (isAnalyzing) {
      animationRef.current = requestAnimationFrame(analyze);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnalyzing, analyze]);

  const disconnect = useCallback(() => {
    setIsAnalyzing(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  return {
    audioData,
    connectAudioElement,
    disconnect,
    isAnalyzing,
  };
}
