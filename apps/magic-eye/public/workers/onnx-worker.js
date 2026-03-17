importScripts('./ort.min.js');

ort.env.wasm.wasmPaths = '/workers/';
ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;

let sessions = new Map();

async function getSession(modelData, modelId) {
  if (sessions.has(modelId)) return sessions.get(modelId);

  try {
    let session;
    const options = {
      executionProviders: ['webgpu', 'wasm'],
      graphOptimizationLevel: 'all',
      logSeverityLevel: 3,
    };

    try {
      session = await ort.InferenceSession.create(modelData, options);
      console.log('✅ WebGPU 세션 생성 성공');
    } catch (gpuError) {
      console.error('❌ WebGPU 생성 실패 원인:', gpuError.message);
      session = await ort.InferenceSession.create(modelData, { executionProviders: ['wasm'] });
    }

    const actualEP = session.handler.constructor.name;
    console.log(`🔎 실제 사용 중인 EP: ${actualEP}`);

    if (actualEP.includes('WebGpu')) {
      console.log('🚀 [AI 엔진] GPU 가속 확정!');
    } else {
      console.log('💻 [AI 엔진] GPU 세션 생성은 성공했으나, 실제 연산은 WASM으로 우회됨.');
    }

    const handler = session.handler?.constructor?.name?.toLowerCase() || '';
    const isGPU = handler.includes('webgpu');
    console.log(isGPU ? '🚀 GPU 가속 활성화' : '💻 WASM 모드 동작');

    sessions.set(modelId, session);
    return session;
  } catch (err) {
    throw err;
  }
}

self.onmessage = async (event) => {
  const { type, modelData, inputData, level } = event.data;

  if (type === 'PREDICT') {
    try {
      const session = await getSession(modelData, `level_${level}`);
      const tensor = new ort.Tensor('float32', inputData, [1, 3, 224, 224]);

      const results = await session.run({ [session.inputNames[0]]: tensor });
      const outputData = results[session.outputNames[0]].data;

      // 결과 전송 시에도 Transferable 사용 가능 (Float32Array인 경우)
      self.postMessage({ type: 'SUCCESS', outputData }, [outputData.buffer]);
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
};
