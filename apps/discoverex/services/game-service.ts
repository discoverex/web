import { API_BASE_URL } from '../consts/API_BASE_URL';
import { ThemeListResponse, LayerListResponse } from '../types/game';

export const GameService = {
  /**
   * 테마 목록을 조회합니다.
   */
  async fetchThemes(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/discoverex/themes`);
      const data: ThemeListResponse = await res.json();
      if (data.status === 'success') {
        return data.data.themes;
      }
      return [];
    } catch (err) {
      console.error('[GameService] fetchThemes Error:', err);
      throw err;
    }
  },

  /**
   * 특정 테마의 상세 레이어 정보를 조회합니다.
   */
  async fetchThemeLayers(themeName: string): Promise<LayerListResponse['data']> {
    try {
      const res = await fetch(`${API_BASE_URL}/discoverex/themes/${themeName}/layers`);
      const data: LayerListResponse = await res.json();
      if (data.status === 'success') {
        return data.data;
      }
      throw new Error('Failed to fetch layer data');
    } catch (err) {
      console.error(`[GameService] fetchThemeLayers Error (${themeName}):`, err);
      throw err;
    }
  }
};
