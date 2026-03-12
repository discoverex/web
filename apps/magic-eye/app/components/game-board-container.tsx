import React from "react";
import { AnswerOption, ImageData } from "@/app/types";
import { useAiHint } from "@/app/hooks/use-ai-hint";
import { GameBoardEmptyView } from "./views/game-board-empty-view";
import { GameBoardHeaderView } from "./views/game-board-header-view";
import { GameBoardContentView } from "./views/game-board-content-view";
import { GameBoardFooterView } from "./views/game-board-footer-view";

interface GameBoardContainerProps {
  selectedImageData: ImageData | null;
  answers: AnswerOption[];
  onClose: () => void;
  onAnswerClick?: (id: string) => void;
  onRestart?: () => void;
}

export const GameBoardContainer: React.FC<GameBoardContainerProps> = ({
  selectedImageData,
  answers,
  onClose,
  onAnswerClick,
  onRestart,
}) => {
  const { aiLoading, aiHint, error, aiLevel, setAiLevel, getAiHint } =
    useAiHint(selectedImageData?.url);

  if (!selectedImageData) {
    return <GameBoardEmptyView onRestart={onRestart} />;
  }

  return (
    <section className="lg:col-span-full bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[700px] relative overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <GameBoardHeaderView
          fileName={selectedImageData.name.split("/").pop() || ""}
          error={error}
          aiLevel={aiLevel}
          aiLoading={aiLoading}
          onAiLevelChange={setAiLevel}
          onGetAiHint={getAiHint}
          onClose={onClose}
        />

        <GameBoardContentView
          imageUrl={selectedImageData.url}
          aiHint={aiHint}
          aiLevel={aiLevel}
          answers={answers}
          onAnswerClick={onAnswerClick}
        />
      </div>
    </section>
  );
};
