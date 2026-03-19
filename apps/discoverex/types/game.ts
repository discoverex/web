export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Region {
  region_id: string;
  bbox: BBox;
  role: string;
}

export interface PlayableLayer {
  layer_id: string;
  type: string;
  image_ref: string;
  bbox: BBox | null;
  z_index: number;
  order: number;
  source_region_id: string | null;
}

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

export interface LayerListResponse {
  status: string;
  data: {
    theme: string;
    layers: Array<{ name: string; url: string }>;
    manifest: any;
    lottie: string;
  };
}
