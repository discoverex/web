import * as ort from "onnxruntime-node";
import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import path from "path";
import os from "os";
import { ASSETS_LABELS } from "@/consts/ASSETS_LABELS";

export interface MagicEyeResponse {
  label: string;
  score: number;
  level: number;
}

const modelCache: Record<string, ort.InferenceSession> = {};

const storage = new Storage({
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON || "{}"),
});
const BUCKET_NAME = process.env.BUCKET_NAME || "discoverex-image-storage";

async function getModelSession(level: number): Promise<ort.InferenceSession> {
  const modelName = `ai_lv${level}.onnx`;
  const gcsPath = `models/onnx/${modelName}`;
  const localPath = path.join(os.tmpdir(), modelName);

  if (modelCache[modelName]) return modelCache[modelName];

  try {
    await storage
      .bucket(BUCKET_NAME)
      .file(gcsPath)
      .download({ destination: localPath });
    const session = await ort.InferenceSession.create(localPath);

    // 모델 정보 출력 (디버깅용)
    console.log(`[SERVER-SIDE] Model Loaded: ${modelName}`);
    console.log(`- Inputs: ${session.inputNames.join(", ")}`);
    console.log(`- Outputs: ${session.outputNames.join(", ")}`);

    modelCache[modelName] = session;
    return session;
  } catch (error) {
    console.error(`[SERVER-SIDE] Model load failed: ${modelName}`, error);
    throw new Error(`모델 ${modelName} 로드 실패`);
  }
}

async function preprocessImage(imageUrl: string): Promise<ort.Tensor> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  const { data } = await sharp(Buffer.from(buffer))
    .resize(224, 224, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const float32Data = new Float32Array(3 * 224 * 224);

  // PyTorch 표준 정규화 값 (모델에 따라 다를 수 있음)
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 224 * 224; i++) {
      // 0~1 변환 후 Mean 빼고 Std로 나누기
      const pixel = data[i * 3 + c] / 255.0;
      float32Data[c * 224 * 224 + i] = (pixel - mean[c]) / std[c];
    }
  }

  return new ort.Tensor("float32", float32Data, [1, 3, 224, 224]);
}

function softmax(arr: Float32Array): number[] {
  const maxVal = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - maxVal));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return Array.from(exps.map((x) => x / sumExps));
}

export async function queryMagicEyeByUrl(
  imageUrl: string,
  aiLevel: number = 5,
): Promise<MagicEyeResponse[]> {
  try {
    const [session, imageTensor] = await Promise.all([
      getModelSession(aiLevel),
      preprocessImage(imageUrl),
    ]);

    // 모델의 실제 입력 노드 이름 사용 (보통 'input' 또는 'data')
    const inputName = session.inputNames[0];
    const feeds = { [inputName]: imageTensor };

    const outputs = await session.run(feeds);

    // 모델의 실제 출력 노드 이름 사용 (보통 'output' 또는 'logits')
    const outputName = session.outputNames[0];
    const outputTensor = outputs[outputName];

    const rawData = outputTensor.data as Float32Array;
    const probabilities = softmax(rawData);

    // 모든 결과를 MagicEyeResponse 객체로 변환하고 score 기준 내림차순 정렬
    const allResults: MagicEyeResponse[] = probabilities
      .map((score, index) => ({
        label: ASSETS_LABELS[index] || "알 수 없음",
        score: score,
        level: aiLevel,
      }))
      .sort((a, b) => b.score - a.score);

    // 디버깅을 위한 상위 3개 로그 출력
    console.log(`[SERVER-SIDE] 상위 예측 결과 (레벨 ${aiLevel}):`);
    allResults.slice(0, 3).forEach((res, i) => {
      console.log(`${i + 1}. ${res.label}: ${(res.score * 100).toFixed(2)}%`);
    });

    return allResults;
  } catch (error) {
    console.error("[SERVER-SIDE] Inference Error:", error);
    throw error;
  }
}
