import { Chess, type Square, type PieceSymbol, type Color, type Move } from 'chess.js';

export interface AnalysisMove {
  san: string;
  uci: string;
  score: number;
  mate: number | null;
}

export interface AnalysisResult {
  evaluation: number;
  mate: number | null;
  bestMoves: AnalysisMove[];
  depth: number;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3.2,
  b: 3.3,
  r: 5,
  q: 9,
  k: 0,
};

const PST_PAWN: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],
  [0.1,0.1,0.2,0.3,0.3,0.2,0.1,0.1],
  [0.05,0.05,0.1,0.25,0.25,0.1,0.05,0.05],
  [0,  0,  0,  0.2,0.2,0,  0,  0],
  [0.05,-0.05,-0.1,0,0,-0.1,-0.05,0.05],
  [0.05,0.1,0.1,-0.2,-0.2,0.1,0.1,0.05],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT: number[][] = [
  [-0.5,-0.4,-0.3,-0.3,-0.3,-0.3,-0.4,-0.5],
  [-0.4,-0.2,0,  0,  0,  0,  -0.2,-0.4],
  [-0.3,0,  0.1,0.15,0.15,0.1,0,  -0.3],
  [-0.3,0.05,0.15,0.2,0.2,0.15,0.05,-0.3],
  [-0.3,0,  0.15,0.2,0.2,0.15,0,  -0.3],
  [-0.3,0.05,0.1,0.15,0.15,0.1,0.05,-0.3],
  [-0.4,-0.2,0,  0.05,0.05,0,  -0.2,-0.4],
  [-0.5,-0.4,-0.3,-0.3,-0.3,-0.3,-0.4,-0.5],
];

const PST_BISHOP: number[][] = [
  [-0.2,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.2],
  [-0.1,0,  0,  0,  0,  0,  0,  -0.1],
  [-0.1,0,  0.1,0.1,0.1,0.1,0,  -0.1],
  [-0.1,0.05,0.05,0.1,0.1,0.05,0.05,-0.1],
  [-0.1,0,  0.1,0.1,0.1,0.1,0,  -0.1],
  [-0.1,0.1,0.1,0.1,0.1,0.1,0.1,-0.1],
  [-0.1,0.05,0,  0,  0,  0,  0.05,-0.1],
  [-0.2,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.2],
];

const PST_ROOK: number[][] = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [0.05,0.1,0.1,0.1,0.1,0.1,0.1,0.05],
  [-0.05,0,0,  0,  0,  0,  0,  -0.05],
  [-0.05,0,0,  0,  0,  0,  0,  -0.05],
  [-0.05,0,0,  0,  0,  0,  0,  -0.05],
  [-0.05,0,0,  0,  0,  0,  0,  -0.05],
  [-0.05,0,0,  0,  0,  0,  0,  -0.05],
  [0,  0,  0,  0.05,0.05,0,  0,  0],
];

const PST_QUEEN: number[][] = [
  [-0.2,-0.1,-0.1,-0.05,-0.05,-0.1,-0.1,-0.2],
  [-0.1,0,  0,  0,  0,  0,  0,  -0.1],
  [-0.1,0,  0.05,0.05,0.05,0.05,0,  -0.1],
  [-0.05,0,0.05,0.05,0.05,0.05,0,  -0.05],
  [0,  0,  0.05,0.05,0.05,0.05,0,  -0.05],
  [-0.1,0.05,0.05,0.05,0.05,0.05,0,  -0.1],
  [-0.1,0,  0.05,0,  0,  0,  0,  -0.1],
  [-0.2,-0.1,-0.1,-0.05,-0.05,-0.1,-0.1,-0.2],
];

const PST_KING_MID: number[][] = [
  [-0.3,-0.4,-0.4,-0.5,-0.5,-0.4,-0.4,-0.3],
  [-0.3,-0.4,-0.4,-0.5,-0.5,-0.4,-0.4,-0.3],
  [-0.3,-0.4,-0.4,-0.5,-0.5,-0.4,-0.4,-0.3],
  [-0.3,-0.4,-0.4,-0.5,-0.5,-0.4,-0.4,-0.3],
  [-0.2,-0.3,-0.3,-0.4,-0.4,-0.3,-0.3,-0.2],
  [-0.1,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.1],
  [0.2,0.2,0,  0,  0,  0,  0.2,0.2],
  [0.2,0.3,0.1,0,  0,  0.1,0.3,0.2],
];

