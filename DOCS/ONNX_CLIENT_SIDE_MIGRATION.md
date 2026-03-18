# ONNX 모델의 클라이언트 사이드 전환 가이드

이 문서는 현재 서버 사이드에서 수행 중인 Vision AI(ONNX) 추론 로직을 클라이언트 사이드(브라우저)로 전환하기 위한 검토 및 가이드라인을 담고 있습니다.

## 1. 문제 제기: 서버 사이드 추론의 한계

현재 `apps/magic-eye` 프로젝트는 사용자의 이미지 데이터를 서버(`app/api/predict`)로 전송하여 ONNX Runtime(Node.js)에서 추론을 수행하고 있습니다. 이 방식은 다음과 같은 문제점을 야기합니다.

*   **속도(Latency) 문제:** 이미지 데이터를 서버로 업로드하고 결과를 다시 내려받는 과정에서 네트워크 지연 시간이 발생합니다. 특히 고해상도 이미지일수록 사용자 경험(UX)이 저하됩니다.
*   **비용 및 확장성 문제:** 모든 추론 부하가 서버 CPU/GPU에 집중됩니다. 사용자가 증가할수록 서버 리소스 비용이 기하급수적으로 늘어나며, 고사양 인프라가 필요합니다.
*   **개인정보 보호:** 사용자의 데이터가 서버에 머물러야 하므로, 보안 및 개인정보 처리 방침에 대한 부담이 큽니다.

## 2. 개념 비교: 서버 사이드 vs 클라이언트 사이드

| 비교 항목 | 서버 사이드 (현재) | 클라이언트 사이드 (제안) |
| :--- | :--- | :--- |
| **추론 속도** | 네트워크 상태에 따라 가변적 (수 초 소요 가능) | 초기 모델 로딩 후 즉각적인 결과 (Real-time 가능) |
| **서버 비용** | 높음 (컴퓨팅 리소스 점유) | **매우 낮음** (정적 파일 서빙 비용만 발생) |
| **사용자 경험** | 로딩 스피너 필수, 반응성 낮음 | **높은 반응성**, 오프라인 모드 지원 가능 |
| **보안 및 IP** | 모델 소스 코드 및 가중치 숨기기 용이함 | 모델 파일이 노출될 수 있음 (WebAssembly/WebGL) |
| 하드웨어 사양 | 서버 사양에 고정됨 | 사용자 기기 성능에 의존함 (모바일/저사양 기기 이슈) |

## 2.5. 모델 최적화 현황 (최근 업데이트)

클라이언트 사이드 전환을 위해 기존 ONNX 모델에 대한 **양자화(Quantization)** 작업을 완료하여 버킷에 업로드하였습니다.

*   **모델 크기 변화:** 45MB → **11MB (약 75% 감소)**
*   **최적화 방식:** Float32에서 Int8/Float16 등으로의 가중치 양자화 적용
*   **저장 위치:** 클라우드 스토리지(버킷) 내 최적화 모델로 교체 완료

## 3. 클라이언트 사이드 변경 시 우려되는 점과 대안

### 3.1 모델 노출 및 보안 (Intellectual Property) 및 효율적 관리
*   **우려:** 브라우저에서 모델 파일(`.onnx`)을 다운로드하므로, 모델 구조와 가중치가 노출될 수 있습니다.
*   **대안 및 최신 변경 사항:**
    *   **보안:** 모델 파일에 대한 직접적인 퍼블릭 접근을 제한하고, 서버 사이드에서 생성된 **15분간 유효한 서명된 URL(Signed URL)**을 통해서만 클라이언트가 모델을 요청하도록 변경되었습니다.
    *   **효율적 저장 (IndexedDB):** 다운로드된 모델은 브라우저의 **IndexedDB**에 버전 정보와 함께 저장됩니다. 이를 통해 매번 모델을 다시 다운로드하지 않고 로컬에서 즉시 불러올 수 있습니다.
    *   **버전 관리 및 갱신:** IndexedDB에 저장된 모델이 있더라도, 버킷에 동일한 이름의 새로운 모델이 업로드되어 버전(Hash 등)이 갱신된 경우에는 이를 감지하여 모델을 다시 다운로드하고 로컬 저장소를 최신화합니다.
    *   **IP 보호:** 적용된 **양자화**는 가중치를 압축된 형식으로 변환하므로, 원본 모델의 정밀한 값을 그대로 복제하기 어렵게 만드는 보안 효과를 유지합니다.

