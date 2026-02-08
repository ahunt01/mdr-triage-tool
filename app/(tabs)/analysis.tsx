import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { Colors, FontSizes, Radius } from '../../constants/colors';
import ChessBoard from '../../components/ChessBoard';
import EvalBar from '../../components/EvalBar';
import MoveList from '../../components/MoveList';
import ScanButton from '../../components/ScanButton';
import {
  analyzePosition,
  type AnalysisResult,
  type AnalysisMove,
} from '../../services/analysis';
import { saveToHistory, getAnalysisDepth } from '../../services/storage';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{
    fen?: string;
    orientation?: string;
    confidence?: string;
  }>();

  const fen = params.fen ?? DEFAULT_FEN;
  const orientation = (params.orientation as 'white' | 'black') ?? 'white';
  const { width: screenWidth } = useWindowDimensions();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const boardSize = Math.min(screenWidth - 72, 360);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const depth = await getAnalysisDepth();
      const result = await analyzePosition(fen, depth);
      setAnalysis(result);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Analysis failed. Please try again.';
      setError(message);
    } finally {
      setAnalyzing(false);
    }
  }, [fen]);

  useEffect(() => {
    if (fen !== DEFAULT_FEN) {
      runAnalysis();
    }
  }, [fen, runAnalysis]);

  const handleOpenLichess = () => {
    const encodedFen = fen.replace(/ /g, '_');
    Linking.openURL(`https://lichess.org/analysis/${encodedFen}`);
  };

  const handleCopyFen = async () => {
    await Clipboard.setStringAsync(fen);
    Alert.alert('Copied', 'FEN copied to clipboard.');
  };

  const handleSave = async () => {
    try {
      await saveToHistory({
        fen,
        evaluation: analysis?.evaluation ?? 0,
        mate: analysis?.mate ?? null,
        orientation,
      });
      setSaved(true);
      Alert.alert('Saved', 'Position saved to history.');
    } catch {
      Alert.alert('Error', 'Failed to save position.');
    }
  };

  const evaluation = analysis?.evaluation ?? 0;
  const mate = analysis?.mate ?? null;
  const moves: AnalysisMove[] = analysis?.bestMoves ?? [];
  const depth = analysis?.depth ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.boardRow}>
        <EvalBar evaluation={evaluation} mate={mate} height={boardSize} />
        <ChessBoard
          fen={fen}
          orientation={orientation}
          size={boardSize}
        />
      </View>

      {analyzing && (
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>Analyzing position...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <ScanButton
            title="Retry"
            icon="refresh"
            onPress={runAnalysis}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      <MoveList moves={moves} depth={depth} />

      <View style={styles.actions}>
        <ScanButton
          title="Open in Lichess"
          icon="open-outline"
          onPress={handleOpenLichess}
          variant="outline"
          style={styles.actionButton}
        />
        <ScanButton
          title="Copy FEN"
          icon="copy-outline"
          onPress={handleCopyFen}
          variant="outline"
          style={styles.actionButton}
        />
      </View>

      <ScanButton
        title={saved ? 'Saved' : 'Save to History'}
        icon={saved ? 'checkmark-circle' : 'bookmark-outline'}
        onPress={handleSave}
        variant="primary"
        disabled={saved}
      />

      {fen === DEFAULT_FEN && !analyzing && (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No Position Loaded</Text>
          <Text style={styles.placeholderText}>
            Scan a chess board from the Scan tab to begin analysis.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    color: Colors.primaryLight,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.body,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 32,
    alignItems: 'center',
    marginTop: 8,
  },
  placeholderTitle: {
    color: Colors.text,
    fontSize: FontSizes.heading,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});
