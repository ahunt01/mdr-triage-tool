import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '../constants/colors';
import { formatScore } from '../services/analysis';

interface EvalBarProps {
  evaluation: number;
  mate: number | null;
  height?: number;
}

export default function EvalBar({ evaluation, mate, height = 320 }: EvalBarProps) {
  let whitePercent: number;

  if (mate !== null) {
    whitePercent = mate > 0 ? 95 : 5;
  } else {
    const clamped = Math.max(-10, Math.min(10, evaluation));
    whitePercent = 50 + (clamped / 10) * 45;
  }

  const scoreText = formatScore(evaluation, mate);

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.blackSection, { flex: 100 - whitePercent }]}>
        {whitePercent < 50 && (
          <Text style={styles.blackScore}>{scoreText}</Text>
        )}
      </View>
      <View style={[styles.whiteSection, { flex: whitePercent }]}>
        {whitePercent >= 50 && (
          <Text style={styles.whiteScore}>{scoreText}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  blackSection: {
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  whiteSection: {
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  blackScore: {
    color: '#e8e8e8',
    fontSize: 10,
    fontWeight: '700',
  },
  whiteScore: {
    color: '#1a1a2e',
    fontSize: 10,
    fontWeight: '700',
  },
});
