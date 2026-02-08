import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisDepth } from '../constants/themes';

const KEYS = {
  history: 'chesslens_history',
  boardTheme: 'chesslens_board_theme',
  analysisDepth: 'chesslens_analysis_depth',
} as const;

export interface HistoryItem {
  id: string;
  fen: string;
  evaluation: number;
  mate: number | null;
  date: string;
  orientation: 'white' | 'black';
}

export async function getHistory(): Promise<HistoryItem[]> {
  const data = await AsyncStorage.getItem(KEYS.history);
  if (!data) return [];
  return JSON.parse(data);
}

export async function saveToHistory(item: Omit<HistoryItem, 'id' | 'date'>): Promise<void> {
  const history = await getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
    date: new Date().toISOString(),
  };
  history.unshift(newItem);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(history));
}

export async function deleteFromHistory(id: string): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter((item) => item.id !== id);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(filtered));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.history);
}

export async function getBoardTheme(): Promise<string> {
  const theme = await AsyncStorage.getItem(KEYS.boardTheme);
  return theme ?? 'brown';
}

export async function setBoardTheme(theme: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.boardTheme, theme);
}

export async function getAnalysisDepth(): Promise<AnalysisDepth> {
  const depth = await AsyncStorage.getItem(KEYS.analysisDepth);
  if (depth) {
    const parsed = parseInt(depth, 10);
    if (parsed === 10 || parsed === 15 || parsed === 20) return parsed;
  }
  return 15;
}

export async function setAnalysisDepth(depth: AnalysisDepth): Promise<void> {
  await AsyncStorage.setItem(KEYS.analysisDepth, depth.toString());
}
