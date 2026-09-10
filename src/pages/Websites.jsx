import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutTemplate, Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { websites } from '../data/products';

export default function Websites() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const categories = ['All', ...new Set(websites.map((p) => p.category))];
  const filtered = useMemo(() => {
    let result = websites.filter((p) => category === 'All' || p.category === category).filter((p) => `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-high') result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [query, category, sort]);

  return <section className="container page-section">
    <div className="page-heading marketplace-heading">
      <div><div className="eyebrow"><LayoutTemplate size={14}/> Marketplace</div><h1>Business websites</h1><p>Ready-made designs you can explore, customize, and order.</p></div>
      <Link className="ghost-button" to="/chatbots"><SlidersHorizontal size={16}/> Pair with a chatbot</Link>
    </div>

    <div className="marketplace-toolbar">
      <label className="search-box"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search websites…"/></label>
      <div className="filter-row">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
      </div>
    </div>

    <div className="marketplace-count"><span>{filtered.length} website{filtered.length !== 1 ? 's' : ''}</span><span>Interactive previews included</span></div>
    <div className="product-grid">{filtered.map((p) => <ProductCard key={p.id} product={p}/>)}</div>
    {!filtered.length && <div className="empty-state"><h3>No websites found.</h3><p>Try another search or category.</p><button className="secondary-button" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button></div>}

    <div className="custom-banner"><div><div className="eyebrow">Need something different?</div><h2>Request a custom website.</h2><p>Tell us what your business needs and we can start from a template or build a custom version.</p></div><Link className="primary-button" to="/order">Request custom build <ArrowRight size={16}/></Link></div>
  </section>;
}
