"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./game.css";

import { MagicEyeHeader } from "./components/header-controls";
import { GameBoardContainer } from "./components/game-board-container";
import { CATEGORIES } from "@/consts/CATEGORIES";
import { QuizResponse, QuizCandidate } from "@/app/types/quiz";
import { AnswerOption } from "@/app/types/answer-option";
import { ImageData } from "@/app/types/image-data";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export default function MagicEyeGame() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    CATEGORIES[0].id,
  );
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(
    null,
  );
  const [answers, setAnswers] = useState<AnswerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [correctAnswerId, setCorrectAnswerId] = useState<number | null>(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/magic-eye/quiz`);
      if (!response.ok) {
        throw new Error("퀴즈 데이터를 가져오는데 실패했습니다.");
      }
      const responseData: QuizResponse = await response.json();
      console.log("받은 퀴즈 데이터:", responseData);

      const quizData = responseData.data;

      // 데이터 구조 안전하게 확인
      if (quizData && quizData.candidates && quizData.candidates.length > 0) {
        const firstCandidate = quizData.candidates[0];
        setSelectedImageData({
          name: firstCandidate.display_name,
          url: firstCandidate.problem_url,
        });

        const mappedAnswers: AnswerOption[] = quizData.candidates.map((candidate) => ({
          id: candidate.id.toString(),
          label: candidate.display_name,
          imageUrl: candidate.answer_url,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          duration: 10 + Math.random() * 10,
          delay: -Math.random() * 20,
        }));
        setAnswers(mappedAnswers);
        setCorrectAnswerId(quizData.correct_answer.id);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (!selectedImageData || answers.length === 0) return;
    const moveInterval = setInterval(() => {
      setAnswers((prevAnswers) =>
        prevAnswers.map((ans) => ({
          ...ans,
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        })),
      );
    }, 5000);
    return () => clearInterval(moveInterval);
  }, [selectedImageData, answers.length]);

  const handleAnswerClick = (ansId: string) => {
    if (parseInt(ansId) === correctAnswerId) {
      alert("정답입니다! 🎉");
      fetchQuiz(); // 다음 퀴즈로
    } else {
      alert("아쉬워요, 다시 한번 찾아보세요! 🦖");
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans bg-zinc-50 dark:bg-black text-black dark:text-white">
      <MagicEyeHeader />

      <main className="max-w-[1600px] mx-auto">
        {loading && !selectedImageData ? (
          <div className="flex flex-col items-center justify-center min-h-[700px]">
            <div className="text-6xl animate-spin mb-8">🌀</div>
            <p className="text-xl font-bold">퀴즈를 불러오는 중입니다...</p>
          </div>
        ) : (
          <GameBoardContainer
            selectedImageData={selectedImageData}
            answers={answers}
            onClose={() => setSelectedImageData(null)}
            onAnswerClick={handleAnswerClick}
            onRestart={fetchQuiz}
          />
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-xl text-center">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
