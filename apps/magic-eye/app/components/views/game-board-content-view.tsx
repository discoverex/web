import React, { useState, useEffect } from "react";
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

const HINT_MESSAGES = [
  (label: string) => `음~ 내가 보기엔 분명히 '${label}'인데? 한 번 잘 찾아봐!`,
  (label: string) => `공룡의 직감으로 말해주지. 이건 '${label}'이야!`,
  (label: string) => `힌트 줄까? 저기 어딘가에 '${label}'이 숨어있어!`,
  (label: string, level: number) => `내가 보기엔 저건 '${label}'이라네.`,
  (label: string) => `슬쩍 봤는데 '${label}' 모양이 보이더라고!`,
];

export const GameBoardContentView: React.FC<GameBoardContentViewProps> = ({
  imageUrl,
  aiHint,
  aiLevel,
  candidates,
  onAnswerClick,
  wrongAnswerId,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // 새로운 힌트가 들어오면 표시 및 랜덤 메시지 선택
  useEffect(() => {
    if (aiHint) {
      const randomTemplate = HINT_MESSAGES[Math.floor(Math.random() * HINT_MESSAGES.length)];
      setCurrentMessage(randomTemplate(aiHint.label, aiLevel));

      setShowHint(true);
      setIsExiting(false);

      // 5초 후 퇴장 애니메이션 시작
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 5000);

      // 5.6초 후 (애니메이션 종료 시점) 완전히 제거
      const removeTimer = setTimeout(() => {
        setShowHint(false);
      }, 5600);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [aiHint, aiLevel]);

  return (
    <div className="relative flex-grow border-8 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group flex justify-center items-center bg-zinc-200 dark:bg-zinc-950 shadow-inner min-h-[600px]">
      {aiHint && showHint && (
        <div className={`absolute top-10 right-10 z-30 flex items-end gap-3 ${isExiting ? "animate-exit-right" : "animate-hint"}`}>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-2xl border-2 border-purple-500 max-w-xs relative">
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {`"${currentMessage}"`}
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
