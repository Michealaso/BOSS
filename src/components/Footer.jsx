import { Link } from 'react-router-dom';
import { ArrowUpRight, Bot, Globe, Sparkles } from 'lucide-react';
import BrandIcon from './BrandIcon';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/" aria-label="BOSS home">
            <span className="brand-mark"><BrandIcon size={21} /></span>
            <span>BOSS</span>
          </Link>
          <p className="muted">A practical place to launch, manage and improve the digital side of your business.</p>
          <Link className="footer-cta" to="/start">Start a project <ArrowUpRight size={14}/></Link>
        </div>

        <div>
          <div className="footer-title">Explore</div>
          <Link to="/websites"><Globe size={13}/> Websites</Link>
          <Link to="/chatbots"><Bot size={13}/> AI assistants</Link>
          <Link to="/start"><Sparkles size={13}/> Build with BOSS</Link>
        </div>

        <div>
          <div className="footer-title">Workspace</div>
          <Link to="/login">Sign in</Link>
          <Link to="/dashboard">Customer dashboard</Link>
        </div>

        <div>
          <div className="footer-title">Why BOSS</div>
          <span>Polished, mobile-ready builds</span>
          <span>Clear project workflow</span>
          <span>Secure online payments</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 BOSS. Built for practical business launches.</span>
        <span>Website · AI · Business setup</span>
      </div>
    </footer>
  );
}
