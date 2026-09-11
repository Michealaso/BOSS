import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, Check, ExternalLink, LayoutTemplate, Settings2 } from 'lucide-react';
import { allProducts } from '../data/products';
import { money } from '../lib/store';

const categoryImages = {
  Restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=88',
  Business: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=88',
  'E-commerce': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=88',
  Portfolio: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=88',
};

export default function Product() {
  const { id } = useParams();
  const product = allProducts.find(p => p.id === id);
  if (!product) return <div className="empty-state">Product not found.</div>;
  const Icon = product.type === 'website' ? LayoutTemplate : Bot;
  const image = product.type === 'website' ? categoryImages[product.category] : null;
  return <section className="container page-section">
    <Link className="back-link" to={product.type === 'website' ? '/websites' : '/chatbots'}><ArrowLeft size={15}/> Back to marketplace</Link>
    <div className="detail-grid">
      <div
        className={`detail-art ${image ? 'detail-art-photo' : ''}`}
        style={{
          background: image ? `url(${image}) center / cover no-repeat` : `linear-gradient(135deg, ${product.colors?.[0] || '#0f172a'}, ${product.colors?.[1] || '#334155'})`,
        }}
      >
        <div className="detail-art-shade" />
        <div className="detail-art-inner"><Icon size={42}/><h2>{product.name}</h2><span>{product.type === 'website' ? `${product.category} template` : 'Live product preview'}</span></div>
      </div>
      <div className="detail-copy"><div className="eyebrow">{product.category}</div><h1>{product.name}</h1><p className="detail-lead">{product.description}</p><div className="price-row"><strong>{money(product.price)}</strong><span>starting price</span></div><div className="detail-meta"><div><b>Delivery</b><span>{product.delivery || '2–5 business days'}</span></div><div><b>Revisions</b><span>{product.revisions || '1 revision round'}</span></div></div><div className="check-list compact-list">{product.features.map(f => <div key={f}><Check/> {f}</div>)}</div><div className="detail-actions"><Link className="primary-button large" to="/order" state={{ product }} >Get this <ArrowRight size={17}/></Link><Link className="secondary-button large" to={`/builder/${product.type}/${product.id}`}><Settings2 size={16}/> Try customizing</Link><Link className="ghost-button large" to={product.preview}><ExternalLink size={16}/> Preview live</Link></div></div>
    </div>
  </section>;
}
