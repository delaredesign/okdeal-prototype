import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { AgreementSummary, listAgreements } from '../lib/agreements'
import { supabase } from '../lib/supabase'

export function DashboardPage() {
 const [items,setItems]=useState<AgreementSummary[]>([]); const [message,setMessage]=useState('Loading your OKDeals…')
 useEffect(()=>{listAgreements().then(rows=>{setItems(rows);setMessage(rows.length?'':'No OKDeals yet.')}).catch(()=>setMessage('We could not load your OKDeals. Please try again.'))},[])
 return <div className="create-page"><header className="create-header"><Brand/><div><Link to="/create">Create OKDeal</Link><button className="text-button" onClick={()=>supabase.auth.signOut()}>Sign out</button></div></header><main className="dashboard"><div className="dashboard-heading"><div><p className="eyebrow">CREATOR DASHBOARD</p><h1>Your OKDeals.</h1><p>Every revision and response is preserved in its activity history.</p></div><Link className="button" to="/create">Create an OKDeal <span>→</span></Link></div>{message && <div className="empty-state">{message}</div>}<div className="deal-list">{items.map(item=>{const version=item.agreement_versions[0];return <Link className="deal-list-item" to={`/agreements/${item.id}`} key={item.id}><div><span className="deal-id">{item.okdeal_id}</span><h2>{version?.title}</h2><p>For {item.intended_recipient_name}</p></div><div className="deal-list-meta"><strong>{new Intl.NumberFormat('en-MY',{style:'currency',currency:version?.currency||'MYR'}).format((version?.amount_minor||0)/100)}</strong><span>{item.status.replaceAll('_',' ')}</span></div></Link>})}</div></main></div>
}
