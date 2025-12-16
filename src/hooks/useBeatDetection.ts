import { useRef, useState, useEffect } from 'react';
import type { BeatData } from '../types';

export function useBeatDetection(analyserNode: AnalyserNode | null, isPlaying: boolean) {
  const [beatData, setBeatData] = useState<BeatData>({
    isBeat: false,
    bpm: 0,
    confidence: 0,
    waveform: [],
    beatIntensity: 0,
  });

  // Use refs for values that need to stay current in animation loop
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isPlayingRef = useRef(false);
  const energyHistoryRef = useRef<number[]>([]);
  const beatTimesRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const smoothedBpmRef = useRef<number>(0);
  const beatDecayRef = useRef<number>(0);
  const peakEnergyRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => {
    analyserRef.current = analyserNode;
  }, [analyserNode]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Main animation loop
  useEffect(() => {
    const detectBeat = () => {
      const analyser = analyserRef.current;
      const playing = isPlayingRef.current;

      if (!analyser || !playing) {
        setBeatData(prev => ({
          ...prev,
          isBeat: false,
          waveform: [],
          beatIntensity: Math.max(0, prev.beatIntensity - 0.05),
        }));
        animationFrameRef.current = requestAnimationFrame(detectBeat);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(timeData);

      // Calculate energy across low frequencies (bass + low-mids for lofi)
      const bassEnd = Math.floor(bufferLength * 0.15);
      let energy = 0;
      for (let i = 0; i < bassEnd; i++) {
        energy += frequencyData[i];
      }
      energy = energy / bassEnd / 255;

      // Track peak energy for adaptive threshold
      peakEnergyRef.current = Math.max(peakEnergyRef.current * 0.995, energy);

      // Update energy history (short window for responsiveness)
      energyHistoryRef.current.push(energy);
      if (energyHistoryRef.current.length > 20) {
        energyHistoryRef.current.shift();
      }

      // Calculate average and threshold
      const avgEnergy = energyHistoryRef.current.reduce((a, b) => a + b, 0)
        / energyHistoryRef.current.length;

      // Adaptive threshold based on track dynamics
      const dynamicRange = peakEnergyRef.current - avgEnergy;
      const threshold = avgEnergy + (dynamicRange * 0.3); // 30% above average toward peak

      // Beat detection
      const now = performance.now();
      const timeSinceLastBeat = now - lastBeatTimeRef.current;
      const minInterval = 250; // Max 240 BPM

      const isBeat =
        energy > threshold &&
        energy > avgEnergy * 1.08 && // At least 8% above average
        timeSinceLastBeat > minInterval &&
        energyHistoryRef.current.length >= 10;

      // Calculate BPM
      let bpm = smoothedBpmRef.current;

      if (isBeat) {
        lastBeatTimeRef.current = now;
        beatDecayRef.current = 1;

        beatTimesRef.current.push(now);
        if (beatTimesRef.current.length > 8) {
          beatTimesRef.current.shift();
        }

        // Calculate BPM from just 2 beats
        if (beatTimesRef.current.length >= 2) {
          const intervals: number[] = [];
          for (let i = 1; i < beatTimesRef.current.length; i++) {
            const interval = beatTimesRef.current[i] - beatTimesRef.current[i - 1];
            // Filter out unlikely intervals (between 300ms and 1200ms = 50-200 BPM)
            if (interval >= 300 && interval <= 1200) {
              intervals.push(interval);
            }
          }

          if (intervals.length > 0) {
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const rawBpm = 60000 / avgInterval;

            if (rawBpm >= 50 && rawBpm <= 200) {
              // Quick convergence for first detection, then smooth
              const smoothFactor = smoothedBpmRef.current === 0 ? 1 : 0.3;
              smoothedBpmRef.current = smoothedBpmRef.current * (1 - smoothFactor) + rawBpm * smoothFactor;
              bpm = smoothedBpmRef.current;
            }
          }
        }
      }

      // Decay beat intensity
      beatDecayRef.current = Math.max(0, beatDecayRef.current - 0.08);

      // Calculate confidence based on beat consistency
      const confidence = beatTimesRef.current.length >= 3 ?
        Math.min(1, beatTimesRef.current.length / 6) : 0;

      // Normalize waveform for visualization
      const waveform: number[] = [];
      for (let i = 0; i < timeData.length; i += 4) {
        waveform.push((timeData[i] - 128) / 128);
      }

      setBeatData({
        isBeat,
        bpm: Math.round(bpm),
        confidence,
        waveform,
        beatIntensity: beatDecayRef.current,
      });

      animationFrameRef.current = requestAnimationFrame(detectBeat);
    };

    animationFrameRef.current = requestAnimationFrame(detectBeat);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Reset state when audio stops
  useEffect(() => {
    if (!isPlaying) {
      energyHistoryRef.current = [];
      beatTimesRef.current = [];
      smoothedBpmRef.current = 0;
      lastBeatTimeRef.current = 0;
      peakEnergyRef.current = 0;
    }
  }, [isPlaying]);

  return beatData;
}
