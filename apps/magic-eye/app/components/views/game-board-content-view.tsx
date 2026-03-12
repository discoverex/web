import React from "react";
import { AiHint, QuizCandidate } from "@/app/types";
import { MovingAnswerOptions } from "../moving-answer-options";

interface GameBoardContentViewProps {
  imageUrl: string;
  aiHint: AiHint | null;
  aiLevel: number;
  candidates: QuizCandidate[];
  onAnswerClick?: (id: string) => void;
  wrongAnswerId?: string | null;
}

export const GameBoardContentView: React.FC<GameBoardContentViewProps> = ({
  imageUrl,
  aiHint,
  aiLevel,
  candidates,
  onAnswerClick,
  wrongAnswerId,
}) => {
  return (
    <div className="relative flex-grow border-8 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group flex justify-center items-center bg-zinc-200 dark:bg-zinc-950 shadow-inner min-h-[600px]">
      {aiHint && (
        <div className="absolute top-10 right-10 z-30 flex items-end gap-3 animate-hint">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-2xl border-2 border-purple-500 max-w-xs relative">
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {`"레벨 ${aiLevel} 모델로 분석한 결과야! 여기 `}
              <span className="underline decoration-2 decoration-purple-300 font-black text-lg">
                {`'${aiHint.label}'`}
              </span>
              {` 모양이 있는 것 같아."`}
            </p>
            <p className="text-[10px] mt-2 opacity-50 font-mono text-right">
              모델: ai_lv{aiLevel}.onnx
            </p>
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white dark:bg-zinc-800 border-r-2 border-b-2 border-purple-500 rotate-45" />
          </div>
          <div className="text-4xl filter drop-shadow-lg">🦖</div>
        </div>
      )}

      <MovingAnswerOptions
        candidates={candidates}
        onAnswerClick={onAnswerClick}
        wrongAnswerId={wrongAnswerId}
      />

      <div className="relative w-full h-full min-h-[600px] flex items-center justify-center p-4 pointer-events-none select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Magic Eye Problem"
          draggable={false}
          className="max-w-full max-h-full object-contain z-10 shadow-lg rounded-lg"
          style={{ 
            imageRendering: 'auto',
            width: 'auto',
            height: 'auto',
            display: 'block'
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors z-0" />
    </div>
  );
};
