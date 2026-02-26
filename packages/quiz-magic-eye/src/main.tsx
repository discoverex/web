import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MagicEyeQuiz from './MagicEyeQuiz.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MagicEyeQuiz />
  </StrictMode>,
)
