import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { chatbots } from '../data/products';

export default function Chatbots() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const filtered = useMemo(() => {
    let result = chatbots.filter((p) => `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [query, sort]);

  return <section className="container page-section">
    <div className="page-heading marketplace-heading">
      <div><div className="eyebrow"><Bot size={14}/> Marketplace</div><h1>AI chatbots</h1><p>Assistants for support, bookings, sales and lead capture.</p></div>
      <Link className="ghost-button" to="/websites"><SlidersHorizontal size={16}/> Add a website</Link>
    </div>

    <div className="marketplace-toolbar">
      <label className="search-box"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chatbots…"/></label>
      <div className="filter-row"><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
    </div>

    <div className="marketplace-count"><span>{filtered.length} chatbot{filtered.length !== 1 ? 's' : ''}</span><span>Try it live before ordering</span></div>
    <div className="product-grid">{filtered.map((p) => <ProductCard key={p.id} product={p}/>)}</div>
    {!filtered.length && <div className="empty-state"><h3>No chatbots found.</h3><p>Try another search.</p><button className="secondary-button" onClick={() => setQuery('')}>Clear search</button></div>}

    <div className="custom-banner"><div><div className="eyebrow">Custom AI assistant</div><h2>Have a special workflow?</h2><p>We can create a bot around your FAQs, products, bookings and customer journey.</p></div><Link className="primary-button" to="/order">Request custom bot <ArrowRight size={16}/></Link></div>
  </section>;
}
