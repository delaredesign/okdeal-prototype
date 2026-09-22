import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import type { DealDraft } from './CreateDealPage'
import { createAgreement } from '../lib/agreements'

type PreviewDealPageProps = { draft: DealDraft; onCreated: () => void }

const date = (value: string) => new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const money = (value: string) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(Number(value || 0))

export function PreviewDealPage({ draft, onCreated }: PreviewDealPageProps) {
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function create(){setBusy(true);setNotice('');try{const result=await createAgreement(draft);onCreated();navigate('/created',{state:{okdealId:result.okdeal_id,shareToken:result.share_token},replace:true})}catch{setNotice('We could not create this OKDeal. Your draft has not been changed. Please try again.')}finally{setBusy(false)}}
  return <div className="preview-page"><header className="create-header"><Brand /><div><span className="save-state">Preview · not created</span><Link to="/dashboard">Exit</Link></div></header><main className="preview-main"><aside className="preview-sidebar"><button className="back-link preview-edit" onClick={() => navigate('/create')}>← Edit draft</button><p className="eyebrow">REVIEW YOUR OKDEAL</p><h1>Check every<br />detail.</h1><p>This is the version the recipient will receive. Nothing is saved or shared until you confirm it.</p><div className="privacy-note"><span>✦</span><p>Once created, Version 1 is preserved. Future changes will create a new version instead of overwriting it.</p></div></aside><section className="preview-content">{notice && <div className="draft-notice" role="alert">{notice}</div>}<article className="agreement-preview"><div className="preview-top"><span>OKDeal · draft preview</span><span>Version 1</span></div><div className="agreement-heading"><p className="eyebrow">WORK / SERVICE AGREEMENT</p><h2>{draft.title}</h2><p>This agreement sets out the work and terms proposed between the parties below.</p></div><section className="preview-section"><h3>Parties</h3><div className="party-grid"><div><span>Creator</span><strong>You (creator)</strong></div><div><span>Intended recipient</span><strong>{draft.recipientName}</strong><small>{draft.recipientEmail}{draft.phone ? ` · ${draft.phone}` : ''}</small></div></div></section><section className="preview-section"><h3>Work</h3><p className="agreement-text">{draft.description}</p></section><section className="preview-section"><h3>Terms</h3><dl className="terms-grid"><div><dt>Agreement amount</dt><dd>{money(draft.amount)}</dd></div><div><dt>Start date</dt><dd>{date(draft.startDate)}</dd></div><div><dt>Completion date</dt><dd>{date(draft.completionDate)}</dd></div><div><dt>Payment terms</dt><dd>{draft.paymentTerms}</dd></div></dl></section>{draft.additionalTerms && <section className="preview-section"><h3>Additional terms</h3><p className="agreement-text">{draft.additionalTerms}</p></section>}<div className="preview-stamp">DRAFT · NOT YET AGREED OR SIGNED</div></article><div className="preview-actions"><p>Review carefully. Creating preserves this as Version 1 and generates a private share link.</p><button className="button" disabled={busy} onClick={create}>{busy?'Creating…':'Create OKDeal'} <span>→</span></button></div></section></main></div>
}
