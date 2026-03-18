import { apiClient, auth } from '@repo/ui/auth'

export interface ScoreData {
  game_id: string;
  game_type: string;
  score: number;
}

export async function submitScore(data: ScoreData) {
  try {
    // 1. Firebase Auth 또는 세션 스토리지에서 토큰 확인 (apiClient가 자동으로 처리하지만 로그를 찍음)
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken() : null;
    const ssoToken = typeof window !== 'undefined' ? window.sessionStorage.getItem('sso_token') : null;

    console.log('[ScoreService] Submitting score with:', {
      hasFirebaseUser: !!currentUser,
      hasIdToken: !!idToken,
      hasSSOToken: !!ssoToken,
      gameId: data.game_id,
      score: data.score
    });

    const response = await apiClient.post('/scores/', data)
    
    console.log('[ScoreService] Success:', response.data);
    return response.data
  } catch (error: any) {
    if (error.response) {
      // 서버가 응답을 반환한 경우 (4xx, 5xx)
      console.error('[ScoreService] Server Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // 요청이 전송되었으나 응답을 받지 못한 경우 (CORS, Network Error 등)
      console.error('[ScoreService] No Response Received (Network/CORS):', error.request);
    } else {
      console.error('[ScoreService] Error Setup:', error.message);
    }
    throw error
  }
}
