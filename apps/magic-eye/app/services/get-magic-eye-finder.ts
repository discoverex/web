import { WrappedResponse } from '@/types/common';
import { MagicEyeFinderResponse } from '@/app/types';

/**
 * 백엔드로부터 특정 레벨의 모델 서명 URL을 가져옵니다.
 */
export const getModelInfo = async (level: number): Promise<MagicEyeFinderResponse> => {
  const modelFilename = `ai_lv${level}.onnx`;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/magic-eye/model?model_filename=${modelFilename}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`모델 URL을 가져오는데 실패했습니다: ${response.statusText}`);
  }

  const result: WrappedResponse<MagicEyeFinderResponse> = await response.json();

  if (!result.data) throw new Error(result.message || '모델 데이터가 없습니다.');

  return result.data;
};
