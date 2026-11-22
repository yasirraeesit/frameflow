import type { Config } from 'tailwindcss';
import path from 'path';

const config: Config = {
  content: [
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0C0C0E',
        shell: '#0C0C0E',
        sidebar: '#141417',
        card: '#141417',
        surface: {
          DEFAULT: '#141417',
          elevated: '#1E1E23',
          hover: '#26262D',
        },
        border: {
          DEFAULT: '#28282F',
          subtle: '#202026',
          hover: '#3E3E47',
        },
        accent: {
          DEFAULT: '#F59E0B', // Cinema Amber
          hover: '#D97706',
          subtle: 'rgba(245, 158, 11, 0.12)',
          glow: 'rgba(245, 158, 11, 0.25)',
          text: '#0C0C0E',
        },
        secondary: {
          DEFAULT: '#FB923C', // Warm Highlight
          subtle: 'rgba(251, 146, 60, 0.12)',
        },
        virality: {
          DEFAULT: '#10B981', // Crisp Emerald
          hover: '#059669',
          subtle: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
        },
        text: {
          main: '#F4F4F6',
          muted: '#9E9EA8',
          dim: '#71717A',
        },
        studio: {
          canvas: '#0C0C0E',
          sidebar: '#141417',
          card: '#141417',
          surface: '#1E1E23',
          'surface-hover': '#26262D',
          border: '#28282F',
          'border-hover': '#3E3E47',
          accent: '#F59E0B',
          'accent-hover': '#D97706',
          'accent-subtle': 'rgba(245, 158, 11, 0.12)',
          virality: '#10B981',
          'virality-subtle': 'rgba(16, 185, 129, 0.12)',
          'virality-border': 'rgba(16, 185, 129, 0.3)',
          text: {
            main: '#F4F4F6',
            muted: '#9E9EA8',
            dim: '#71717A',
          },
        },
        track: {
          video: {
            bg: '#1A2433',
            border: '#3B82F6',
            hover: '#60A5FA',
          },
          audio: {
            bg: '#12342E',
            border: '#14B8A6',
            hover: '#2DD4BF',
          },
          text: {
            bg: '#322513',
            border: '#F59E0B',
            hover: '#FBBF24',
          },
        },
        primary: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          subtle: 'rgba(245, 158, 11, 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
