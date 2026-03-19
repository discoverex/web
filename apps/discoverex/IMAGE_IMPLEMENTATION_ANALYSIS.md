# Discoverex 이미지 렌더링 구현 분석

이 문서는 `apps/discoverex` 프로젝트에서 이미지를 렌더링하고 관리하는 방식에 대한 기술적 분석을 담고 있습니다.

## 1. 핵심 데이터 구조 (`types/game.ts`)

게임 화면은 여러 개의 레이어(`PlayableLayer`)가 겹쳐진 형태로 구성됩니다.

- **PlayableLayer**: 개별 이미지 레이어의 정보를 담습니다.
  - `layer_id`: 레이어 고유 식별자
  - `image_ref`: 원본 이미지 참조 경로 (보통 GCS/S3 경로)
  - `bbox`: 이미지의 위치와 크기 (`x`, `y`, `w`, `h`)
  - `z_index`: 레이어의 겹침 순서
- **DeliveryBundle**: 게임 실행에 필요한 전체 패키지입니다.
  - `playable`: 모든 레이어 정보와 원본 캔버스 크기(`width`, `height`)를 포함합니다.
  - `answer_key`: 사용자가 찾아야 할 정답 영역(`regions`) 정보를 포함합니다.

## 2. 이미지 렌더링 로직 (`components/game/game-board.tsx`)

`GameBoard` 컴포넌트는 Next.js의 `Image` 컴포넌트를 사용하여 레이어 기반 렌더링을 수행합니다.

### 레이어 스택 구성
1. `bundle.playable.layers`를 `z_index` 순으로 정렬합니다.
2. 각 레이어를 `absolute` 포지셔닝으로 배치합니다.
3. **좌표 계산**: 원본 캔버스 크기 대비 백분율(%)을 사용하여 반응형 레이아웃을 구현합니다.
   ```typescript
   left: `${(layer.bbox.x / originalWidth) * 100}%`,
   top: `${(layer.bbox.y / originalHeight) * 100}%`,
   width: `${(layer.bbox.w / originalWidth) * 100}%`,
   height: `${(layer.bbox.h / originalHeight) * 100}%`
   ```

### 최적화
- `priority` 속성: `base` 타입 레이어(배경)에 적용하여 LCP(Largest Contentful Paint)를 최적화합니다.
- `fill` 레이아웃: 부모 컨테이너 크기에 맞춰 이미지를 꽉 채우도록 설정합니다.

## 3. URL 매핑 전략 (`components/game/game-container.tsx`)

매니페스트에 정의된 레이어 ID를 실제 클라우드 스토리지(GCS) URL과 매칭하는 `getImageUrl` 함수가 핵심입니다.

### 3단계 폴백(Fallback) 매칭
이미지 경로가 가변적일 수 있으므로 다음과 같은 우선순위로 매칭을 시도합니다:
1. **레이어 ID 기반**: `layer_id`(예: `layer-fx`)가 API에서 내려온 파일명(`layers` 배열)에 포함되는지 확인합니다.
2. **매니페스트 경로 기반**: `manifest.layers`에 정의된 `path`의 파일명이 실제 파일 목록에 있는지 확인합니다.
3. **image_ref 기반**: 최후의 수단으로 원본 `image_ref`의 파일명을 기반으로 매칭합니다.

*주의: 보안 및 에러 방지를 위해 로컬 임시 경로(`/tmp/...`)가 포함된 URL은 의도적으로 제외합니다.*

## 4. 사용자 상호작용 및 정답 체크

1. **클릭 좌표 변환**: 사용자가 화면(DOM)을 클릭하면, 현재 컨테이너의 크기를 기준으로 원본 좌표계로 변환합니다.
   ```typescript
   const scaleX = originalWidth / rect.width;
   const x = clickX * scaleX;
   ```
2. **충돌 검사**: 변환된 좌표가 정답 영역(`answer_key.regions`)의 `bbox` 범위 내에 있는지 검사합니다.
3. **시각적 피드백**: 정답을 맞히면 `foundIds`에 추가되고, `GameBoard`에서는 해당 영역에 초록색 원형 마커를 표시하며 `ItemList`에서는 해당 아이템을 흐리게(grayscale) 처리합니다.

## 5. 기타 자원
- **애니메이션**: `public/rex-animation.json` 파일을 사용하여 Lottie 애니메이션(정답 시 효과 등)을 구현합니다.
- **폰트**: `Pretendard` 가변 폰트를 사용하여 일관된 타이포그래피를 제공합니다.
