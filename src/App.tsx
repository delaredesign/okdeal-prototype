import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CreateDealPage } from './pages/CreateDealPage'
import { LandingPage } from './pages/LandingPage'
import { PreviewDealPage } from './pages/PreviewDealPage'
import { initialDraft } from './domain/draft'

export default function App() {
  const [draft, setDraft] = useState(initialDraft)
  const [reviewed, setReviewed] = useState(false)

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/create" element={<CreateDealPage draft={draft} onChange={(value) => { setDraft(value); setReviewed(false) }} onPreview={() => setReviewed(true)} />} />
      <Route path="/preview" element={reviewed ? <PreviewDealPage draft={draft} /> : <Navigate to="/create" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
