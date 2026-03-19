import { PlayableLayer, LayerListResponse } from '../types/game';

/**
 * 레이어 ID를 실제 클라우드 스토리지(GCS) URL과 매칭합니다.
 */
export const getImageUrl = (layer: PlayableLayer, layers: LayerListResponse['data']['layers'], manifest: LayerListResponse['data']['manifest']): string => {
  const targetId = layer.layer_id.toLowerCase();
  const shortId = targetId.replace('layer-', '');

  // A. 레이어 ID 기반 매칭 (가장 정확함)
  const matchedById = layers.find(l => {
    const name = l.name.toLowerCase();
    return name.includes(targetId) || name.includes(shortId);
  });
  if (matchedById) return matchedById.url;

  // B. 매니페스트 경로 기반 매칭
  const manifestLayer = manifest.layers?.find(ml => ml.layer_id === layer.layer_id);
  if (manifestLayer) {
    const fileName = manifestLayer.path.split('/').pop()?.toLowerCase() || '';
    if (fileName) {
      const matchedByPath = layers.find(l => l.name.toLowerCase().includes(fileName));
      if (matchedByPath) return matchedByPath.url;
    }
  }

  // C. 원본 image_ref 파일명 기반 매칭 (최후의 수단)
  const refFileName = layer.image_ref.split('/').pop()?.toLowerCase() || '';
  if (refFileName && !refFileName.includes('tmp')) {
    const matchedByRef = layers.find(l => l.name.toLowerCase().includes(refFileName));
    if (matchedByRef) return matchedByRef.url;
  }

  console.warn(`[ImageUtils] Mapping failed for layer: ${layer.layer_id}`);
  return '';
};

/**
 * 특정 영역(정답 아이템)의 썸네일 URL을 가져옵니다.
 */
export const getThumbnailUrl = (regionId: string, gameData: LayerListResponse['data']): string => {
  const { manifest, layers } = gameData;
  const bundle = manifest.delivery_bundle;
  const layer = bundle.playable.layers.find(l => l.source_region_id === regionId);
  if (!layer) return '';
  return getImageUrl(layer, layers, manifest);
};
