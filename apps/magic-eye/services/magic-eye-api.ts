// services/magic-eye-api.ts

/**
 * 매직아이 AI 분석 응답 인터페이스
 */
export interface MagicEyeResponse {
  label: string;  // 분석된 사물 ID (예: "dinosaur", "heart")
  score: number;  // 분석 신뢰도 (0.0 ~ 1.0)
  level: number;  // 분석에 사용된 AI 플레이어 레벨 (1 ~ 10)
}

/**
 * 이미지 URL을 통해 허깅페이스 AI 모델에 매직아이 분석을 요청합니다.
 */
export async function queryMagicEyeByUrl(
  imageUrl: string, 
  aiLevel: number = 10
): Promise<MagicEyeResponse[]> {
  // .env 파일에 정의된 NEXT_PUBLIC_HF_TOKEN을 사용합니다.
  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
  const REPO_ID = process.env.NEXT_PUBLIC_HF_REPO_ID;

  // 최신 허깅페이스 인퍼런스 라우터 주소 사용
  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${REPO_ID}`, {
    headers: { 
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json" 
    },
    method: "POST",
    body: JSON.stringify({
      inputs: imageUrl, // 이미지 URL 직접 전달
      parameters: { level: aiLevel }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI 분석 API 에러:", errorText);
    throw new Error("AI 분석 요청에 실패했습니다.");
  }

  return await response.json();
}
