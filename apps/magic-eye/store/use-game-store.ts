import { create } from 'zustand'

export type GameStatus = 'idle' | 'playing' | 'finished'

interface GameState {
  game_id: string | null
  game_type: string
  score: number
  gameStatus: GameStatus
  startGame: () => void
  incrementScore: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set) => ({
  game_id: null,
  game_type: 'magic-eye',
  score: 0,
  gameStatus: 'idle',
  startGame: () => set({
    game_id: globalThis.crypto.randomUUID(),
    score: 0,
    gameStatus: 'playing'
  }),
  incrementScore: () => set((state) => ({ score: state.score + 1 })),
  resetGame: () => set({
    game_id: null,
    score: 0,
    gameStatus: 'idle'
  }),
}))
