import { API_BASE_URL } from '@/consts/API_BASE_URL';
import { Theme, ThemeListResponse, ThemeResponse } from '@/types/game';

export const getThemes = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/discoverex/themes`);
    const { data }: ThemeListResponse = await res.json();

    return data.themes ? data.themes : [];
  } catch (err) {
    console.error('테마 목록을 불러오기 실패:', err);
    return [];
  }
};

export const getTheme = async (themeName: string): Promise<Theme | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/discoverex/themes/${themeName}/layers`);
    const { data }: ThemeResponse = await res.json();
    return data;
  } catch (err) {
    console.error('테마 불러오기 실패:', err);
    return null;
  }
};
