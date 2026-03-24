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
  description: string;
  onClose: () => void;
  onAnswerClick?: (id: string, bonus: number) => void;
  onRestart?: () => void;
  wrongAnswerId?: string | null;
  isCorrect?: boolean;
  isSubmitting?: boolean;
}

export const GameBoardContainer: React.FC<GameBoardContainerProps> = ({
  selectedImageData,
  candidates,
  correctAnswerId,
  description,
  onClose,
  onAnswerClick,
  onRestart,
  wrongAnswerId,
  isCorrect,
  isSubmitting,
}) => {
  const {
    aiLoading,
    aiHint,
    error,
    aiLevel,
    setAiLevel,
    getAiHint,
    wrongAnswerCount,
    witnessStatement,
    isWitnessVisible,
    incrementWrongAnswerCount,
    showWitnessStatement,
    insufficientPointsMsg,
  } = useAiHint(selectedImageData?.url);

  // 타이머 상태 (60초)
  const [timeLeft, setTimeLeft] = React.useState<number>(60);

  // 이미지가 바뀌면 타이머 리셋
  React.useEffect(() => {
    if (selectedImageData) {
      setTimeLeft(60);
    }
  }, [selectedImageData?.url]);

  // 타이머 작동 로직
  React.useEffect(() => {
    if (isCorrect || isSubmitting || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isCorrect, isSubmitting, timeLeft]);

  // 오답이 발생했을 때 카운트 증가
  React.useEffect(() => {
    if (wrongAnswerId) {
      incrementWrongAnswerCount();
    }
  }, [wrongAnswerId]);

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
          onRestart={onRestart}
          isCorrect={isCorrect}
          isSubmitting={isSubmitting}
          wrongAnswerCount={wrongAnswerCount}
          onGetWitnessStatement={() => showWitnessStatement(description)}
          timeLeft={timeLeft}
        />

        <GameBoardContentView
          imageUrl={selectedImageData.url}
          aiHint={aiHint}
          aiLevel={aiLevel}
          candidates={candidates}
          onAnswerClick={(id) => onAnswerClick?.(id, timeLeft * 10)}
          wrongAnswerId={wrongAnswerId}
          correctAnswerId={correctAnswerId}
          isCorrect={isCorrect}
          witnessStatement={witnessStatement}
          isWitnessVisible={isWitnessVisible}
          insufficientPointsMsg={insufficientPointsMsg}
          timeLeft={timeLeft}
        />
      </div>
    </section>
  );
};
