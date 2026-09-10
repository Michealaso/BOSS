import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Check, Globe, MessageSquareText, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { websites, chatbots } from '../data/products';

export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow pill"><Sparkles size={14}/> Launch your business online</div>
          <h1>Get a website and AI assistant <span>without the agency headache.</span></h1>
          <p className="hero-lead">Choose a ready-made business website, try it live, or add an AI chatbot that can answer customers and capture leads.</p>
          <div className="hero-actions">
            <Link className="primary-button large" to="/start">Start building <ArrowRight size={17}/></Link>
            <Link className="secondary-button large" to="/websites">Browse ready-made sites <Globe size={17}/></Link>
          </div>
          <div className="trust-row"><span><Check size={15}/> Mobile-ready</span><span><Check size={15}/> Instant previews</span><span><Check size={15}/> Start small</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="floating-card card-one"><Globe size={18}/><span>Business website</span><strong>Live</strong></div>
          <div className="showcase-window">
            <div className="window-top"><span/><span/><span/><em>boss.app</em></div>
            <div className="showcase-content">
              <div className="showcase-badge">NEW • AI-READY</div>
              <h3>Your business, online.</h3>
              <p>A clean landing page with a built-in assistant.</p>
              <div className="showcase-actions"><b>Start now</b><span>View details →</span></div>
              <div className="showcase-grid"><span/><span/><span/><span/></div>
            </div>
          </div>
          <div className="floating-card card-two"><MessageSquareText size={18}/><div><strong>Support AI</strong><span>Ready to answer</span></div><i className="status-dot"/></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading"><div><div className="eyebrow">Start with a proven template</div><h2>Featured websites</h2></div><Link className="text-link" to="/websites">View all <ArrowRight size={15}/></Link></div>
        <div className="product-grid">{websites.slice(0, 3).map(p => <ProductCard key={p.id} product={p}/>)}</div>
      </section>

      <section className="dark-section">
        <div className="container split-section">
          <div><div className="eyebrow light">Add an AI layer</div><h2>Turn visitors into conversations.</h2><p>Give every business a simple assistant that can answer common questions, route customers, and collect leads.</p><div className="check-list"><div><Check/> FAQ answers</div><div><Check/> Lead capture</div><div><Check/> Booking and sales flows</div></div><Link className="secondary-button light-button" to="/chatbots">Explore chatbots <ArrowRight size={16}/></Link></div>
          <div className="chat-preview"><div className="chat-header"><span className="status-dot"/> BOSS Assistant <small>Online</small></div><div className="chat-msg bot">Hi! 👋 What would you like help with today?</div><div className="chat-msg user">I want to book a table.</div><div className="chat-msg bot">Sure. What day and how many people?</div><div className="chat-input">Type a message… <span>Send</span></div></div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading"><div><div className="eyebrow">Simple business model</div><h2>Sell once. Improve continuously.</h2></div></div>
        <div className="benefit-grid">
          <div className="benefit"><div className="benefit-icon"><Zap/></div><h3>Fast delivery</h3><p>Start from templates instead of reinventing every project.</p></div>
          <div className="benefit"><div className="benefit-icon"><ShieldCheck/></div><h3>Low-risk launch</h3><p>The MVP works without paid infrastructure or complex setup.</p></div>
          <div className="benefit"><div className="benefit-icon"><Bot/></div><h3>Recurring revenue</h3><p>Add hosting, maintenance and chatbot subscriptions later.</p></div>
        </div>
      </section>
    </>
  );
}
