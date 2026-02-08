export interface BoardTheme {
  light: string;
  dark: string;
  label: string;
}

export const BoardThemes: Record<string, BoardTheme> = {
  brown: {
    light: '#f0d9b5',
    dark: '#b58863',
    label: 'Brown',
  },
  green: {
    light: '#eeeed2',
    dark: '#769656',
    label: 'Green',
  },
  blue: {
    light: '#dee3e6',
    dark: '#8ca2ad',
    label: 'Blue',
  },
  gray: {
    light: '#e0e0e0',
    dark: '#9e9e9e',
    label: 'Gray',
  },
};

export const AnalysisDepths = [10, 15, 20] as const;

export type AnalysisDepth = (typeof AnalysisDepths)[number];
