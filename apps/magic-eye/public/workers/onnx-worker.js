/* eslint-disable no-undef */
importScripts("./ort.min.js");

// WASM 자원 경로 설정
ort.env.wasm.wasmPaths = "/workers/";
ort.env.wasm.numThreads = 1;

let sessions = {};

async function getSession(modelUrl) {
  if (sessions[modelUrl]) return sessions[modelUrl];

  console.log(`[WORKER] 모델 다운로드 시작: ${modelUrl}`);
  try {
    // 1. 모델 파일을 ArrayBuffer로 직접 fetch (네트워크 오류 확인용)
    const response = await fetch(modelUrl);
    if (!response.ok) {
      throw new Error(
        `모델 파일 다운로드 실패: ${response.status} ${response.statusText}`,
      );
    }
    const modelBuffer = await response.arrayBuffer();
    console.log(
      `[WORKER] 모델 다운로드 완료 (${modelBuffer.byteLength} bytes)`,
    );

    // 2. ArrayBuffer를 사용하여 세션 생성
    const session = await ort.InferenceSession.create(modelBuffer, {
      executionProviders: ["webgpu", "wasm"],
      graphOptimizationLevel: "all",
    });

    console.log(
      `[WORKER] 세션 생성 성공 (Backend: ${session.handler ? "WebGPU" : "WASM"})`,
    );
    sessions[modelUrl] = session;
    return session;
  } catch (err) {
    console.error(`[WORKER] 세션 생성 실패: ${modelUrl}`, err);

    // WebGPU 실패 시 WASM으로 재시도 (버퍼 재사용을 위해 다시 create 호출)
    if (err.message.includes("webgpu") || err.message.includes("WebGPU")) {
      console.warn(`[WORKER] WebGPU 로드 실패, WASM으로 강제 재시도합니다.`);
      // Note: InferenceSession.create는 첫 번째 인자로 Uint8Array도 받습니다.
      const response = await fetch(modelUrl);
      const modelBuffer = await response.arrayBuffer();
      const wasmSession = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      sessions[modelUrl] = wasmSession;
      return wasmSession;
    }
    throw err;
  }
}

self.onmessage = async (event) => {
  const { type, modelUrl, inputData, inputName } = event.data;

  if (type === "PREDICT") {
    try {
      const session = await getSession(modelUrl);

      const tensor = new ort.Tensor("float32", inputData, [1, 3, 224, 224]);
      const feeds = { [inputName || session.inputNames[0]]: tensor };

      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputData = results[outputName].data;

      self.postMessage({
        type: "SUCCESS",
        outputData: Array.from(outputData),
      });
    } catch (err) {
      console.error(`[WORKER] 추론 실행 중 오류:`, err);
      self.postMessage({
        type: "ERROR",
        error: err.message,
      });
    }
  }
};
