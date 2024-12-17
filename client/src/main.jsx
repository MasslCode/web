 /*to start server, run "npm run dev" in client folder*/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/index.css'
import Home from './pages/Home.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home />
  </StrictMode>,
)
