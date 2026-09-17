import { FormEvent, type ChangeEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Brand'

import { type DealDraft, type DraftErrors, validateDraft } from '../domain/draft'
export type { DealDraft } from '../domain/draft'

type CreateDealPageProps = { draft: DealDraft; onChange: (draft: DealDraft) => void; onPreview: () => void }

export function CreateDealPage({ draft, onChange, onPreview }: CreateDealPageProps) {
  const form = draft
  const [errors, setErrors] = useState<DraftErrors>({})
  const navigate = useNavigate()
  const update = (field: keyof DealDraft) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...form, [field]: event.target.value })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = validateDraft(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onPreview()
    navigate('/preview')
    window.scrollTo(0, 0)
  }
  return <div className="create-page"><header className="create-header"><Brand /><div><span className="save-state">Draft · clears on refresh</span><Link to="/">Exit</Link></div></header><main className="create-main"><div className="form-intro"><Link className="back-link" to="/">← Back to home</Link><p className="eyebrow">NEW OKDEAL</p><h1>Put the work<br />in writing.</h1><p>Start with the details you both need to be clear on. You’ll review everything before creating the agreement.</p><div className="privacy-note"><span>✦</span><p>Only request the information needed for this agreement. Recipient contact details are used to address the OKDeal—not to prove legal identity.</p></div></div><form className="deal-form" onSubmit={submit}>
    {Object.keys(errors).length > 0 && <div className="draft-notice" role="alert"><strong>Please check these details:</strong><ul>{Object.entries(errors).map(([field, message]) => <li key={field}>{field.replace(/([A-Z])/g, " $1")}: {message}</li>)}</ul></div>}
    <fieldset><legend><span>01</span> Who is this for?</legend><p className="fieldset-help">Enter the intended recipient’s details. They will confirm themselves when they open the agreement.</p><div className="form-grid"><label>Recipient name<input required value={form.recipientName} onChange={update('recipientName')} placeholder="e.g. Aisha Ahmad" /></label><label>Recipient email<input type="email" required value={form.recipientEmail} onChange={update('recipientEmail')} placeholder="aisha@example.com" /></label><label className="full-width">Phone <small>Optional</small><input type="tel" value={form.phone} onChange={update('phone')} placeholder="e.g. +60 12 345 6789" /></label></div></fieldset>
    <fieldset><legend><span>02</span> What is the work?</legend><div className="form-grid"><label className="full-width">Work or service title<input required value={form.title} onChange={update('title')} placeholder="e.g. Brand identity design" /></label><label className="full-width">Description<textarea required value={form.description} onChange={update('description')} placeholder="Describe the scope, deliverables, and expectations." rows={4} /></label></div></fieldset>
    <fieldset><legend><span>03</span> Terms and timing</legend><div className="form-grid"><label>Amount<div className="amount-input"><span>MYR</span><input required inputMode="decimal" value={form.amount} onChange={update('amount')} placeholder="0.00" aria-label="Amount in MYR" /></div></label><label>Currency<select aria-label="Currency" defaultValue="MYR" disabled><option>MYR (RM)</option></select></label><label>Start date<input type="date" required value={form.startDate} onChange={update('startDate')} /></label><label>Completion date<input type="date" required min={form.startDate || undefined} value={form.completionDate} onChange={update('completionDate')} /></label><label className="full-width">Payment terms<textarea required value={form.paymentTerms} onChange={update('paymentTerms')} placeholder="e.g. 50% upfront, balance on delivery." rows={3} /></label><label className="full-width">Additional terms <small>Optional</small><textarea value={form.additionalTerms} onChange={update('additionalTerms')} placeholder="Add any other terms you both agree on." rows={3} /></label></div></fieldset>
    <div className="form-actions"><p>Next, you’ll review a complete agreement before it is created.</p><button className="button" type="submit">Review agreement <span>→</span></button></div>
  </form></main></div>
}
