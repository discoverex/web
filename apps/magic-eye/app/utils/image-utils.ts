/**
 * 이미지를 224x224로 리사이징하고 ONNX 모델 입력용 Float32Array(CHW 레이아웃)로 변환합니다.
 */
export async function preprocessImage(imageUrl: string): Promise<Float32Array> {
  try {
    // 1. fetch를 통해 이미지 데이터 가져오기 (CORS 확인 가능)
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("이미지 접근 권한이 없습니다 (403 Forbidden). URL이 만료되었거나 서명이 잘못되었을 수 있습니다.");
      }
      throw new Error(`이미지 다운로드 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    
    // 2. 비트맵으로 변환 (브라우저 최적화 API 사용)
    const bitmap = await createImageBitmap(blob);

    // 3. Canvas를 이용한 리사이징
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      throw new Error("Canvas context 생성 실패");
    }

    // PyTorch/sharp의 bilinear 보간법과 유사하게 설정
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, 224, 224);

    const imageData = ctx.getImageData(0, 0, 224, 224);
    const { data } = imageData; // [R, G, B, A, R, G, B, A...]

    const float32Data = new Float32Array(3 * 224 * 224);

    // PyTorch 표준 정규화 값
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    // HWC -> CHW 레이아웃 변경 및 정규화
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < 224 * 224; i++) {
        const pixel = data[i * 4 + c] / 255.0;
        float32Data[c * 224 * 224 + i] = (pixel - mean[c]) / std[c];
      }
    }

    // 사용이 끝난 비트맵 자원 해제
    bitmap.close();

    return float32Data;
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      console.error("[CORS Error] GCS 버킷에 CORS 설정이 필요합니다.");
      throw new Error("이미지 로드 중 CORS 오류가 발생했습니다. 서버의 CORS 설정을 확인해주세요.");
    }
    throw err;
  }
}

/**
 * Logits을 Probabilities로 변환하는 Softmax 함수
 */
export function softmax(arr: Float32Array): number[] {
  const maxVal = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - maxVal));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return Array.from(exps.map((x) => x / sumExps));
}
