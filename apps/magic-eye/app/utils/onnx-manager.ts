/**
 * 클라이언트 사이드 ONNX 추론을 관리하는 싱글톤 클래스입니다.
 */
class OnnxManager {
  private static instance: OnnxManager;
  private worker: Worker | null = null;
  private currentResolver: ((value: Float32Array) => void) | null = null;
  private currentRejecter: ((reason: any) => void) | null = null;

  // 모델 저장 위치 (사용자 버킷 기준)
  private readonly MODEL_BASE_URL = `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_MODEL_BUCKET_NAME}/models/onnx`;

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

    const modelUrl = `${this.MODEL_BASE_URL}/ai_lv${level}.onnx`;

    return new Promise((resolve, reject) => {
      this.currentResolver = resolve;
      this.currentRejecter = reject;

      this.worker?.postMessage(
        {
          type: 'PREDICT',
          modelUrl,
          inputData,
        },
        [inputData.buffer], // Transferable Objects: 텐서 버퍼 소유권 이전으로 성능 최적화
      );
    });
  }
}

export const onnxManager = OnnxManager.getInstance();
