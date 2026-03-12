import { QuizResponse, QuizCandidate } from "@/app/types/quiz";
import { ImageData } from "@/app/types/image-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export const quizService = {
  async fetchQuiz(count: number): Promise<{
    candidates: QuizCandidate[];
    correctAnswerId: number;
    selectedImageData: ImageData;
  }> {
    const response = await fetch(`${API_BASE_URL}/magic-eye/quiz?count=${count}`);
    
    if (!response.ok) {
      throw new Error("퀴즈 데이터를 가져오는데 실패했습니다.");
    }

    const responseData: QuizResponse = await response.json();
    const quizData = responseData.data;

    if (!quizData || !quizData.candidates || quizData.candidates.length === 0) {
      throw new Error("유효한 퀴즈 데이터가 없습니다.");
    }

    // 실제 정답(correct_answer.id)에 해당하는 후보를 찾아 해당 문제 이미지를 설정
    const correctCandidate = quizData.candidates.find(
      (c) => c.id === quizData.correct_answer.id
    ) || quizData.candidates[0];

    return {
      candidates: quizData.candidates,
      correctAnswerId: quizData.correct_answer.id,
      selectedImageData: {
        name: correctCandidate.display_name,
        url: correctCandidate.problem_url,
      }
    };
  }
};