### 3.2 모델 파일 크기 및 초기 로딩 (해결됨)
*   **우려:** 수십 MB 단위의 모델을 다운로드하는 동안 사용자가 이탈할 수 있습니다.
*   **현황:** 모델 크기를 **11MB로 경량화**함에 따라, 일반적인 4G/5G 환경에서도 수 초 내에 로딩이 가능해졌습니다. 이는 초기 우려사항이었던 '사용자 이탈률' 문제를 획기적으로 개선합니다.
*   **추가 대안:** 서비스 워커(Service Worker)를 활용한 브라우저 캐싱을 적용하면, 두 번째 방문부터는 로딩 시간 없이 즉시 실행이 가능합니다.

### 3.3 사용자 기기 성능 편차 (완화됨)
*   **우려:** 사양이 낮은 모바일 기기에서 추론 속도가 느리거나 메모리 부족으로 브라우저가 종료될 수 있습니다.
*   **현황:** 양자화된 모델은 메모리 점유율이 낮고 연산량이 적어, **저사양 기기 및 모바일 환경에서의 실행 안정성**이 크게 향상되었습니다.
*   **대안:** 추론 로직을 Web Worker에서 실행하여 UI 프리징을 방지하는 구조를 유지합니다.


## 4. 클라이언트 사이드 호출 예제

`onnxruntime-web` 라이브러리를 사용하여 브라우저에서 직접 추론을 수행하는 기본 예제입니다.

```typescript
import * as ort from 'onnxruntime-web';

async function runPrediction(imageCanvas: HTMLCanvasElement) {
  try {
    // 1. 세션 생성 (모델 로드)
    // 모델 파일은 public 폴더에 위치시켜 정적 파일로 서빙합니다.
    const session = await ort.InferenceSession.create('/models/magic_eye_model.onnx', {
      executionProviders: ['webgpu', 'wasm'], // WebGPU 우선 사용
      graphOptimizationLevel: 'all'
    });

    // 2. 이미지 데이터 전처리 (Tensor 생성)
    // 이미지 데이터를 모델 입력 크기(예: 224x224)에 맞게 변환
    const inputTensor = preprocess(imageCanvas);

    // 3. 추론 실행
    const feeds = { input_node_name: inputTensor };
    const results = await session.run(feeds);

    // 4. 결과 해석
    const output = results.output_node_name;
    console.log('추론 결과:', output.data);

  } catch (e) {
    console.error('클라이언트 추론 실패:', e);
  }
}

/**
 * 이미지 전처리 함수 (예시)
 */
function preprocess(canvas: HTMLCanvasElement): ort.Tensor {
  const ctx = canvas.getContext('2d');
  const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  // Float32Array로 변환 및 정규화 (모델 요구사항에 맞춤)
  const floatData = new Float32Array(3 * 224 * 224);
  // ... 이미지 픽셀 처리 로직 ...
  
  return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
}
```

## 5. 트러블슈팅: GCS CORS 설정 (필수)

클라이언트 사이드에서 GCS 버킷의 이미지나 모델 파일을 `fetch`할 때, 브라우저의 보안 정책(CORS)으로 인해 로딩이 실패할 수 있습니다. 이를 해결하기 위해 버킷에 CORS 설정을 적용해야 합니다.

### 5.1 CORS 설정 파일 작성 (`cors-config.json`)
아래 내용을 담은 JSON 파일을 작성합니다. (인코딩: **UTF-8 (BOM 없음)** 필수)

```json
[
  {
    "origin": ["*"], // 또는 특정 주소만 허용(권장) 
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Access-Control-Allow-Origin",
      "Cross-Origin-Resource-Policy",
      "x-goog-resumable"
    ],
    "maxAgeSeconds": 3600
  }
]
```

### 5.2 설정 적용 명령어
Google Cloud SDK가 설치된 터미널에서 아래 명령어 중 하나를 실행합니다.

```powershell
# gsutil 방식
gsutil cors set cors-config.json gs://YOUR_BUCKET_NAME

# gcloud 방식
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors-config.json
```

### 5.3 주의사항: Windows 인코딩 문제
Windows PowerShell에서 `echo` 등으로 파일을 생성할 경우, 기본 인코딩이 `UTF-16`으로 설정되어 `UnicodeDecodeError` 또는 `utf-8 codec can't decode` 오류가 발생할 수 있습니다. 
*   **해결법:** VS Code 등 에디터에서 파일 인코딩을 **UTF-8**로 명시적으로 저장하거나, 에이전트가 생성한 파일을 그대로 사용하십시오.

---
*최종 업데이트: 2026-03-16*
*작성자: Gemini AI*
