import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'
import type { DealDraft } from './CreateDealPage'

type PreviewDealPageProps = { draft: DealDraft }

const date = (value: string) => new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const money = (value: string) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(Number(value || 0))

export function PreviewDealPage({ draft }: PreviewDealPageProps) {
  const [notice, setNotice] = useState(false)
  const navigate = useNavigate()
  return <div className="preview-page"><header className="create-header"><Brand /><div><span className="save-state">Preview · not created</span><Link to="/">Exit</Link></div></header><main className="preview-main"><aside className="preview-sidebar"><button className="back-link preview-edit" onClick={() => navigate('/create')}>← Edit draft</button><p className="eyebrow">REVIEW YOUR OKDEAL</p><h1>Check every<br />detail.</h1><p>This is the version the recipient would receive. Nothing is created or shared until you confirm it.</p><div className="privacy-note"><span>✦</span><p>Creation, sharing, and version history are intentionally not active in this prototype.</p></div></aside><section className="preview-content">{notice && <div className="draft-notice" role="status"><strong>Agreement creation is not active yet.</strong> This preview is intentionally read-only while the versioned creation workflow is being built.</div>}<article className="agreement-preview"><div className="preview-top"><span>OKDeal · draft preview</span><span>Version 0</span></div><div className="agreement-heading"><p className="eyebrow">WORK / SERVICE AGREEMENT</p><h2>{draft.title}</h2><p>This agreement sets out the work and terms agreed between the parties below.</p></div><section className="preview-section"><h3>Parties</h3><div className="party-grid"><div><span>Creator</span><strong>You (creator)</strong></div><div><span>Intended recipient</span><strong>{draft.recipientName}</strong><small>{draft.recipientEmail}{draft.phone ? ` · ${draft.phone}` : ''}</small></div></div></section><section className="preview-section"><h3>Work</h3><p className="agreement-text">{draft.description}</p></section><section className="preview-section"><h3>Terms</h3><dl className="terms-grid"><div><dt>Agreement amount</dt><dd>{money(draft.amount)}</dd></div><div><dt>Start date</dt><dd>{date(draft.startDate)}</dd></div><div><dt>Completion date</dt><dd>{date(draft.completionDate)}</dd></div><div><dt>Payment terms</dt><dd>{draft.paymentTerms}</dd></div></dl></section>{draft.additionalTerms && <section className="preview-section"><h3>Additional terms</h3><p className="agreement-text">{draft.additionalTerms}</p></section>}<div className="preview-stamp">DRAFT · NOT YET AGREED OR SIGNED</div></article><div className="preview-actions"><p>Review the agreement carefully. You can return to edit it before it is created.</p><button className="button" onClick={() => setNotice(true)}>Create draft <span>→</span></button></div></section></main></div>
}

