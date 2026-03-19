/**
 * BBox 좌표 정보
 */
export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 개별 영역 정보
 */
export interface Region {
  region_id: string;
  bbox: BBox;
  role: 'answer' | 'candidate';
}

/**
 * 레이어 정보
 */
export interface PlayableLayer {
  layer_id: string;
  type: string;
  image_ref: string;
  bbox: BBox | null;
  z_index: number;
  order: number;
  source_region_id: string | null;
}

/**
 * 게임 메타데이터 (Delivery Bundle)
 */
export interface DeliveryBundle {
  playable: {
    image_ref: string;
    width: number;
    height: number;
    layers: PlayableLayer[];
  };
  answer_key: {
    answer_region_ids: string[];
    regions: Region[];
  };
}

/**
 * 전체 매니페스트 구조
 */
export interface Manifest {
  scene_id: string;
  version_id: string;
  delivery_bundle: DeliveryBundle;
  lottie?: string;
}

/**
 * 레이어 아이템 (API 응답 내 개별 이미지 정보)
 */
export interface LayerItem {
  name: string;
  url: string;
}

/**
 * 테마별 레이어 목록 응답 타입
 */
export interface LayerListResponse {
  status: string;
  data: {
    theme: string;
    layers: LayerItem[];
    manifest: Manifest;
    lottie?: string;
  };
}

/**
 * 테마 목록 응답 타입
 */
export interface ThemeListResponse {
  status: string;
  data: {
    themes: string[];
  };
}

/**
 * 게임 진행 상태 타입
 */
export type GameStatus = 'idle' | 'loading' | 'playing' | 'success' | 'failed';
