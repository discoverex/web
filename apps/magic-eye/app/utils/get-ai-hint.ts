import { AiHint } from "@/app/types";

export interface GetAiHintParams {
  imageUrl: string;
  level: number;
}

export const fetchAiHint = async ({
  imageUrl,
  level,
}: GetAiHintParams): Promise<AiHint> => {
  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        level,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || "서버로부터 AI 분석 결과를 가져오지 못했습니다.",
      );
    }

    const result = await response.json();

    if (Array.isArray(result) && result.length > 0) {
      const topResult = result[0];
      return {
        label: topResult.label,
        score: topResult.score,
      };
    } else {
      throw new Error("AI 분석 결과를 가져올 수 없습니다.");
    }
  } catch (err) {
    console.error("AI 훈수 실패:", err);
    throw err instanceof Error ? err : new Error("AI 분석 중 에러가 발생했습니다.");
  }
};
