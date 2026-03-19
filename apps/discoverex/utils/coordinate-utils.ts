import { BBox } from '../types/game';

/**
 * 클릭한 좌표가 BBox 범위 내에 있는지 확인합니다.
 */
export const isPointInBBox = (
  x: number, 
  y: number, 
  bbox: BBox
): boolean => {
  return (
    x >= bbox.x &&
    x <= bbox.x + bbox.w &&
    y >= bbox.y &&
    y <= bbox.y + bbox.h
  );
};

/**
 * 화면(DOM) 좌표를 원본 이미지 좌표계로 변환합니다.
 */
export const getScaledCoordinates = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  originalWidth: number,
  originalHeight: number
) => {
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const scaleX = originalWidth / rect.width;
  const scaleY = originalHeight / rect.height;

  return {
    x: x * scaleX,
    y: y * scaleY
  };
};
