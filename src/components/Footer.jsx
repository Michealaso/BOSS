import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand"><span className="brand-mark">✦</span> BOSS</div>
          <p className="muted">Websites and AI assistants for businesses, delivered without the heavy agency process.</p>
        </div>
        <div>
          <div className="footer-title">Marketplace</div>
          <Link to="/websites">Websites</Link>
          <Link to="/chatbots">Chatbots</Link>
          <Link to="/dashboard">Customer dashboard</Link>
        </div>
        <div>
          <div className="footer-title">Why BOSS</div>
          <span>Mobile-ready builds</span>
          <span>Fast setup and delivery</span>
          <span>Secure online payments</span>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 BOSS · Built for practical business launches.</div>
    </footer>
  );
}
