import { useCallback, useState } from 'react';
import { QuizCandidate } from '@/app/types/quiz';
import { ImageData } from '@/app/types/image-data';
import { quizService } from '../services/quiz-service';
import { useGameStore } from '@/store/use-game-store';

export function useQuiz() {
  const [candidateCount, setCandidateCount] = useState<number>(5);
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(null);
  const [candidates, setCandidates] = useState<QuizCandidate[]>([]);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [wrongAnswerId, setWrongAnswerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const incrementScore = useGameStore((state) => state.incrementScore);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWrongAnswerId(null);
    try {
      const data = await quizService.fetchQuiz(candidateCount);
      setCandidates(data.candidates);
      setCorrectAnswerId(data.correctAnswerId);
      setSelectedImageData(data.selectedImageData);
      setDescription(data.description);
      return true;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [candidateCount]);

  const handleAnswerClick = (ansId: string, onCorrect?: () => void) => {
    if (wrongAnswerId || correctAnswerId === null) return;

    if (parseInt(ansId) === correctAnswerId) {
      incrementScore();
      // 정답인 경우 콜백 실행 (외부에서 상태 제어용)
      if (onCorrect) onCorrect();
    } else {
      setWrongAnswerId(ansId);
      setTimeout(() => {
        setWrongAnswerId(null);
      }, 2000);
    }
  };

  const closeGame = () => {
    setSelectedImageData(null);
    setCandidates([]);
    setDescription('');
  };

  return {
    candidateCount,
    setCandidateCount,
    selectedImageData,
    candidates,
    correctAnswerId,
    description,
    loading,
    error,
    wrongAnswerId,
    fetchQuiz,
    handleAnswerClick,
    closeGame,
  };
}
