import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import LogEntry from './pages/LogEntry'
import Charts from './pages/Charts'
import WeeklyView from './pages/WeeklyView'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log" element={<LogEntry />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/weekly" element={<WeeklyView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}
