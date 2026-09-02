import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import VenueList from './pages/VenueList'
import VenueDetail from './pages/VenueDetail'
import LogVisit from './pages/LogVisit'
import MapPage from './pages/MapPage'
import Setup from './pages/Setup'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<VenueList />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/log" element={<LogVisit />} />
        <Route path="/venues/:id" element={<VenueDetail />} />
        <Route path="/venues/:id/log" element={<LogVisit />} />
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </Layout>
  )
}
