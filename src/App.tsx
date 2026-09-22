import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CreateDealPage } from './pages/CreateDealPage'
import { LandingPage } from './pages/LandingPage'
import { PreviewDealPage } from './pages/PreviewDealPage'
import { initialDraft } from './domain/draft'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreatedDealPage } from './pages/CreatedDealPage'
import { RecipientDealPage } from './pages/RecipientDealPage'
import { supabase } from './lib/supabase'
import { AgreementDetailPage } from './pages/AgreementDetailPage'
import type { Session } from '@supabase/supabase-js'

export default function App() {
  const [draft, setDraft] = useState(initialDraft)
  const [reviewed, setReviewed] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  useEffect(() => { supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthReady(true)}); const {data}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next)); return ()=>data.subscription.unsubscribe() }, [])
  const protectedPage = (page: React.ReactNode, from: string) => !authReady ? <div className="page-loading">Loading…</div> : session ? page : <Navigate to="/account" state={{from}} replace />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/account" element={session ? <Navigate to="/dashboard" replace/> : <AuthPage />} />
      <Route path="/dashboard" element={protectedPage(<DashboardPage/>, '/dashboard')} />
      <Route path="/agreements/:id" element={protectedPage(<AgreementDetailPage/>, '/dashboard')} />
      <Route path="/create" element={protectedPage(<CreateDealPage draft={draft} onChange={(value) => { setDraft(value); setReviewed(false) }} onPreview={() => setReviewed(true)} />, '/create')} />
      <Route path="/preview" element={protectedPage(reviewed ? <PreviewDealPage draft={draft} onCreated={()=>setDraft(initialDraft)} /> : <Navigate to="/create" replace />, '/preview')} />
      <Route path="/created" element={protectedPage(<CreatedDealPage/>, '/created')} />
      <Route path="/d/:token" element={<RecipientDealPage/>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
