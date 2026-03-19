import { PlayableLayer, LayerItem } from '../types/game';

/**
 * 레이어의 image_ref 파일명을 기반으로 실제 GCS URL을 매칭합니다.
 */
export const getLayerImageUrl = (
  layer: PlayableLayer,
  availableLayers: LayerItem[]
): string => {
  // 1. image_ref에서 파일명만 추출 (예: 'abc.object.png')
  const refPathParts = layer.image_ref.split('/');
  const refFileName = refPathParts[refPathParts.length - 1].toLowerCase();
  
  if (!refFileName) return '';

  // 2. 이용 가능한 레이어 목록에서 해당 파일명이 포함된 URL 찾기
  const matched = availableLayers.find(l => {
    const name = l.name.toLowerCase();
    // 파일명이 정확히 일치하거나 포함되어 있는지 확인
    return name === refFileName || name.includes(refFileName) || refFileName.includes(name);
  });

  if (matched) return matched.url;

  // 3. (Fallback) 레이어 ID 기반 매칭 시도
  const targetId = layer.layer_id.toLowerCase().replace('layer-', '');
  const fallbackMatched = availableLayers.find(l => l.name.toLowerCase().includes(targetId));

  return fallbackMatched ? fallbackMatched.url : '';
};
