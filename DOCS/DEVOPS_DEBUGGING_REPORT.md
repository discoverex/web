# 🦖 AI 훈수 분석 엔진 배포 환경 디버깅 보고서

본 문서는 Vision AI GAMES World 프로젝트의 `magic-eye` 앱 배포 과정에서 발생한 AI 분석 엔진(ONNX Runtime)의 오류와 이를 해결하기 위한 기술적 여정을 기록한 보고서입니다.

## 📋 이슈 개요

- **발생 지점**: `apps/magic-eye` 배포 서버 (Google Cloud Run)
- **주요 증상**: "AI 훈수 듣기" 클릭 시 서버 에러(500) 발생 및 분석 실패
- **핵심 원인**:
  1. 환경 변수(GCP Service Account) 전달 및 파싱 오류
  2. Next.js `standalone` 빌드 시 네이티브 라이브러리(`.so`) 누락
  3. CI/CD 파이프라인에서의 환경 변수 주입 구문 오류

---

## 🛠 디버깅 여정 및 해결 과정

### Phase 1: 환경 변수 및 인증 체계 개선

- **문제**: `The incoming JSON object does not contain a client_email field` 오류 발생.
- **원인**: Turborepo의 `turbo.json`에 환경 변수가 누락되어 앱까지 전달되지 않았으며, JSON 문자열 내의 따옴표와 쉼표 처리가 불안정했음.
- **해결**:
  - `turbo.json`의 `globalEnv`에 `GCP_SERVICE_ACCOUNT_JSON` 추가.
  - `magic-eye-api.ts`에서 환경 변수 파싱 로직 강화 (따옴표 정제 및 예외 처리).
  - **ADC(Application Default Credentials) 폴백 도입**: 환경 변수 파싱 실패 시 Cloud Run 자체의 서비스 계정 권한을 사용하도록 로직을 유연하게 변경.

### Phase 2: 배포 파이프라인(CI/CD) 안정화

- **문제**: `gcloud run deploy` 실행 시 JSON 내부의 쉼표(`,`)와 큰따옴표(`"`)로 인해 쉘 명령행 구문 오류 발생.
- **해결**:
  - 직접적인 `gcloud` 명령어 대신 공식 **`google-github-actions/deploy-cloudrun`** 액션으로 교체.
  - YAML의 블록 스칼라(`|`) 방식을 사용하여 복잡한 JSON 데이터를 안전하게 주입.

### Phase 3: 네이티브 라이브러리 의존성 해결 (가장 난이도 높음)

- **문제**: `libonnxruntime.so.1: cannot open shared object file` 오류 발생.
- **원인**: Next.js `standalone` 빌드는 JS 파일 위주로 추적하므로, 동적으로 로드되는 ONNX Runtime의 네이티브 바이너리(`.so`)를 결과물에서 누락시키거나 경로가 깨짐.
- **해결**:
  - **`next.config.ts`**: `serverExternalPackages`에 `onnxruntime-node` 등록 및 `outputFileTracingIncludes` 설정을 통해 바이너리 파일 강제 추적.
  - **`Dockerfile`**:
    - 빌드 스테이지에서 `find -L` 명령어로 심볼릭 링크를 해결하며 실제 `.so` 파일 추출.
    - 런타임 스테이지의 `/usr/lib/` 시스템 경로로 바이너리 직접 주입.
    - `ldconfig`를 실행하여 시스템 라이브러리 캐시 갱신.
    - `LD_LIBRARY_PATH` 환경 변수 명시.

---

### Phase 4: AI 추론 정확도 개선 (전처리 일치화)

- **문제**: 모델의 훈련 정확도는 90% 이상이었으나, 서비스 환경에서 현저히 낮은 정확도를 보임.
- **원인**:
  - **보간법 불일치**: 파이썬 PIL의 `bilinear`와 Node.js `sharp`의 기본값(`lanczos3`) 차이로 인한 패턴 왜곡.
  - **색상 공간**: 이미지 프로파일에 따른 색상 변조 가능성.
- **해결**:
  - `sharp`의 리사이즈 커널을 `linear` (Bilinear 대응)로 강제 지정.
  - `toColorspace("srgb")`를 통해 색상 공간 통일.
  - PyTorch의 `ToTensor()` 및 `Normalize()` 연산과 1:1로 일치하는 전처리 루프 구현.
- **결과**: 서비스 환경의 추론 정확도가 훈련 수준(90%대)으로 회복됨.

---

## 🏆 최종 결과 및 교훈

### 결과

- 배포 환경에서 ONNX 모델(`ai_lv${level}.onnx`) 로드 및 실행 성공.
- GCS 버킷으로부터 모델 실시간 다운로드 및 캐싱 로직 안정화.
- 모델 예측 결과가 90% 이상의 신뢰도로 클라이언트에 반환됨.

### 교훈 및 베스트 프랙티스

1. **Container-View 패턴의 가치**: 비즈니스 로직(Hooks), 데이터 처리(Utils), UI(Views)를 명확히 분리함으로써 디버깅 시 로직의 문제인지 환경의 문제인지 빠르게 식별할 수 있었음.
2. **배포 환경의 특수성 이해**: 로컬과 달리 `standalone` 빌드나 컨테이너 환경에서는 네이티브 의존성을 시스템 경로에 강제로 주입하는 방식이 가장 확실한 해결책임을 확인.
3. **훈련-추론 환경 일치(Parity)**: AI 모델의 성능은 전처리의 미세한 차이(보간법, 정규화 등)에 극도로 민감하므로, 훈련 코드의 전처리 로직을 추론 환경에서 완벽히 재현하는 것이 필수적임.

---

**작성일**: 2026년 3월 11일  
**작성자**:

- 김광회 <postelian@gmail.com> (Lead Engineer)
- Gemini CLI (Senior AI Engineer)
