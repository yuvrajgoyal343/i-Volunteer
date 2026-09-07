import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Import all CSS (preserving original styles)
import './css/base.css'
import './css/layout.css'
import './css/components.css'
import './css/responsive.css'
import './css/login.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
