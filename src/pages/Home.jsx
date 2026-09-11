import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Check, Globe, MessageSquareText, ShieldCheck, Sparkles, Zap, Layers3, Clock3 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { websites } from '../data/products';

export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow pill"><Sparkles size={14}/> One place to launch your business online</div>
          <h1>Build the online presence your business <span>actually needs.</span></h1>
          <p className="hero-lead">Start with a polished website, add an AI assistant, and move into a complete business setup without the usual agency back-and-forth.</p>
          <div className="hero-actions">
            <Link className="primary-button large" to="/start">Build with BOSS <ArrowRight size={17}/></Link>
            <Link className="secondary-button large" to="/websites">Explore websites <Globe size={17}/></Link>
          </div>
          <div className="trust-row">
            <span><Check size={15}/> Mobile-first</span>
            <span><Check size={15}/> Live previews</span>
            <span><Check size={15}/> Clear checkout</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="BOSS product preview">
          <div className="hero-glow" />
          <div className="floating-card card-one"><Globe size={18}/><span>Business site</span><strong>Live</strong></div>
          <div className="showcase-window">
            <div className="window-top"><span/><span/><span/><em>your-business.boss</em></div>
            <div className="showcase-content">
              <div className="showcase-badge">BOSS WORKSPACE</div>
              <h3>Everything your customer sees, in one place.</h3>
              <p>Website, assistant and business actions designed to work together.</p>
              <div className="showcase-actions"><Link to="/start">Start building</Link><Link to="/websites">See templates →</Link></div>
              <div className="showcase-grid"><span/><span/><span/><span/></div>
            </div>
          </div>
          <div className="floating-card card-two"><MessageSquareText size={18}/><div><strong>AI assistant</strong><span>Ready for conversations</span></div><i className="status-dot"/></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div><div className="eyebrow">Start with something proven</div><h2>Featured websites</h2></div>
          <Link className="text-link" to="/websites">View all <ArrowRight size={15}/></Link>
        </div>
        <div className="product-grid">{websites.slice(0, 3).map(p => <ProductCard key={p.id} product={p}/>)}</div>
      </section>

      <section className="dark-section">
        <div className="container split-section">
          <div>
            <div className="eyebrow light">A smarter customer experience</div>
            <h2>Let the website start the conversation.</h2>
            <p>Pair a polished site with an assistant that can handle common questions, guide visitors and capture the next step.</p>
            <div className="check-list">
              <div><Check/> FAQ and product answers</div>
              <div><Check/> Lead capture</div>
              <div><Check/> Booking and sales journeys</div>
            </div>
            <Link className="secondary-button light-button" to="/chatbots">Explore chatbots <ArrowRight size={16}/></Link>
          </div>
          <div className="chat-preview">
            <div className="chat-header"><span className="status-dot"/> BOSS Assistant <small>Online</small></div>
            <div className="chat-msg bot">Hi! 👋 What can I help you with?</div>
            <div className="chat-msg user">I want to know your services.</div>
            <div className="chat-msg bot">Absolutely. I can explain the options and help you choose the right one.</div>
            <div className="chat-input">Type a message… <span>Send</span></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div><div className="eyebrow">Designed around the business</div><h2>From first click to next customer.</h2></div>
        </div>
        <div className="benefit-grid">
          <div className="benefit"><div className="benefit-icon"><Layers3/></div><h3>One connected setup</h3><p>Website, AI and business actions can live inside the same workspace.</p></div>
          <div className="benefit"><div className="benefit-icon"><Zap/></div><h3>Built to move fast</h3><p>Start from a strong foundation instead of rebuilding the basics every time.</p></div>
          <div className="benefit"><div className="benefit-icon"><Clock3/></div><h3>Keep improving</h3><p>Launch the essentials first, then expand as your business grows.</p></div>
        </div>
      </section>

      <section className="section container">
        <div className="boss-cta-panel">
          <div>
            <div className="eyebrow">Ready when you are</div>
            <h2>Tell BOSS what you need. We’ll take it from there.</h2>
            <p>Describe your business, goals and style. Your request moves into the BOSS workspace for the next step.</p>
          </div>
          <Link className="primary-button large" to="/start">Start your build <ArrowRight size={17}/></Link>
        </div>
      </section>
    </>
  );
}
