export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Region {
  region_id: 'r-e2e06a3c05';
  bbox: BBox;
  role: 'answer' | 'candidate';
}

export interface ThemeListResponse {
  status: string;
  data: {
    themes: string[];
  };
}

export interface Layer {
  layer_id: string;
  type: 'base' | 'inpaint_patch' | 'composite' | 'fx_overlay';
  image_ref: string;
  bbox: BBox;
  z_index: number;
  order: number;
  source_region_id: string | null;
}

export interface Playable {
  image_ref: string;
  width: number;
  height: number;
  layers: Layer[];
  goal_text: string;
  hints: { key: 'region_count'; value: '2' }[];
  ui_flags: {
    show_region_count_hint: boolean;
    allow_multi_click: boolean;
  };
}

interface AnswerKey {
  answer_region_ids: string[];
  regions: Region[];
}

export interface Manifest {
  scene_ref: {
    scene_id: string;
    version_id: string;
  };
  playable: Playable;
  answer_key: AnswerKey;
}

export interface LayerItem {
  name: string;
  url: string;
}

export interface Theme {
  theme: string;
  layers: LayerItem[];
  manifest: Manifest;
  lottie: string;
}

export interface ThemeResponse {
  status: string;
  data: Theme;
}
