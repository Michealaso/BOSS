import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, Check, ExternalLink, LayoutTemplate, Settings2, ShieldCheck } from 'lucide-react';
import { allProducts } from '../data/products';
import { money } from '../lib/store';

export default function Product() {
  const { id } = useParams();
  const product = allProducts.find(p => p.id === id);
  if (!product) return <div className="empty-state">Product not found.</div>;
  const Icon = product.type === 'website' ? LayoutTemplate : Bot;
  return <section className="container page-section">
    <Link className="back-link" to={product.type === 'website' ? '/websites' : '/chatbots'}><ArrowLeft size={15}/> Back to marketplace</Link>
    <div className="detail-grid">
      <div className="detail-art" style={{ background: `linear-gradient(135deg, ${product.colors?.[0] || '#0f172a'}, ${product.colors?.[1] || '#334155'})` }}><div className="detail-art-inner"><Icon size={42}/><h2>{product.name}</h2><span>Live product preview</span></div></div>
      <div className="detail-copy"><div className="eyebrow">{product.category}</div><h1>{product.name}</h1><p className="detail-lead">{product.description}</p><div className="price-row"><strong>{money(product.price)}</strong><span>starting price</span></div><div className="detail-meta"><div><b>Delivery</b><span>{product.delivery || '2–5 business days'}</span></div><div><b>Revisions</b><span>{product.revisions || '1 revision round'}</span></div></div><div className="check-list compact-list">{product.features.map(f => <div key={f}><Check/> {f}</div>)}</div><div className="detail-actions"><Link className="primary-button large" to="/order" state={{ product }} >Get this <ArrowRight size={17}/></Link><Link className="secondary-button large" to={`/builder/${product.type}/${product.id}`}><Settings2 size={16}/> Try customizing</Link><Link className="ghost-button large" to={product.demo}><ExternalLink size={16}/> Live demo</Link></div><div className="small-note"><ShieldCheck size={15}/> Prototype order flow. Payment integration can be connected later.</div></div>
    </div>
  </section>;
}
