export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ThemeListResponse {
  status: string;
  data: {
    themes: string[];
  };
}

export interface BackgroundImage {
  image_id: string;
  src: string;
  prompt: string;
  width: number;
  height: number;
}

interface Answer {
  lottie_id: string;
  name: string;
  src: string; // 파일명
  bbox: BBox;
  prompt: string;
  title: string;
  order: number;
}

export interface Manifest {
  scene_ref: {
    title: string;
    scene_id: string;
    version_id: string;
  };
  background_img: BackgroundImage;
  answers: Answer[];
}

export interface LayerItem {
  name: string;
  url: string;
}

export interface Theme {
  theme: string;
  layers: LayerItem[];
  manifest: Manifest;
}

export interface ThemeResponse {
  status: string;
  data: Theme;
}
