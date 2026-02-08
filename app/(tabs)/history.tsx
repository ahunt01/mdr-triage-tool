import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Radius } from '../../constants/colors';
import { getHistory, deleteFromHistory, type HistoryItem } from '../../services/storage';
import { formatScore } from '../../services/analysis';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const items = await getHistory();
    setHistory(items);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleOpen = (item: HistoryItem) => {
    router.push({
      pathname: '/(tabs)/analysis',
      params: {
        fen: item.fen,
        orientation: item.orientation,
      },
    });
  };

  const handleDelete = (item: HistoryItem) => {
    Alert.alert('Delete Scan', 'Remove this position from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFromHistory(item.id);
          setHistory((prev) => prev.filter((h) => h.id !== item.id));
        },
      },
    ]);
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const scoreStr = formatScore(item.evaluation, item.mate);
    const isPositive = item.mate !== null ? item.mate > 0 : item.evaluation >= 0;
    const fenPreview = item.fen.split(' ')[0].substring(0, 24) + '...';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpen(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text style={styles.fenPreview} numberOfLines={1}>
              {fenPreview}
            </Text>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text
              style={[
                styles.evalText,
                { color: isPositive ? Colors.evalWhite : Colors.evalBlack },
              ]}
            >
              {scoreStr}
            </Text>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="time-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>No Saved Scans</Text>
        <Text style={styles.emptyText}>
          Scan a chess board and save the analysis to see it here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  fenPreview: {
    color: Colors.text,
    fontSize: FontSizes.body,
    fontFamily: 'monospace',
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  evalText: {
    fontSize: FontSizes.heading,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: FontSizes.heading,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
    textAlign: 'center',
    lineHeight: 20,
  },
});
