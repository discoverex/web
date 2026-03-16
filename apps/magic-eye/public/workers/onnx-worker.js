/* eslint-disable no-undef */
importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort.min.js');

// [중요] WASM 및 부속 파일들을 로컬 서버가 아닌 CDN에서 가져오도록 설정
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/';

// 모델 세션 캐시
let sessions = {};

/**
 * 모델 세션 생성
 */
async function getSession(modelUrl) {
  if (sessions[modelUrl]) return sessions[modelUrl];

  try {
    // WebGPU -> WASM 순서로 실행 환경 시도
    const session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['webgpu', 'wasm'],
      graphOptimizationLevel: 'all',
    });
    sessions[modelUrl] = session;
    return session;
  } catch (err) {
    console.error(`[WORKER] 세션 생성 실패: ${modelUrl}`, err);
    throw err;
  }
}

/**
 * 메시지 핸들러
 */
self.onmessage = async (event) => {
  const { type, modelUrl, inputData, inputName } = event.data;

  if (type === 'PREDICT') {
    try {
      const session = await getSession(modelUrl);
      
      // 텐서 생성
      const tensor = new ort.Tensor('float32', inputData, [1, 3, 224, 224]);
      const feeds = { [inputName || session.inputNames[0]]: tensor };

      // 추론 실행
      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputData = results[outputName].data;

      // 결과 반환 (Transferable Objects 사용 가능)
      self.postMessage({
        type: 'SUCCESS',
        outputData: outputData,
      });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        error: err.message,
      });
    }
  }
};
