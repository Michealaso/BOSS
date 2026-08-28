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
          <div className="footer-title">Demo</div>
          <span>Local MVP mode</span>
          <span>No paid services required</span>
          <span>Ready for backend integration</span>
        </div>
      </div>
      <div className="container footer-bottom">© 2026 BOSS MVP · Built as a launch-ready starter.</div>
    </footer>
  );
}
