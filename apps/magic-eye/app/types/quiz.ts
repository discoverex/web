export interface QuizCandidate {
  id: number;
  asset_id: string;
  display_name: string;
  problem_url: string;
  answer_url: string;
}

export interface CorrectAnswer {
  id: number;
  asset_id: string;
  description: string;
}

export interface QuizData {
  candidates: QuizCandidate[];
  correct_answer: CorrectAnswer;
}

export interface QuizResponse {
  status: string;
  data: QuizData;
}
