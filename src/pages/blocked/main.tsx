import React from 'react'
import ReactDOM from 'react-dom/client'
import BlockedPage from './BlockedPage'
import '../../../styles.css'
import { getCurrentTheme, applyTheme } from '../../shared/themes'

getCurrentTheme().then(theme => {
  applyTheme(theme)
  const Surface = theme.surfaces?.blocked ?? BlockedPage
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Surface />
    </React.StrictMode>
  )
})
