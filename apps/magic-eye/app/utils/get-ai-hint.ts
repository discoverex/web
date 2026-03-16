import { AiHint } from "@/app/types";
import { onnxManager } from "./onnx-manager";
import { preprocessImage, softmax } from "./image-utils";
import { ASSETS_LABELS } from "@/consts/ASSETS_LABELS";

export interface GetAiHintParams {
  imageUrl: string;
  level: number;
}

/**
 * [CLIENT-SIDE] 이미지를 분석하여 AI 훈수 결과를 반환합니다.
 */
export const fetchAiHint = async ({
  imageUrl,
  level,
}: GetAiHintParams): Promise<AiHint> => {
  try {
    console.log(`[CLIENT-SIDE] AI 분석 시작 (Level: ${level})`);
    
    // 1. 이미지 전처리 (Canvas 이용)
    const inputTensorData = await preprocessImage(imageUrl);

    // 2. Web Worker를 통한 ONNX 추론 (WebGPU/WASM)
    const outputData = await onnxManager.predict(inputTensorData, level);

    // 3. 결과 후처리 (Softmax 및 레이블 매핑)
    const probabilities = softmax(outputData);
    
    // 가장 높은 확률을 가진 결과 찾기
    let maxScore = -1;
    let maxIndex = -1;
    
    probabilities.forEach((score, index) => {
      if (score > maxScore) {
        maxScore = score;
        maxIndex = index;
      }
    });

    if (maxIndex !== -1) {
      const label = ASSETS_LABELS[maxIndex] || "알 수 없음";
      console.log(`[CLIENT-SIDE] 분석 완료: ${label} (${(maxScore * 100).toFixed(2)}%)`);
      
      return {
        label: label,
        score: maxScore,
      };
    } else {
      throw new Error("AI 분석 결과를 처리할 수 없습니다.");
    }

  } catch (err) {
    console.error("[CLIENT-SIDE] AI 훈수 실패:", err);
    throw err instanceof Error ? err : new Error("AI 분석 중 에러가 발생했습니다.");
  }
};
