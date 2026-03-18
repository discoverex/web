'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { QuizCandidate } from '@/app/types/quiz';
import { AnswerOption } from '@/app/types/answer-option';

interface MovingAnswerOptionsProps {
  candidates: QuizCandidate[];
  onAnswerClick?: (id: string) => void;
  wrongAnswerId?: string | null;
  isCorrect?: boolean;
}

export const MovingAnswerOptions: React.FC<MovingAnswerOptionsProps> = ({
  candidates,
  onAnswerClick,
  wrongAnswerId,
  isCorrect,
}) => {
  const [answers, setAnswers] = useState<AnswerOption[]>([]);
  const [avoidanceEnabled, setAvoidanceEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  // Initialize and update when candidates change
  useEffect(() => {
    if (!candidates || candidates.length === 0) {
      setAnswers([]);
      return;
    }

    const initialAnswers: AnswerOption[] = candidates.map((candidate) => ({
      id: candidate.id.toString(),
      label: candidate.display_name,
      imageUrl: candidate.answer_url,
      x: Math.random() * 60 + 20,
      y: Math.random() * 60 + 20,
      duration: 10 + Math.random() * 10,
      delay: -Math.random() * 20,
    }));
    setAnswers(initialAnswers);
  }, [candidates]);

  // Avoidance toggle logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const toggle = () => {
      setAvoidanceEnabled((prev) => {
        const nextState = !prev;
        const nextInterval = nextState ? 8000 : 4000;
        timeoutId = setTimeout(toggle, nextInterval);
        return nextState;
      });
    };
    timeoutId = setTimeout(toggle, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Advanced Physics Engine (Evasion + Collision + Boundaries)
  useEffect(() => {
    // 오답 클릭 상태이면 물리 엔진 일시 정지 (하지만 Effect는 계속 유지하여 wrongAnswerId가 null이 될 때 즉시 재개)
    if (!!wrongAnswerId || answers.length === 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      // 오답 상태가 아닐 때만 루프를 돌게 함
      if (!!wrongAnswerId) return;
    }

    const updatePhysics = () => {
      if (!containerRef.current) {
        rafRef.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const { width, height } = rect;
      if (width === 0 || height === 0) return;

      setAnswers((current) => {
        let isMoving = false;
        const next = current.map((ans, idx) => {
          let forceX = 0;
          let forceY = 0;

          const curPxX = (ans.x / 100) * width;
          const curPxY = (ans.y / 100) * height;

          // 1. 마우스 회피
          if (avoidanceEnabled) {
            const mDx = curPxX - mousePosRef.current.x;
            const mDy = curPxY - mousePosRef.current.y;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
            const mThreshold = 250;

            if (mDist < mThreshold) {
              const mPower = Math.pow((mThreshold - mDist) / mThreshold, 2);
              forceX += (mDx / mDist) * mPower * 30;
              forceY += (mDy / mDist) * mPower * 30;
              isMoving = true;
            }
          }

          // 2. 상호 반발
          current.forEach((other, otherIdx) => {
            if (idx === otherIdx) return;
            const oPxX = (other.x / 100) * width;
            const oPxY = (other.y / 100) * height;
            const oDx = curPxX - oPxX;
            const oDy = curPxY - oPxY;
            const oDist = Math.sqrt(oDx * oDx + oDy * oDy);
            const oThreshold = 130;

            if (oDist < oThreshold) {
              const oPower = Math.pow((oThreshold - oDist) / oThreshold, 1.2);
              forceX += (oDx / (oDist || 1)) * oPower * 8;
              forceY += (oDy / (oDist || 1)) * oPower * 8;
              isMoving = true;
            }
          });

          // 3. 벽면 반발
          const margin = 12;
          if (ans.x < margin) forceX += (margin - ans.x) * 0.8;
          if (ans.x > 100 - margin) forceX -= (ans.x - (100 - margin)) * 0.8;
          if (ans.y < margin) forceY += (margin - ans.y) * 0.8;
          if (ans.y > 100 - margin) forceY -= (ans.y - (100 - margin)) * 0.8;

          if (forceX !== 0 || forceY !== 0) isMoving = true;

          let newX = ans.x + (forceX * 100) / width;
          let newY = ans.y + (forceY * 100) / height;

          newX = Math.max(2, Math.min(94, newX));
          newY = Math.max(2, Math.min(94, newY));

          return { ...ans, x: newX, y: newY };
        });

        return isMoving ? next : current;
      });

      rafRef.current = requestAnimationFrame(updatePhysics);
    };

    rafRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [avoidanceEnabled, wrongAnswerId, answers.length]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {answers.map((ans) => {
        const isWrong = ans.id === wrongAnswerId;

        return (
          <button
            key={ans.id}
            className={`absolute z-20 w-24 h-24 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border-4 overflow-hidden pointer-events-auto group/ans 
              ${isWrong ? 'border-red-500 animate-shake scale-110 z-30' : 'border-amber-500/50 hover:scale-110 hover:border-amber-500'}
              ${!wrongAnswerId && !isWrong ? 'animate-float' : ''}
            `}
            style={{
              left: `${ans.x}%`,
              top: `${ans.y}%`,
              // @ts-ignore
              '--float-duration': `${ans.duration}s`,
              '--float-delay': `${ans.delay}s`,
              transition: 'none',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onAnswerClick) onAnswerClick(ans.id);
            }}
          >
            {ans.imageUrl && (
              <Image
                src={ans.imageUrl}
                alt={ans.label}
                width={96}
                height={96}
                unoptimized
                priority
                className="object-cover w-full h-full"
                crossOrigin="anonymous"
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/ans:opacity-100 transition-opacity z-10">
              <span className="text-white text-[10px] font-bold px-1 text-center">{ans.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
