# Discoverex 틀린그림찾기 게임 구현 상세 계획

본 문서는 백엔드 API에서 제공하는 테마 및 레이어 데이터를 활용하여 `discoverex` 앱 내에 틀린그림찾기(숨은그림찾기) 게임을 구현하기 위한 기술적 계획을 담고 있습니다.

## 1. 단계별 구현 목표

### Phase 1: 데이터 모델링 및 API 연동 (Foundation)
- [ ] **TypeScript 인터페이스 정의**: 백엔드 응답(`ThemeList`, `LayerList`) 및 상세 메타데이터 JSON에 대한 타입을 정의합니다.
- [ ] **API 서비스 모듈 작성**: `fetch`를 사용하여 테마 목록 조회 및 레이어 정보를 가져오는 함수를 구현합니다.
- [ ] **상태 관리 설계**: 현재 선택된 테마, 로딩 상태, 게임 진행 상태(Playing, Success, Failed)를 관리할 전역/지역 상태를 정의합니다.

### Phase 2: 레이어 기반 렌더링 엔진 (Core Rendering)
- [ ] **Layered Canvas/Container**: 여러 장의 PNG 이미지를 겹쳐서 보여주는 컴포넌트를 구현합니다.
  - Base 배경 이미지 (Layer 0)
  - 개별 오브젝트 이미지 (Inpaint Layers)
- [ ] **Responsive Scaling**: 원본 이미지 크기(예: 768x768)와 브라우저상의 실제 렌더링 크기 간의 비율을 계산하여 좌표를 매핑합니다.

### Phase 3: 정답 판정 및 상호작용 (Game Logic)
- [ ] **Click Detection**: 사용자가 클릭한 지점(`x, y`)을 감지합니다.
- [ ] **BBox Validation**: 클릭 좌표가 `answer_region_ids`에 해당하는 `regions`의 `bbox` 범위 내에 있는지 판별합니다.
- [ ] **Progress Tracking**: 찾은 정답 개수를 카운트하고 모든 정답을 찾았을 때의 완료 로직을 구현합니다.

### Phase 4: UI/UX 고도화 (Polish)
- [ ] **성공 피드백**: 정답을 맞췄을 때 `rex-animation.json`을 활용한 시각적 피드백을 제공합니다.
- [ ] **오답 피드백**: 틀린 곳을 클릭했을 때의 효과(예: 화면 흔들림)를 추가합니다.
- [ ] **테마 선택기**: 여러 테마 중 사용자가 선택하여 게임을 시작할 수 있는 UI를 구현합니다.

---

## 2. 주요 데이터 구조 (Interface)

```typescript
// 테마 목록 응답
interface ThemeListResponse {
  status: string;
  data: { themes: string[] };
}

// 레이어 목록 응답
interface LayerListResponse {
  status: string;
  data: {
    theme: string;
    layers: Array<{ name: string; url: string }>;
  };
}

// 상세 메타데이터 (JSON)
interface GameMetadata {
  background: { width: number; height: number };
  regions: Array<{
    region_id: string;
    geometry: { bbox: { x: number; y: number; w: number; h: number } };
    role: 'answer' | 'candidate';
  }>;
  answer: { answer_region_ids: string[] };
}
```

## 3. 핵심 알고리즘: 좌표 변환 (Coordinate Mapping)

브라우저의 이미지 크기가 가변적일 수 있으므로, 다음 공식을 사용하여 클릭 좌표를 검증합니다.

```javascript
// 비율 계산
const scaleX = currentDisplayWidth / originalWidth; // 768
const scaleY = currentDisplayHeight / originalHeight; // 768

// 클릭 지점이 BBox 내에 있는지 확인
const isInside = (clickX, clickY, bbox) => {
  return (
    clickX >= bbox.x * scaleX &&
    clickX <= (bbox.x + bbox.w) * scaleX &&
    clickY >= bbox.y * scaleY &&
    clickY <= (bbox.y + bbox.h) * scaleY
  );
};
```

## 4. 컴포넌트 구조 제안
- `GameContainer`: 전체 게임의 상태와 흐름 제어
- `ThemeSelector`: 테마 목록 표시 및 선택
- `GameBoard`: 이미지 레이어 렌더링 및 클릭 이벤트 핸들링
- `HUD (Heads-Up Display)`: 찾은 개수, 시간, 성공 메시지 등 표시
