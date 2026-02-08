import { Chess } from 'chess.js';

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

function uciToSan(fen: string, uciMove: string): string {
  const chess = new Chess(fen);
  const from = uciMove.substring(0, 2);
  const to = uciMove.substring(2, 4);
  const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

  const move = chess.move({ from, to, promotion });
  return move ? move.san : uciMove;
}

class StockfishEngine {
  private worker: Worker | null = null;
  private resolveReady: (() => void) | null = null;
  private currentResolve: ((result: AnalysisResult) => void) | null = null;
  private currentReject: ((error: Error) => void) | null = null;
  private currentFen: string = '';
  private collectedMoves: Map<string, { score: number; mate: number | null }> =
    new Map();
  private lastDepth: number = 0;
  private targetDepth: number = 15;

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise<void>((resolve, reject) => {
      try {
        this.worker = new Worker(
          new URL('../assets/stockfish.js', import.meta.url)
        );
        this.resolveReady = resolve;
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = (e) => {
          reject(new Error(`Stockfish failed to load: ${e.message}`));
        };
        this.sendCommand('uci');
      } catch (e) {
        reject(
          new Error(
            'Stockfish engine not available. Analysis requires the stockfish.js worker.'
          )
        );
      }
    });
  }

  private sendCommand(cmd: string): void {
    this.worker?.postMessage(cmd);
  }

  private handleMessage(event: MessageEvent): void {
    const line = typeof event.data === 'string' ? event.data : '';

    if (line === 'uciok' && this.resolveReady) {
      this.sendCommand('isready');
      return;
    }

    if (line === 'readyok' && this.resolveReady) {
      this.resolveReady();
      this.resolveReady = null;
      return;
    }

    if (line.startsWith('info') && line.includes('multipv')) {
      this.parseInfoLine(line);
    }

    if (line.startsWith('bestmove') && this.currentResolve) {
      const bestMoves: AnalysisMove[] = [];
      const sorted = [...this.collectedMoves.entries()].sort(
        (a, b) => b[1].score - a[1].score
      );

      for (const [uci, data] of sorted.slice(0, 3)) {
        bestMoves.push({
          uci,
          san: uciToSan(this.currentFen, uci),
          score: data.score,
          mate: data.mate,
        });
      }

      const topMove = bestMoves[0];
      this.currentResolve({
        evaluation: topMove?.score ?? 0,
        mate: topMove?.mate ?? null,
        bestMoves,
        depth: this.lastDepth,
      });
      this.currentResolve = null;
      this.currentReject = null;
    }
  }

  private parseInfoLine(line: string): void {
    const depthMatch = line.match(/\bdepth (\d+)/);
    const pvMatch = line.match(/\bmultipv (\d+)/);
    const scoreMatch = line.match(/\bscore (cp|mate) (-?\d+)/);
    const movesMatch = line.match(/\bpv (.+)/);

    if (!depthMatch || !pvMatch || !scoreMatch || !movesMatch) return;

    const depth = parseInt(depthMatch[1], 10);
    const scoreType = scoreMatch[1];
    const scoreValue = parseInt(scoreMatch[2], 10);
    const firstMove = movesMatch[1].split(' ')[0];

    this.lastDepth = depth;

    const score = scoreType === 'mate' ? 0 : scoreValue / 100;
    const mate = scoreType === 'mate' ? scoreValue : null;

    if (depth >= this.targetDepth - 2) {
      this.collectedMoves.set(firstMove, { score, mate });
    }
  }

  async analyze(fen: string, depth: number = 15): Promise<AnalysisResult> {
    if (!this.worker) {
      await this.init();
    }

    return new Promise<AnalysisResult>((resolve, reject) => {
      this.currentResolve = resolve;
      this.currentReject = reject;
      this.currentFen = fen;
      this.collectedMoves.clear();
      this.lastDepth = 0;
      this.targetDepth = depth;

      this.sendCommand('stop');
      this.sendCommand('ucinewgame');
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand('setoption name MultiPV value 3');
      this.sendCommand(`go depth ${depth}`);

      setTimeout(() => {
        if (this.currentReject) {
          this.currentReject(
            new Error('Analysis timed out. Try a lower depth.')
          );
          this.currentResolve = null;
          this.currentReject = null;
        }
      }, 30000);
    });
  }

  destroy(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}

let engineInstance: StockfishEngine | null = null;

export function getEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngine();
  }
  return engineInstance;
}

export async function analyzePosition(
  fen: string,
  depth: number = 15
): Promise<AnalysisResult> {
  const engine = getEngine();
  return engine.analyze(fen, depth);
}

export function formatScore(evaluation: number, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`;
  }
  const sign = evaluation >= 0 ? '+' : '';
  return `${sign}${evaluation.toFixed(1)}`;
}
