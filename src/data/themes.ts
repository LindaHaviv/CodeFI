import type { Theme, ThemeName } from '../types';

export const themes: Record<ThemeName, Theme> = {
  matrix: {
    name: 'matrix',
    label: 'Matrix',
    bg: '#0a0a0a',
    text: '#00ff41',
    accent: '#008f11',
    glow: '#00ff41',
    dim: '#004d1a',
  },
  dracula: {
    name: 'dracula',
    label: 'Dracula',
    bg: '#282a36',
    text: '#f8f8f2',
    accent: '#bd93f9',
    glow: '#ff79c6',
    dim: '#6272a4',
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    bg: '#2e3440',
    text: '#eceff4',
    accent: '#88c0d0',
    glow: '#5e81ac',
    dim: '#4c566a',
  },
  monokai: {
    name: 'monokai',
    label: 'Monokai',
    bg: '#272822',
    text: '#f8f8f2',
    accent: '#f92672',
    glow: '#a6e22e',
    dim: '#75715e',
  },
  amber: {
    name: 'amber',
    label: 'Amber',
    bg: '#1a1200',
    text: '#ffb000',
    accent: '#ff8c00',
    glow: '#ffb000',
    dim: '#805800',
  },
};

export const themeList = Object.values(themes);
