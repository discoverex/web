export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Region {
  region_id: string;
  geometry: {
    type: string;
    bbox: BBox;
    mask_ref: string | null;
    z_index: number;
  };
  role: 'answer' | 'candidate';
  source: string;
  attributes: {
    object_image_ref: string;
    object_mask_ref: string;
    patch_image_ref: string;
    composited_image_ref: string;
    [key: string]: any;
  };
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

export interface LayerListResponse {
  status: string;
  data: {
    theme: string;
    layers: Array<{ name: string; url: string }>;
  };
}
