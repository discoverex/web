import { API_BASE_URL } from '../consts/API_BASE_URL'

export interface ScoreData {
  game_id: string
  game_type: string
  score: number
}

export async function submitScore(data: ScoreData) {
  try {
    const response = await fetch(`${API_BASE_URL}/scores/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to submit score: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting score:', error)
    throw error
  }
}
