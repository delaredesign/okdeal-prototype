import { Link } from 'react-router-dom'
import { HowItWorksLink } from './HowItWorksLink'
import { Brand } from './Brand'

export function Header() {
  return <header className="site-header"><div className="container nav"><Brand /><nav aria-label="Main navigation"><HowItWorksLink>How it works</HowItWorksLink><Link to="/account">Sign in</Link><Link className="button button-small" to="/create">Create an OKDeal</Link></nav></div></header>
}
