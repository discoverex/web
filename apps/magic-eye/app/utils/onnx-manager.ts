import { getModelInfo } from '@/app/services/get-magic-eye-finder';
import { modelCache } from '@/app/utils/model-cache';

/**
 * 클라이언트 사이드 ONNX 추론을 관리하는 싱글톤 클래스입니다.
 */
class OnnxManager {
  private static instance: OnnxManager;
  private worker: Worker | null = null;
  private currentResolver: ((value: Float32Array) => void) | null = null;
  private currentRejecter: ((reason: any) => void) | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initWorker();
    }
  }

  public static getInstance(): OnnxManager {
    if (!OnnxManager.instance) {
      OnnxManager.instance = new OnnxManager();
    }
    return OnnxManager.instance;
  }

  private initWorker() {
    this.worker = new Worker(new URL('/workers/onnx-worker.js', window.location.origin));
    this.worker.onmessage = (event) => {
      const { type, outputData, error } = event.data;
      if (type === 'SUCCESS' && this.currentResolver) {
        this.currentResolver(new Float32Array(outputData));
      } else if (type === 'ERROR' && this.currentRejecter) {
        this.currentRejecter(new Error(error));
      }
      this.currentResolver = null;
      this.currentRejecter = null;
    };
  }

  /**
   * 클라이언트 사이드 추론 실행
   */
  public async predict(inputData: Float32Array, level: number): Promise<Float32Array> {
    if (!this.worker) throw new Error('Worker가 초기화되지 않았습니다.');
    if (this.currentResolver) throw new Error('현재 다른 추론이 진행 중입니다.');

    try {
      const modelName = `ai_lv${level}.onnx`;
      const { singed_url, version } = await getModelInfo(level);

      let modelData = await modelCache.getValidModel(modelName, version);

      if (!modelData) {
        console.log(`[Cache Miss] ${modelName} 다운로드 중...`);
        const response = await fetch(singed_url);
        if (!response.ok) throw new Error('모델 다운로드 실패');
        modelData = await response.arrayBuffer();
        await modelCache.saveModel(modelName, version, modelData);
      } else {
        console.log(`[Cache Hit] ${modelName} 로컬 캐시 사용`);
      }

      return new Promise((resolve, reject) => {
        this.currentResolver = resolve;
        this.currentRejecter = reject;

        // Worker에게 modelData(ArrayBuffer) 직접 전달
        this.worker?.postMessage(
          {
            type: 'PREDICT',
            modelData, // modelUrl 대신 직접 데이터를 보냄
            inputData,
          },
          [modelData, inputData.buffer], // modelData도 Transferable로 전달하여 복사 비용 제거
        );
      });
    } catch (error) {
      console.error('추론 준비 중 오류 발생:', error);
      throw error;
    }
  }
}

export const onnxManager = OnnxManager.getInstance();