const PST_MAP: Partial<Record<PieceSymbol, number[][]>> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING_MID,
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

function evaluateBoard(chess: Chess): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = `${FILES[col]}${RANKS[row]}` as Square;
      const piece = chess.get(square);
      if (!piece) continue;

      const material = PIECE_VALUES[piece.type];
      const pst = PST_MAP[piece.type];
      const positional = pst
        ? piece.color === 'w'
          ? pst[row][col]
          : pst[7 - row][col]
        : 0;

      const value = material + positional;
      score += piece.color === 'w' ? value : -value;
    }
  }

  const moves = chess.moves({ verbose: true });
  const mobilityBonus = moves.length * 0.01;
  score += chess.turn() === 'w' ? mobilityBonus : -mobilityBonus;

  if (chess.isCheck()) {
    score += chess.turn() === 'w' ? -0.3 : 0.3;
  }

  return score;
}

function scoreMove(chess: Chess, move: Move): number {
  let score = 0;

  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured as PieceSymbol] ?? 0;
    const attackerVal = PIECE_VALUES[move.piece as PieceSymbol] ?? 0;
    score += 10 * victimVal - attackerVal;
  }

  if (move.promotion) {
    score += PIECE_VALUES[move.promotion as PieceSymbol] ?? 0;
  }

  if (move.san.includes('+')) {
    score += 2;
  }

  return score;
}

function searchPosition(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return maximizing ? -999 : 999;
    }
    if (chess.isDraw() || chess.isStalemate()) {
      return 0;
    }
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  moves.sort((a, b) => scoreMove(chess, b) - scoreMove(chess, a));

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const eval_ = searchPosition(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const eval_ = searchPosition(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

const DEPTH_MAP: Record<number, number> = {
  10: 2,
  15: 3,
  20: 4,
};

export async function analyzePosition(
  fen: string,
  depth: number = 15
): Promise<AnalysisResult> {
  const chess = new Chess(fen);
  const isWhiteTurn = chess.turn() === 'w';
  const searchDepth = DEPTH_MAP[depth] ?? 3;

  if (chess.isCheckmate()) {
    return {
      evaluation: 0,
      mate: isWhiteTurn ? -0 : 0,
      bestMoves: [],
      depth: searchDepth,
    };
  }

  if (chess.isGameOver()) {
    return { evaluation: 0, mate: null, bestMoves: [], depth: searchDepth };
  }

  const moves = chess.moves({ verbose: true });
  moves.sort((a, b) => scoreMove(chess, b) - scoreMove(chess, a));

  const scored: { move: Move; eval_: number }[] = [];

  for (const move of moves) {
    chess.move(move);
    const eval_ = searchPosition(
      chess,
      searchDepth - 1,
      -Infinity,
      Infinity,
      !isWhiteTurn
    );
    chess.undo();
    scored.push({ move, eval_: eval_ });
  }

  scored.sort((a, b) =>
    isWhiteTurn ? b.eval_ - a.eval_ : a.eval_ - b.eval_
  );

  const bestMoves: AnalysisMove[] = scored.slice(0, 3).map((entry) => {
    const mate =
      entry.eval_ >= 900
        ? Math.ceil((searchDepth - entry.eval_ + 999) / 2) || 1
        : entry.eval_ <= -900
          ? -(Math.ceil((searchDepth + entry.eval_ + 999) / 2) || 1)
          : null;

    return {
      san: entry.move.san,
      uci: `${entry.move.from}${entry.move.to}${entry.move.promotion ?? ''}`,
      score: Math.round(entry.eval_ * 10) / 10,
      mate,
    };
  });

  const topMove = bestMoves[0];

  return {
    evaluation: topMove?.score ?? 0,
    mate: topMove?.mate ?? null,
    bestMoves,
    depth: searchDepth,
  };
}

export function formatScore(evaluation: number, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`;
  }
  const sign = evaluation >= 0 ? '+' : '';
  return `${sign}${evaluation.toFixed(1)}`;
}
