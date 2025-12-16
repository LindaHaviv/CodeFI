# CodeFI

A lofi pomodoro web app for coders. The main visual is a realistic terminal that subtly reacts to audio — felt, not noticed.

## Features

- **Audio-Reactive Terminal**: A realistic terminal UI that breathes with the music. Subtle glow, brightness shifts, and scanline movements respond to the audio frequency data.
- **Pomodoro Timer**: 25-minute focus sessions with 5-minute breaks. Every 4 pomodoros triggers a longer 15-minute break.
- **Lofi Audio Streams**: Built-in streaming radio with multiple lofi/chillhop stations.
- **Ambient Terminal Activity**: Inspiring code snippets and thoughts appear in the terminal while you work.
- **Desktop Notifications**: Get notified when focus/break sessions end.
- **Keyboard Shortcuts**: Space to toggle timer, Ctrl+R to reset.

## Philosophy

This is a focus tool, not a distraction. The audio reactivity is designed to be ambient — it creates atmosphere without demanding attention. The visual changes are slow, smooth, and peripheral.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React + TypeScript
- Vite
- Web Audio API for real-time frequency analysis
- CSS custom properties for audio-reactive styling

## Audio Reactivity Details

The terminal responds to three frequency bands:

- **Bass (0-150Hz)**: Controls the subtle green glow around the terminal
- **Mid (150-500Hz)**: Affects overall text brightness
- **Treble (500Hz+)**: Adds slight movement to scanlines

All values are heavily smoothed (85% smoothing + additional interpolation) to create that ambient, "felt not noticed" effect.

---

*focus flows*
