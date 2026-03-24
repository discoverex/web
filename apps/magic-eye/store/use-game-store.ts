import { create } from 'zustand';

export type GameStatus = 'idle' | 'playing' | 'finished';

interface GameState {
  game_id: string | null;
  game_type: string;
  score: number;
  gameStatus: GameStatus;
  startGame: () => void;
  incrementScore: (amount: number) => void;
  addBonusScore: (points: number) => void;
  deductScore: (points: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  game_id: null,
  game_type: 'magic-eye',
  score: 0,
  gameStatus: 'idle',
  startGame: () =>
    set({
      game_id: globalThis.crypto.randomUUID(),
      gameStatus: 'playing',
    }),
  incrementScore: (amount) => set((state) => ({ score: state.score + amount })),
  addBonusScore: (points) => set((state) => ({ score: state.score + points })),
  deductScore: (points) => set((state) => ({ score: Math.max(0, state.score - points) })),
  resetGame: () =>
    set({
      game_id: null,
      score: 0,
      gameStatus: 'idle',
    }),
}));
