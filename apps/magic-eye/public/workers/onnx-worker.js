// 1. ONNX Runtime Web 라이브러리 로드
importScripts('./ort.min.js');

// 2. WASM 자원 경로 및 환경 설정
ort.env.wasm.wasmPaths = '/workers/';
ort.env.wasm.numThreads = 1;

// 모델 데이터를 키로 세션을 캐싱 (메모리 관리 차원)
let sessions = new Map();

/**
 * 모델 데이터(ArrayBuffer)를 받아 세션을 생성하거나 캐싱된 세션을 반환합니다.
 */
async function getSession(modelData, modelId) {
  // 이미 생성된 세션이 있다면 재사용
  if (sessions.has(modelId)) return sessions.get(modelId);

  try {
    let session;
    let usedBackend;

    // ONNX 세션 옵션 설정
    const sessionOptions = {
      executionProviders: ['webgpu', 'wasm'],
      graphOptimizationLevel: 'all',
    };

    try {
      // 시도 1: WebGPU 우선 로드 (전달받은 ArrayBuffer를 직접 사용)
      session = await ort.InferenceSession.create(modelData, sessionOptions);
      usedBackend = 'webgpu';
    } catch (gpuError) {
      console.warn(gpuError);
      console.warn('⚠️ [AI 엔진] WebGPU 가속 실패. WASM 모드로 전환합니다.');
      // 시도 2: WASM(CPU)으로 강제 재시도
      session = await ort.InferenceSession.create(modelData, {
        executionProviders: ['wasm'],
      });
      usedBackend = 'wasm';
    }

    console.log(
      usedBackend === 'webgpu'
        ? '🚀 [AI 엔진] 기기 GPU 감지! 초고속 모드 가동.'
        : '💻 [AI 엔진] GPU 미감지. CPU 최적화(WASM) 모드로 전환합니다.',
    );

    sessions.set(modelId, session);
    return session;
  } catch (err) {
    console.error(`❌ [AI 엔진] 세션 생성 중 치명적 오류:`, err);
    throw err;
  }
}

/**
 * 메인 스레드로부터 메시지 수신
 */
self.onmessage = async (event) => {
  const { type, modelData, inputData, inputName, level } = event.data;

  if (type === 'PREDICT') {
    try {
      // 캐시 키로 사용할 ID (예: ai_lv1.onnx)
      const modelId = `level_${level}`;

      // getSession이 이제 fetch를 하지 않고 전달받은 데이터를 바로 사용합니다.
      const session = await getSession(modelData, modelId);

      // 입력 데이터 텐서 생성
      const tensor = new ort.Tensor('float32', inputData, [1, 3, 224, 224]);
      const feeds = { [inputName || session.inputNames[0]]: tensor };

      // 추론 실행
      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputData = results[outputName].data;

      // 결과를 메인 스레드로 전송
      self.postMessage({
        type: 'SUCCESS',
        outputData: Array.from(outputData),
      });
    } catch (err) {
      console.error(`[WORKER] 추론 중 오류 발생:`, err);
      self.postMessage({
        type: 'ERROR',
        error: err.message,
      });
    }
  }
};
