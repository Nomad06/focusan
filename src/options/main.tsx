import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../styles.css'
import { getCurrentTheme, applyTheme } from '../shared/themes'
import { ToastProvider } from '../shared/components/Toast'

getCurrentTheme().then(theme => {
  applyTheme(theme)
  const Surface = theme.surfaces?.options ?? App
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ToastProvider>
        <Surface />
      </ToastProvider>
    </React.StrictMode>
  )
})
