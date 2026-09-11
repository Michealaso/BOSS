import { Link } from 'react-router-dom';
import { ArrowUpRight, Bot, Check, ExternalLink, LayoutTemplate, Sparkles } from 'lucide-react';
import { money } from '../lib/store';

export default function ProductCard({ product }) {
  const isWebsite = product.type === 'website';
  const Icon = isWebsite ? LayoutTemplate : Bot;
  const colors = product.colors || ['#0f172a', '#334155'];
  const image = product.images?.[0];

  return (
    <article className="product-card">
      <div className="product-art" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
        {image && <img className="product-art-image" src={image} alt={`${product.category} template`} loading="lazy" referrerPolicy="no-referrer" />}
        {image && <div className="product-art-overlay" />}
        <div className="product-art-top">
          <span className="mini-pill"><Icon size={13} /> {product.type}</span>
          {product.badge && <span className="mini-pill accent"><Sparkles size={11} /> {product.badge}</span>}
        </div>
        {image && <div className="product-art-title"><span>{product.category}</span><strong>{product.name}</strong></div>}
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
