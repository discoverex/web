import { useState, useEffect } from 'react';
import { AiHint, QuizCandidate } from '@/app/types';
import { fetchAiHint } from '@/app/utils/get-ai-hint';

// 레벨에 따른 오답 확률을 계산하는 람다 함수
const getErrorRate = (level: number): number => {
  if (level >= 10) return 0; // 10레벨은 특수 경우: 오답 확률 0% (항상 정답)
  return (10 - level) / 10; // 1레벨: 0.9, 5레벨: 0.5, 9레벨: 0.1
};

export const useAiHint = (imageUrl?: string) => {
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiHint, setAiHint] = useState<AiHint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiLevel, setAiLevel] = useState<number>(5);

  // 이미지 URL이 변경되면 힌트와 에러 초기화
  useEffect(() => {
    setAiHint(null);
    setError(null);
  }, [imageUrl]);

  const getAiHint = async (candidates: QuizCandidate[], correctAnswerId: number) => {
    if (!imageUrl) return;

    setAiLoading(true);
    setAiHint(null);
    setError(null);
    try {
      const hint = await fetchAiHint({
        imageUrl,
        level: aiLevel,
      });

      const errorRate = getErrorRate(aiLevel);
      const shouldLie = Math.random() < errorRate;

      if (shouldLie) {
        // 오답 중 하나를 랜덤하게 골라 힌트로 제공
        const wrongCandidates = candidates.filter((c) => c.id !== correctAnswerId);
        if (wrongCandidates.length > 0) {
          const randomWrong = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];
          setAiHint({
            label: randomWrong.display_name,
            score: 0.95, // 뻔뻔하게 높은 확신도
          });
        } else {
          setAiHint(hint);
        }
      } else {
        setAiHint(hint);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 분석 중 에러가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  return {
    aiLoading,
    aiHint,
    error,
    aiLevel,
    setAiLevel,
    getAiHint,
  };
};
