export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Region {
  region_id: 'r-e2e06a3c05';
  bbox: BBox;
  role: 'answer' | 'candidate';
}

export interface LayerItem {
  layer_id: string;
  type: string;
  image_ref: string;
  bbox: BBox | null;
  z_index: number;
  order: number;
  source_region_id: string | null;
}

export interface GameMetadata {
  meta: {
    scene_id: string;
    [key: string]: any;
  };
  background: {
    asset_ref: string;
    width: number;
    height: number;
  };
  regions: Region[];
  layers: {
    items: LayerItem[];
  };
  answer: {
    answer_region_ids: string[];
  };
}

export interface ThemeListResponse {
  status: string;
  data: {
    themes: string[];
  };
}

interface Layer {
  layer_id: string;
  type: 'base' | 'inpaint_patch' | 'composite' | 'fx_overlay';
  image_ref: string;
  bbox: null;
  z_index: number;
  order: number;
  source_region_id: string | null;
}

interface Playable {
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

export interface Theme {
  theme: string;
  layers: { name: string; url: string }[];
  manifest: {
    scene_ref: {
      scene_id: string;
      version_id: string;
    };
    playable: Playable;
    answer_key: AnswerKey;
  };
}

export interface ThemeResponse {
  status: string;
  data: Theme;
}
