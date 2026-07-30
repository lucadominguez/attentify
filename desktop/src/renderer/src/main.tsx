import React from 'react'
import ReactDOM from 'react-dom/client'

// Fonts are SELF-HOSTED on purpose. globals.css used to @import them from Google,
// which never worked: index.html's CSP allows font-src 'self' data: and style-src
// 'self' 'unsafe-inline', so both the remote stylesheet and the font files were
// blocked. Inter and Share Tech Mono silently fell back to system-ui and Consolas
// for the app's whole life (measurable: canvas measureText for "Inter" matched a
// nonexistent family exactly). Importing from node_modules lets Vite emit the woff2
// as local assets, which satisfies the CSP and removes a render-blocking network
// request from an app that starts with the OS.
//
// Weights are enumerated rather than wildcarded so the bundle carries only what the
// UI actually uses. Families mirror the website (Inter / Space Grotesk / JetBrains
// Mono) so the product reads as one brand across the site and the app.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
