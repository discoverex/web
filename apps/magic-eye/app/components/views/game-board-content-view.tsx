import React, { useEffect, useState } from 'react';
import { AiHint, QuizCandidate } from '@/app/types';
import { MovingAnswerOptions } from '../moving-answer-options';

interface GameBoardContentViewProps {
  imageUrl: string;
  aiHint: AiHint | null;
  aiLevel: number;
  candidates: QuizCandidate[];
  onAnswerClick?: (id: string) => void;
  wrongAnswerId?: string | null;
  correctAnswerId?: number | null;
  isCorrect?: boolean;
}

const HINT_MESSAGES = [
  (label: string) => `음~ 내가 보기엔 분명히 '${label}'인데? 한 번 잘 찾아봐!`,
  (label: string) => `공룡의 직감으로 말해주지. 이건 '${label}'이야!`,
  (label: string) => `힌트 줄까? 저기 어딘가에 '${label}'이 숨어있어!`,
  (label: string) => `내가 보기엔 저건 '${label}'이라네.`,
  (label: string) => `슬쩍 봤는데 '${label}' 모양이 보이더라고!`,
];

const FAIL_MESSAGES = [
  () => '어라... 이게 아닌가? 내 눈이 침침한가 봐!',
  () => '미안! 방금 건 연습이었어. 진짜야!',
  () => '으악! 누가 내 안경 좀 가져다줘!',
  () => '허걱, 이게 틀리다니... 난 이만 가볼게!',
  () => '앗, 저기 옆집 공룡이 불러서 가봐야겠어. 안녕!',
];

const NAG_MESSAGES = [
  (label: string) => `거봐! 내가 '${label}'이라고 했잖아. 내 말 좀 들어보라고!`,
  (label: string) => `아니라니까~ 분명히 '${label}'이라구! 다시 잘 봐봐.`,
  (label: string) => `내 힌트는 무시하는 거야? '${label}'이라니까!`,
  (label: string) => `음... 내 눈엔 아직도 '${label}'인데? 왜 딴 걸 눌러?`,
  (label: string) => `다시 말해줄게. 내 직감은 '${label}'이야!`,
];

const SURPRISED_MESSAGES = [
  (label: string, actual: string) => `헐! 이게 '${actual}'이었다고? 난 당연히 '${label}'인 줄 알았는데...`,
  (label: string, actual: string) => `어라? 분명 '${label}' 같았는데 '${actual}'이었네! 내 눈이 정말 어떻게 됐나 봐.`,
  (label: string, actual: string) => `말도 안 돼! 이게 '${actual}'이라니... '${label}'이 아니었단 말이야?`,
  (label: string, actual: string) => `허걱, '${actual}'이었구나! 난 정말 '${label}'인 줄로만 알았어. 미안!`,
  (label: string, actual: string) => `앗... 내 정체가 들통나겠는걸? '${label}'인 줄 알았는데 '${actual}'이었네!`,
];

