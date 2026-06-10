/**
 * main.jsx
 *
 * Application entry point.
 * Sets up React root, BrowserRouter, and global styles.
 *
 * Note: HashRouter is used instead of BrowserRouter because GitHub Pages
 * doesn't support server-side routing — all routes must be handled client-side.
 * With HashRouter, URLs look like: yoursite.com/#/leaderboard
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
