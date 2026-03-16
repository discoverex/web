// 1. ONNX Runtime Web 라이브러리 로드
importScripts('./ort.min.js');

// 2. WASM 자원 경로 및 환경 설정
ort.env.wasm.wasmPaths = '/workers/';
ort.env.wasm.numThreads = 1;

let sessions = {};

/**
 * 모델 URL을 받아 세션을 생성하거나 캐싱된 세션을 반환합니다.
 */
async function getSession(modelUrl) {
  if (sessions[modelUrl]) return sessions[modelUrl];

  // URL에서 파일명만 추출하여 출력 (예: ai_lv5.onnx)
  const fileName = modelUrl.includes('/') ? modelUrl.split('/').pop() : modelUrl;
  console.log(`[WORKER] 📥 모델 다운로드 시작: ${fileName}`);

  try {
    // 모델 파일 다운로드
    const response = await fetch(modelUrl);
    if (!response.ok) throw new Error(`모델 다운로드 실패 (상태 코드: ${response.status})`);
    const modelBuffer = await response.arrayBuffer();

    console.log(`[WORKER] ✅ 다운로드 완료: ${(modelBuffer.byteLength / 1024 / 1024).toFixed(2)}MB`);

    let session;
    let usedBackend = '';

    try {
      // 시도 1: WebGPU 우선 로드
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['webgpu', 'wasm'],
        graphOptimizationLevel: 'all',
        logSeverityLevel: 3,
      });

      // session.handler 이름을 확인하여 실제 사용된 백엔드 판별
      const handlerName = session.handler?.constructor?.name || '';
      usedBackend = handlerName.toLowerCase().includes('gpu') ? 'webgpu' : 'wasm';
    } catch (gpuError) {
      // 시도 2: WebGPU 실패 시 WASM(CPU)으로 강제 재시도
      console.warn('⚠️ [AI 엔진] WebGPU 가속을 사용할 수 없어 WASM 모드로 전환합니다.');
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        logSeverityLevel: 3,
      });
      usedBackend = 'wasm';
    }

    // --- 한국어 커스텀 메시지 출력 ---
    console.log(
      usedBackend === 'webgpu'
        ? '🚀 [AI 엔진] 기기 GPU 감지! 초고속 모드 가동.'
        : '💻 [AI 엔진] GPU 미감지. CPU 최적화(WASM) 모드로 전환합니다.',
    );

    sessions[modelUrl] = session;
    return session;
  } catch (err) {
    console.error(`❌ [AI 엔진] 세션 생성 중 치명적 오류:`, err);
    throw err;
  }
}

/**
 * 메인 스레드로부터 메시지 수신 (추론 실행)
 */
self.onmessage = async (event) => {
  const { type, modelUrl, inputData, inputName } = event.data;

  if (type === 'PREDICT') {
    try {
      const session = await getSession(modelUrl);

      // 입력 데이터 텐서 생성 (이미지 전처리 결과: [1, 3, 224, 224])
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
