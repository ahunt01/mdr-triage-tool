import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '../constants/colors';
import type { AnalysisMove } from '../services/analysis';
import { formatScore } from '../services/analysis';

interface MoveListProps {
  moves: AnalysisMove[];
  depth: number;
}

export default function MoveList({ moves, depth }: MoveListProps) {
  if (moves.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No moves analyzed yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Top Moves</Text>
        <Text style={styles.depthText}>Depth {depth}</Text>
      </View>
      {moves.map((move, index) => {
        const scoreStr = formatScore(move.score, move.mate);
        const isPositive = move.mate !== null ? move.mate > 0 : move.score >= 0;

        return (
          <View key={move.uci} style={styles.moveRow}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <Text style={styles.moveSan}>{move.san}</Text>
            <Text
              style={[
                styles.moveScore,
                { color: isPositive ? Colors.evalWhite : Colors.evalBlack },
              ]}
            >
              {scoreStr}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    color: Colors.text,
    fontSize: FontSizes.button,
    fontWeight: '600',
  },
  depthText: {
    color: Colors.textMuted,
    fontSize: FontSizes.body,
  },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  moveSan: {
    color: Colors.text,
    fontSize: FontSizes.heading,
    fontWeight: '600',
    flex: 1,
  },
  moveScore: {
    fontSize: FontSizes.button,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: FontSizes.body,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
