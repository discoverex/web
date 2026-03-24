import { useState, useEffect } from 'react';
import { AiHint, QuizCandidate } from '@/app/types';
import { fetchAiHint } from '@/app/utils/get-ai-hint';
import { useGameStore } from '@/store/use-game-store';

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
  const [insufficientPointsMsg, setInsufficientPointsMsg] = useState<string | null>(null);

  const { score, deductScore } = useGameStore();

  // 목격자 진술 관련 상태
  const [wrongAnswerCount, setWrongAnswerCount] = useState<number>(0);
  const [witnessStatement, setWitnessStatement] = useState<string | null>(null);
  const [isWitnessVisible, setIsWitnessVisible] = useState<boolean>(false);

  // 이미지 URL이 변경되면 힌트, 에러, 오답 횟수, 목격자 진술 초기화
  useEffect(() => {
    setAiHint(null);
    setError(null);
    setWrongAnswerCount(0);
    setWitnessStatement(null);
    setIsWitnessVisible(false);
    setInsufficientPointsMsg(null);
  }, [imageUrl]);

  const incrementWrongAnswerCount = () => {
    setWrongAnswerCount((prev) => prev + 1);
  };

  const showWitnessStatement = (description: string) => {
    if (!description) return;

    // '. ' 기준으로 문장을 구분해 배열화 (마지막 빈 문자열 제거를 위해 filter 사용)
    const sentences = description.split('. ').filter((s) => s.trim().length > 0);
    if (sentences.length === 0) return;

    // 랜덤하게 하나 선택 (문장 끝에 마침표 복원)
    const randomIndex = Math.floor(Math.random() * sentences.length);
    let randomSentence = sentences[randomIndex].trim();
    if (!randomSentence.endsWith('.')) {
      randomSentence += '.';
    }

    setWitnessStatement(randomSentence);
    setIsWitnessVisible(true);

    // 5초 후 자동으로 숨김
    setTimeout(() => {
      setIsWitnessVisible(false);
    }, 5000);
  };

  const getAiHint = async (candidates: QuizCandidate[], correctAnswerId: number) => {
    if (!imageUrl) return;

    // 점수 체크 (Lv1은 무료, Lv2부터 소모)
    const cost = aiLevel > 1 ? (aiLevel - 1) * 10 : 0;
    if (score < cost) {
      setInsufficientPointsMsg("나를 부르기엔 아직 내공이 부족하군! 점수를 더 쌓아오렴.");
      // 3초 후 메시지 초기화
      setTimeout(() => setInsufficientPointsMsg(null), 3000);
      return;
    }

    setAiLoading(true);
    setAiHint(null);
    setError(null);
    setInsufficientPointsMsg(null);
    
    try {
      // 실제 점수 차감
      if (cost > 0) {
        deductScore(cost);
      }

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
    wrongAnswerCount,
    witnessStatement,
    isWitnessVisible,
    incrementWrongAnswerCount,
    showWitnessStatement,
    insufficientPointsMsg,
  };
};
