import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Radius } from '../../constants/colors';
import { BoardThemes } from '../../constants/themes';
import { AnalysisDepths, type AnalysisDepth } from '../../constants/themes';
import {
  getBoardTheme,
  setBoardTheme,
  getAnalysisDepth,
  setAnalysisDepth,
} from '../../services/storage';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const [selectedTheme, setSelectedTheme] = useState('brown');
  const [selectedDepth, setSelectedDepth] = useState<AnalysisDepth>(15);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const theme = await getBoardTheme();
        const depth = await getAnalysisDepth();
        setSelectedTheme(theme);
        setSelectedDepth(depth);
      };
      loadSettings();
    }, [])
  );

  const handleThemeChange = async (key: string) => {
    setSelectedTheme(key);
    await setBoardTheme(key);
  };

  const handleDepthChange = async (depth: AnalysisDepth) => {
    setSelectedDepth(depth);
    await setAnalysisDepth(depth);
  };

  const handleRate = () => {
    Linking.openURL('https://apps.apple.com/app/chesslens/id0000000000');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Board Theme</Text>
        <View style={styles.themeGrid}>
          {Object.entries(BoardThemes).map(([key, theme]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.themeCard,
                selectedTheme === key && styles.themeCardSelected,
              ]}
              onPress={() => handleThemeChange(key)}
              activeOpacity={0.7}
            >
              <View style={styles.themePreview}>
                <View
                  style={[
                    styles.themeSquare,
                    { backgroundColor: theme.light },
                  ]}
                />
                <View
                  style={[
                    styles.themeSquare,
                    { backgroundColor: theme.dark },
                  ]}
                />
                <View
                  style={[
                    styles.themeSquare,
                    { backgroundColor: theme.dark },
                  ]}
                />
                <View
                  style={[
                    styles.themeSquare,
                    { backgroundColor: theme.light },
                  ]}
                />
              </View>
              <Text style={styles.themeLabel}>{theme.label}</Text>
              {selectedTheme === key && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analysis Depth</Text>
        <View style={styles.depthRow}>
          {AnalysisDepths.map((depth) => (
            <TouchableOpacity
              key={depth}
              style={[
                styles.depthButton,
                selectedDepth === depth && styles.depthButtonSelected,
              ]}
              onPress={() => handleDepthChange(depth)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.depthText,
                  selectedDepth === depth && styles.depthTextSelected,
                ]}
              >
                {depth}
              </Text>
              <Text style={styles.depthLabel}>
                {depth === 10 ? 'Fast' : depth === 15 ? 'Balanced' : 'Deep'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About ChessLens</Text>
        <View style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.aboutRow}
            onPress={handleRate}
            activeOpacity={0.7}
          >
            <Text style={styles.aboutLabel}>Rate ChessLens</Text>
            <Ionicons
              name="star"
              size={18}
              color={Colors.warning}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutDescription}>
              Scan chess positions from photos and get instant Stockfish analysis.
              Powered by Claude Vision and Stockfish.
            </Text>
          </View>
        </View>
      </View>
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
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSizes.heading,
    fontWeight: '700',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    width: '47%',
    gap: 8,
  },
  themeCardSelected: {
    borderColor: Colors.primary,
  },
  themePreview: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 4,
    overflow: 'hidden',
  },
  themeSquare: {
    width: 24,
    height: 24,
  },
  themeLabel: {
    color: Colors.text,
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  depthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  depthButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  depthButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#1a1b3a',
  },
  depthText: {
    color: Colors.text,
    fontSize: FontSizes.heading,
    fontWeight: '700',
  },
  depthTextSelected: {
    color: Colors.primary,
  },
  depthLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
  },
  aboutLabel: {
    color: Colors.text,
    fontSize: FontSizes.button,
  },
  aboutValue: {
    color: Colors.textSecondary,
    fontSize: FontSizes.button,
  },
  aboutDescription: {
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
    lineHeight: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
