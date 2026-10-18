import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.jsx'
import store from './store'

// Import all CSS (preserving original styles)
import './css/base.css'
import './css/layout.css'
import './css/components.css'
import './css/responsive.css'
import './css/login.css'
import './css/theme.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
