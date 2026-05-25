import React from 'react'
import ReactDOM from 'react-dom/client'
import DiagnosticsPage from './DiagnosticsPage'
import { initializeTheme } from '../../shared/themes'
import { ToastProvider } from '../../shared/components/Toast'
import '../../../styles.css'

// Initialize theme before rendering
initializeTheme().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ToastProvider>
        <DiagnosticsPage />
      </ToastProvider>
    </React.StrictMode>
  )
})
