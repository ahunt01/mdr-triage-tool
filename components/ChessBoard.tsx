import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import { BoardThemes, type BoardTheme } from '../constants/themes';
import { Colors, FontSizes } from '../constants/colors';
import { getBoardTheme } from '../services/storage';

interface ChessBoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  size?: number;
  themeKey?: string;
}

const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: '\u2654', q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658', p: '\u2659' },
  b: { k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F' },
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({
  fen,
  orientation = 'white',
  size = 320,
  themeKey: themeKeyProp,
}: ChessBoardProps) {
  const [storedThemeKey, setStoredThemeKey] = useState('brown');
  const squareSize = size / 8;

  useEffect(() => {
    if (!themeKeyProp) {
      getBoardTheme().then(setStoredThemeKey);
    }
  }, [themeKeyProp]);

  const activeThemeKey = themeKeyProp ?? storedThemeKey;
  const theme: BoardTheme = BoardThemes[activeThemeKey] ?? BoardThemes.brown;

  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return (
      <View style={[styles.errorContainer, { width: size, height: size }]}>
        <Text style={styles.errorText}>Invalid position</Text>
      </View>
    );
  }

  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      {ranks.map((rank, rowIdx) =>
        files.map((file, colIdx) => {
          const square = `${file}${rank}` as Square;
          const piece = chess.get(square);
          const isLight = (rowIdx + colIdx) % 2 === 0;
          const bgColor = isLight ? theme.light : theme.dark;

          return (
            <View
              key={square}
              style={[
                styles.square,
                {
                  width: squareSize,
                  height: squareSize,
                  backgroundColor: bgColor,
                  left: colIdx * squareSize,
                  top: rowIdx * squareSize,
                },
              ]}
            >
              {piece && (
                <Text
                  style={[
                    styles.piece,
                    { fontSize: squareSize * 0.75, lineHeight: squareSize },
                  ]}
                >
                  {PIECE_UNICODE[piece.color][piece.type]}
                </Text>
              )}
              {rowIdx === 7 && (
                <Text
                  style={[
                    styles.fileLabel,
                    { color: isLight ? theme.dark : theme.light, fontSize: squareSize * 0.2 },
                  ]}
                >
                  {file}
                </Text>
              )}
              {colIdx === 0 && (
                <Text
                  style={[
                    styles.rankLabel,
                    { color: isLight ? theme.dark : theme.light, fontSize: squareSize * 0.2 },
                  ]}
                >
                  {rank}
                </Text>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },
  square: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    textAlign: 'center',
  },
  fileLabel: {
    position: 'absolute',
    bottom: 1,
    right: 3,
    fontWeight: '600',
  },
  rankLabel: {
    position: 'absolute',
    top: 1,
    left: 3,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.body,
  },
});
