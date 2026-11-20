import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--studio-canvas)',
        surface: 'var(--studio-surface)',
        border: 'var(--studio-border)',
        studio: {
          canvas: 'var(--studio-canvas)',
          panel: 'var(--studio-panel)',
          surface: 'var(--studio-surface)',
          'surface-hover': 'var(--studio-surface-hover)',
          border: 'var(--studio-border)',
          'border-hover': 'var(--studio-border-hover)',
          accent: 'var(--studio-accent)',
          'accent-hover': 'var(--studio-accent-hover)',
          'accent-subtle': 'var(--studio-accent-subtle)',
          text: {
            main: 'var(--studio-text-main)',
            muted: 'var(--studio-text-muted)',
            dim: 'var(--studio-text-dim)',
          },
        },
        track: {
          video: {
            bg: 'var(--track-video-bg)',
            border: 'var(--track-video-border)',
            hover: 'var(--track-video-hover)',
          },
          audio: {
            bg: 'var(--track-audio-bg)',
            border: 'var(--track-audio-border)',
            hover: 'var(--track-audio-hover)',
          },
          text: {
            bg: 'var(--track-text-bg)',
            border: 'var(--track-text-border)',
            hover: 'var(--track-text-hover)',
          },
        },
        playhead: {
          DEFAULT: 'var(--playhead-accent)',
          hover: 'var(--studio-accent-hover)',
        },
        primary: {
          DEFAULT: 'var(--studio-accent)',
          hover: 'var(--studio-accent-hover)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Mono', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