export const GameBoardContentView: React.FC<GameBoardContentViewProps> = ({
  imageUrl,
  aiHint,
  aiLevel,
  candidates,
  onAnswerClick,
  wrongAnswerId,
  correctAnswerId,
  isCorrect,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [duration, setDuration] = useState(5000);

  // 이벤트 중복 방지 및 타이머 관리를 위한 ref
  const lastEventRef = useRef<string>("");
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 공룡 자동 퇴장 타이머 통합 관리
  useEffect(() => {
    if (showHint && !isExiting) {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      
      exitTimerRef.current = setTimeout(() => {
        setIsExiting(true);
      }, duration);

      return () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      };
    }
  }, [showHint, isExiting, duration, currentMessage]);

  // 퇴장 애니메이션 종료 후 제거
  useEffect(() => {
    if (isExiting) {
      const removeTimer = setTimeout(() => {
        setShowHint(false);
        setIsExiting(false);
      }, 600);

      return () => clearTimeout(removeTimer);
    }
  }, [isExiting]);

  // 새로운 힌트가 들어오면 표시
  useEffect(() => {
    if (aiHint && !isCorrect) {
      const eventKey = `HINT_${aiHint.label}`;
      if (lastEventRef.current === eventKey) return;
      
      const randomTemplate = HINT_MESSAGES[Math.floor(Math.random() * HINT_MESSAGES.length)];
      setCurrentMessage(randomTemplate(aiHint.label));
      setDuration(5000);
      setShowHint(true);
      setIsExiting(false);
      lastEventRef.current = eventKey;
    }
  }, [aiHint, isCorrect]);

  // 정답을 맞혔을 때 반응
  useEffect(() => {
    if (isCorrect && aiHint && correctAnswerId !== null) {
      const eventKey = `CORRECT_${correctAnswerId}_${aiHint.label}`;
      if (lastEventRef.current === eventKey) return;

      const correctAnswer = candidates.find(c => c.id === correctAnswerId);
      if (correctAnswer && aiHint.label !== correctAnswer.display_name) {
        const randomSurprised = SURPRISED_MESSAGES[Math.floor(Math.random() * SURPRISED_MESSAGES.length)];
        setCurrentMessage(randomSurprised(aiHint.label, correctAnswer.display_name));
        setDuration(4000);
        setShowHint(true);
        setIsExiting(false);
      }
      lastEventRef.current = eventKey;
    }
  }, [isCorrect, aiHint, correctAnswerId, candidates]);

  // 유저가 오답을 클릭했을 때의 반응
  useEffect(() => {
    if (wrongAnswerId && aiHint && !isCorrect) {
      const eventKey = `WRONG_${wrongAnswerId}_${aiHint.label}`;
      if (lastEventRef.current === eventKey) return;

      const clickedCandidate = candidates.find(c => c.id.toString() === wrongAnswerId);
      if (!clickedCandidate) return;

      const isDinoAnswer = clickedCandidate.display_name === aiHint.label;

      if (!showHint || isExiting) {
        if (isDinoAnswer) {
          const randomFail = FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];
          setCurrentMessage(randomFail());
          setDuration(2000);
        } else {
          const randomNag = NAG_MESSAGES[Math.floor(Math.random() * NAG_MESSAGES.length)];
          setCurrentMessage(randomNag(aiHint.label));
          setDuration(3000);
        }
        setShowHint(true);
        setIsExiting(false);
      } else if (isDinoAnswer) {
        const randomFail = FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];
        setCurrentMessage(randomFail());
        setDuration(1500);
      }
      lastEventRef.current = eventKey;
    }
  }, [wrongAnswerId, aiHint, candidates, showHint, isExiting, isCorrect]);

  return (
    <div className="relative flex-grow border-8 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group flex justify-center items-center bg-zinc-200 dark:bg-zinc-950 shadow-inner min-h-[500px]">
      {aiHint && showHint && (
        <div
          className={`absolute top-10 right-10 z-[60] flex items-end gap-3 ${isExiting ? 'animate-exit-right' : 'animate-hint'}`}
        >
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-2xl border-2 border-purple-500 max-w-xs relative">
            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{`"${currentMessage}"`}</p>
            <p className="text-[10px] mt-2 opacity-50 font-mono text-right">모델: ai_lv{aiLevel}.onnx</p>
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white dark:bg-zinc-800 border-r-2 border-b-2 border-purple-500 rotate-45" />
          </div>
          <div className="text-4xl filter drop-shadow-lg">🦖</div>
        </div>
      )}

      {/* 정답 축하 오버레이 */}
      {isCorrect && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-500/90 backdrop-blur-sm animate-in zoom-in duration-300 pointer-events-none">
          <div className="text-9xl mb-8">🎉</div>
          <h2 className="text-6xl font-black text-white tracking-tighter text-center px-4">정답입니다!</h2>
        </div>
      )}

      <MovingAnswerOptions candidates={candidates} onAnswerClick={onAnswerClick} wrongAnswerId={wrongAnswerId} />

      <div className="relative w-full h-full min-h-[500px] flex items-center justify-center p-4 pointer-events-none select-none">
        <img
          src={imageUrl}
          alt="Magic Eye Problem"
          draggable={false}
          className="max-w-full max-h-full object-contain z-10 shadow-lg rounded-lg"
          style={{
            imageRendering: 'auto',
            width: 'auto',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none group-hover:bg-black/5 transition-colors z-0" />
    </div>
  );
};
