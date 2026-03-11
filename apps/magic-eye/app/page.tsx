"use client";

import React, { useState, useEffect } from "react";
import "./game.css";

import { MagicEyeHeader, CategorySelector } from "./components/header-controls";
import { ImageSidebar } from "./components/image-sidebar";
import { GameBoardContainer } from "./components/game-board-container";
import { CATEGORIES } from "@/consts/CATEGORIES";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

interface ImageData {
  name: string;
  url: string;
}

interface AnswerOption {
  id: string;
  label: string;
  imageUrl?: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

export default function MagicEyeGame() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    CATEGORIES[0].id,
  );
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImageData, setSelectedImageData] = useState<ImageData | null>(
    null,
  );
  const [answers, setAnswers] = useState<AnswerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentCategoryLabel =
    CATEGORIES.find((c) => c.id === selectedCategoryId)?.label ||
    selectedCategoryId;

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      setSelectedImageData(null);

      try {
        const prefix = `magic-eye/${selectedCategoryId}`;
        const response = await fetch(
          `${API_BASE_URL}/media/images-list?prefix=${prefix}`,
        );

        if (!response.ok)
          throw new Error(
            `${currentCategoryLabel} 목록을 불러오는데 실패했습니다.`,
          );

        const json = await response.json();

        if (json.status === "success" && Array.isArray(json.data)) {
          const filtered = json.data.filter((item: ImageData) =>
            item.name.includes("prob"),
          );
          setImages(filtered);
        } else {
          setImages([]);
          if (json.status !== "success")
            throw new Error(
              json.message || "데이터를 가져오는데 실패했습니다.",
            );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "알 수 없는 에러가 발생했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [selectedCategoryId, currentCategoryLabel]);

  useEffect(() => {
    if (selectedImageData) {
      const labels = [
        currentCategoryLabel,
        "다른 것 1",
        "다른 것 2",
        "다른 것 3",
        "다른 것 4",
      ];
      const dummyAnswers = labels.map((label, i) => ({
        id: `ans-${i}`,
        label,
        imageUrl: `https://picsum.photos/seed/${label}/200`,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        duration: 10 + Math.random() * 10,
        delay: -Math.random() * 20,
      }));
      setAnswers(dummyAnswers);
    } else {
      setAnswers([]);
    }
  }, [selectedImageData, currentCategoryLabel]);

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

  return (
    <div className="min-h-screen p-8 font-sans bg-zinc-50 dark:bg-black text-black dark:text-white">
      <MagicEyeHeader />

      <CategorySelector
        categories={CATEGORIES}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
      />

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
        <ImageSidebar
          images={images}
          selectedImage={selectedImageData}
          loading={loading}
          error={error}
          onSelectImage={setSelectedImageData}
        />

        <GameBoardContainer
          selectedImageData={selectedImageData}
          answers={answers}
          onClose={() => setSelectedImageData(null)}
          selectedCategoryLabel={currentCategoryLabel}
        />
      </main>
    </div>
  );
}
