import { useState, useEffect } from "react";
import { AiHint } from "@/app/types";
import { fetchAiHint } from "@/app/utils/get-ai-hint";

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

  const getAiHint = async () => {
    if (!imageUrl) return;

    setAiLoading(true);
    setAiHint(null);
    setError(null);
    try {
      const hint = await fetchAiHint({
        imageUrl,
        level: aiLevel,
      });
      setAiHint(hint);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "AI 분석 중 에러가 발생했습니다.",
      );
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
