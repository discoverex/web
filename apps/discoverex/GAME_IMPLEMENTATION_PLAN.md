# Discoverex 틀린그림찾기 게임 구현 상세 계획 (Updated)

본 문서는 백엔드 API에서 제공하는 테마 및 레이어 데이터를 활용하여 `discoverex` 앱 내에 틀린그림찾기(숨은그림찾기) 게임을 구현하기 위한 기술적 계획 및 진행 상황을 담고 있습니다.

## 1. 단계별 구현 현황

### Phase 1: 데이터 모델링 및 API 연동 (Foundation) - ✅ 완료
- [x] **TypeScript 인터페이스 정의**: `types/game.ts`에 API 응답, 매니페스트, BBox 등 핵심 타입 정의 완료.
- [x] **API 서비스 모듈 작성**: `services/game-service.ts`에서 테마 목록 및 레이어 정보 조회 기능 구현 완료.
- [x] **전체 상태 관리 설계**: `hooks/use-game-state.ts`를 통해 테마 선택 및 데이터 로딩 흐름 구축 완료.

### Phase 2: 레이어 기반 렌더링 엔진 (Core Rendering) - ✅ 완료
- [x] **Layered Container**: `GameBoard.tsx`에서 `base`와 `inpaint_patch` 레이어를 구분하여 정교하게 겹쳐서 렌더링 구현 완료.
- [x] **Image Mapping Logic**: `utils/image-mapping.ts`를 통해 복잡한 GCS 경로 문자열에서 실제 유효한 URL을 찾아내는 매핑 유틸 구현 완료.
- [x] **Responsive Scaling**: 백분율(%) 기반의 좌표 계산을 통해 브라우저 크기에 상관없이 레이어 위치 고정 완료.

### Phase 3: 정답 판정 및 상호작용 (Game Logic) - ✅ 완료
- [x] **Coordinate Transformation**: `utils/coordinate-utils.ts`를 사용하여 DOM 클릭 좌표를 원본 이미지 좌표계로 스케일링하는 로직 구현 완료.
- [x] **BBox Validation**: 클릭 좌표가 정답 영역(Region) 내에 있는지 검사하는 판정 로직 구현 완료.
- [x] **Progress Tracking**: `hooks/use-discover-game.ts`를 통해 찾은 아이템 상태 관리 및 진행도(Found/Total) 계산 기능 구현 완료.
- [x] **HUD & UI**: 상단 진행바 및 하단 타겟 아이템 리스트(`ItemList.tsx`) 구현 완료.

### Phase 4: UI/UX 고도화 (Polish) - 🛠 진행 예정
- [ ] **성공 피드백**: 정답을 맞췄을 때 `rex-animation.json` (Lottie)를 활용한 캐릭터 애니메이션 재생.
- [ ] **오답 피드백**: 틀린 지점 클릭 시 햅틱 피드백 혹은 시각적 효과 추가.
- [ ] **전체 성공 시퀀스**: 모든 아이템을 찾았을 때의 화려한 성공 화면 및 보상 연출.
- [ ] **디자인 디테일**: 타이포그래피, 마커 애니메이션, 다크모드 대응 등 전반적인 비주얼 완성도 향상.

---

## 2. 모듈 구조 (Architecture)

현재 프로젝트는 `magic-eye`의 모듈화 철학을 따라 다음과 같이 구성되어 있습니다:

- **`services/`**: 순수 API 통신 레이어
- **`hooks/`**: 비즈니스 로직 및 상태 관리 (GameState, DiscoverGame)
- **`utils/`**: 순수 함수 기반의 유틸리티 (좌표 변환, 이미지 매핑)
- **`components/game/`**: 기능별로 분리된 UI 컴포넌트 (Board, Container, ItemList)

## 3. 핵심 로직: 좌표 변환 (Coordinate Mapping)

현재 적용된 클릭 판정 공식:
```typescript
// scaleX = 원본 가로 / 실제 렌더링 가로
// scaleY = 원본 세로 / 실제 렌더링 세로
// scaledX = (클릭X - 컨테이너Left) * scaleX
// isInside = scaledX >= bbox.x && scaledX <= bbox.x + bbox.w ...
```
이 공식은 `utils/coordinate-utils.ts`에 캡슐화되어 있어 유지보수가 용이합니다.
