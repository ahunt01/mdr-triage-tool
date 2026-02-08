import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Radius } from '../constants/colors';

interface ScanButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export default function ScanButton({
  title,
  icon,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: ScanButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'outline' && styles.outlineButton,
    isDisabled && styles.disabledButton,
    style,
  ];

  const textColor =
    variant === 'outline' ? Colors.primary : Colors.white;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Ionicons name={icon} size={24} color={textColor} style={styles.icon} />
      )}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radius.button,
    minHeight: 56,
    minWidth: 44,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: FontSizes.button,
    fontWeight: '600',
  },
});
