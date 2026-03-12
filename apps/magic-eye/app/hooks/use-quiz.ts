import { useState, useEffect, useCallback } from "react";
import { QuizCandidate } from "@/app/types/quiz";
import { ImageData } from "@/app/types/image-data";
import { quizService } from "../services/quiz-service";

export function useQuiz() {
  const [candidateCount, setCandidateCount] = useState<number>(5);
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(null);
  const [candidates, setCandidates] = useState<QuizCandidate[]>([]);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);
  const [wrongAnswerId, setWrongAnswerId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWrongAnswerId(null);
    try {
      const data = await quizService.fetchQuiz(candidateCount);
      setCandidates(data.candidates);
      setCorrectAnswerId(data.correctAnswerId);
      setSelectedImageData(data.selectedImageData);
      return true; // 성공 시 true 반환
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      return false; // 실패 시 false 반환
    } finally {
      setLoading(false);
    }
  }, [candidateCount]);

  const handleAnswerClick = (ansId: string) => {
    if (wrongAnswerId || correctAnswerId === null) return;

    if (parseInt(ansId) === correctAnswerId) {
      alert("정답입니다! 🎉");
      fetchQuiz();
    } else {
      setWrongAnswerId(ansId);
      // 2초 후 다시 움직임 재개
      setTimeout(() => {
        setWrongAnswerId(null);
      }, 2000);
    }
  };

  const closeGame = () => setSelectedImageData(null);

  return {
    candidateCount,
    setCandidateCount,
    selectedImageData,
    candidates,
    loading,
    error,
    wrongAnswerId,
    fetchQuiz,
    handleAnswerClick,
    closeGame,
  };
}
