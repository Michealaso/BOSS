import { Link } from 'react-router-dom';
import { ArrowUpRight, Bot, Check, ExternalLink, LayoutTemplate, MessageSquareText, Sparkles } from 'lucide-react';
import { money } from '../lib/store';

const categoryImages = {
  Restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
  Business: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
  'E-commerce': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85',
  Portfolio: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
};

export default function ProductCard({ product }) {
  const isWebsite = product.type === 'website';
  const Icon = isWebsite ? LayoutTemplate : Bot;
  const colors = product.colors || ['#0f172a', '#334155'];
  const image = isWebsite ? categoryImages[product.category] : null;

  return (
    <article className="product-card">
      <div className="product-art" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
        <div className="product-art-top">
          <span className="mini-pill"><Icon size={13} /> {product.type}</span>
          {product.badge && <span className="mini-pill accent"><Sparkles size={11} /> {product.badge}</span>}
        </div>

        {isWebsite ? (
          <div className="template-photo-wrap" aria-label={`${product.category} template image`}>
            <img
              className="template-photo"
              src={image}
              alt={`${product.category} business template preview`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="template-photo-overlay" />
            <div className="template-photo-caption">
              <span>{product.category}</span>
              <strong>Real-world visual direction</strong>
            </div>
          </div>
        ) : (
          <div className="mock-browser chatbot-preview">
            <div className="bot-preview-header"><span className="bot-preview-avatar"><Bot size={14}/></span><div><b>{product.name}</b><small><span/> Online</small></div></div>
            <div className="bot-preview-body">
              <div className="preview-msg bot">Hi! How can I help?</div>
              <div className="preview-msg user">I need help with this.</div>
              <div className="preview-msg bot">Sure — tell me what you need.</div>
            </div>
            <div className="bot-preview-input"><MessageSquareText size={13}/> Type a message</div>
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div className="card-meta-line"><span className="eyebrow">{product.category}</span><span className="starting-label">Starting from</span></div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <div className="feature-row">
          {product.features.slice(0, 3).map((f) => <span key={f}><Check size={11}/>{f}</span>)}
          {product.features.length > 3 && <span>+{product.features.length - 3} more</span>}
        </div>

        <div className="product-footer">
          <div className="price-block"><span className="price">{money(product.price)}</span><span className="muted small">one-time setup</span></div>
          <div className="card-actions">
            <Link className="small-button" to={product.preview}><ExternalLink size={14} /> Preview</Link>
            <Link className="primary-button small" to={`/product/${product.type}/${product.id}`}>Get it <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </div>
    </article>
  );
}
