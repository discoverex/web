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

## 🏆 최종 결과 및 교훈

### 결과
- 배포 환경에서 ONNX 모델(`ai_lv5.onnx`) 로드 성공.
- GCS 버킷으로부터 모델 다운로드 및 이미지 추론(Inference) 정상 작동 확인.
- 모델 예측 결과(예: 코끼리 51.12% 등)가 클라이언트에 정상적으로 반환됨.

### 교훈 및 베스트 프랙티스
1. **Container-View 패턴의 가치**: 비즈니스 로직(Hooks), 데이터 처리(Utils), UI(Views)를 명확히 분리함으로써 디버깅 시 로직의 문제인지 환경의 문제인지 빠르게 식별할 수 있었음.
2. **배포 환경의 특수성 이해**: 로컬과 달리 `standalone` 빌드나 컨테이너 환경에서는 네이티브 의존성을 시스템 경로에 강제로 주입하는 방식이 가장 확실한 해결책임을 확인.
3. **유연한 인증 전략**: 특정 환경 변수에만 의존하지 않고 플랫폼의 기본 권한(ADC)을 활용하는 폴백 로직이 배포 안정성을 크게 높임.

---
**작성일**: 2026년 3월 11일 |
**작성자**: 김광회 <postelian@gmail.com>, Gemini CLI (Senior AI Engineer)
