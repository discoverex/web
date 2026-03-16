import React from 'react';
import { ImageData, QuizCandidate } from '@/app/types';
import { useAiHint } from '@/app/hooks/use-ai-hint';
import { GameBoardEmptyView } from './views/game-board-empty-view';
import { GameBoardHeaderView } from './views/game-board-header-view';
import { GameBoardContentView } from './views/game-board-content-view';

interface GameBoardContainerProps {
  selectedImageData: ImageData | null;
  candidates: QuizCandidate[];
  correctAnswerId: number | null;
  onClose: () => void;
  onAnswerClick?: (id: string) => void;
  onRestart?: () => void;
  wrongAnswerId?: string | null;
  isCorrect?: boolean;
}

export const GameBoardContainer: React.FC<GameBoardContainerProps> = ({
  selectedImageData,
  candidates,
  correctAnswerId,
  onClose,
  onAnswerClick,
  onRestart,
  wrongAnswerId,
  isCorrect,
}) => {
  const { aiLoading, aiHint, error, aiLevel, setAiLevel, getAiHint } = useAiHint(selectedImageData?.url);

  if (!selectedImageData) {
    return <GameBoardEmptyView onRestart={onRestart} />;
  }

  return (
    <section className="lg:col-span-full bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <GameBoardHeaderView
          fileName={selectedImageData.name.split('/').pop() || ''}
          error={error}
          aiLevel={aiLevel}
          aiLoading={aiLoading}
          onAiLevelChange={setAiLevel}
          onGetAiHint={() => {
            if (correctAnswerId !== null) {
              getAiHint(candidates, correctAnswerId);
            }
          }}
          onClose={onClose}
        />

        <GameBoardContentView
          imageUrl={selectedImageData.url}
          aiHint={aiHint}
          aiLevel={aiLevel}
          candidates={candidates}
          onAnswerClick={onAnswerClick}
          wrongAnswerId={wrongAnswerId}
          correctAnswerId={correctAnswerId}
          isCorrect={isCorrect}
        />
      </div>
    </section>
  );
};
