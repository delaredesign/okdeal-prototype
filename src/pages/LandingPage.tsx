import { Link } from 'react-router-dom'
import { HowItWorksLink } from '../components/HowItWorksLink'
import { Header } from '../components/Header'

const steps = [
  ['Create', 'Set out the work, amount, dates, and terms in one clear agreement.'],
  ['Review', 'Share a private link so both people can read the same version.'],
  ['Agree', 'Resolve changes openly, with every version kept on record.'],
  ['Sign', 'Confirm the final terms and preserve the completed agreement.'],
]

export function LandingPage() {
  return <><Header /><main>
    <section className="hero"><div className="container hero-grid"><div><p className="eyebrow">WORK AGREEMENTS, MADE SIMPLE</p><h1>Make the deal<br /><em>official.</em></h1><p className="hero-copy">A calm, shared place to put work agreements in writing—before the work begins.</p><div className="hero-actions"><Link className="button" to="/create">Create an OKDeal <span>→</span></Link><HowItWorksLink className="text-link">See how it works</HowItWorksLink></div><p className="microcopy">No account needed for recipients.</p></div><div className="agreement-card" aria-label="Example agreement summary"><div className="card-top"><span className="status-dot"></span><span>Draft agreement</span><span className="card-id">OKD-2026-041</span></div><h2>Website design services</h2><div className="agreement-row"><span>Between</span><strong>Rina Lee · Amir Rahman</strong></div><div className="agreement-row"><span>Amount</span><strong>RM 3,500.00</strong></div><div className="agreement-row"><span>Completion</span><strong>30 October 2026</strong></div><div className="agreement-footer"><span>1 shared version</span><span>View agreement →</span></div></div></div></section>
    <section className="trust-band"><div className="container"><p>Clear terms. Shared ownership. A record you can return to.</p></div></section>
    <section className="steps-section" id="how-it-works" tabIndex={-1}><div className="container"><p className="eyebrow">HOW OKDEAL WORKS</p><div className="section-heading"><h2>From handshake to<br />shared record.</h2><p>Keep the conversation human. Make the agreement clear.</p></div><div className="steps">{steps.map(([title, text], index) => <article className="step" key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="closing"><div className="container"><p className="eyebrow">START WITH CLARITY</p><h2>A better beginning<br />for every job.</h2><Link className="button button-light" to="/create">Create an OKDeal <span>→</span></Link></div></section>
  </main><footer><div className="container"><span>© 2026 OKDeal</span><span>Make the deal official.</span></div></footer></>
}
