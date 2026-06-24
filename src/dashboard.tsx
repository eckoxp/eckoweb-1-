import { createRoot } from 'react-dom/client'
import './index.css'
import DashboardApp from './DashboardApp.tsx'

createRoot(document.getElementById('dashboard')!).render(<DashboardApp />)
