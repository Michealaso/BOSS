import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle2, Clock3, ExternalLink, Globe2, LayoutTemplate, PackageCheck, RefreshCw, ShieldCheck, Sparkles, WalletCards, ShoppingBag } from 'lucide-react';
import { allProducts } from '../data/products';
import { getOrders, getProjects, getUser } from '../lib/store';
import { backendMode, getRemoteUser, listRemoteOrders, listRemoteProjects, listRemoteBuildRequests } from '../lib/backend';
import './DashboardUI.css';

const productFor = (id) => allProducts.find((p) => p.id === id);
const statusClass = (value) => String(value || '').toLowerCase().replace(/\s+/g, '-');
const niceDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function Stat({ icon: Icon, label, value, hint }) {
  return <div className="boss-dash-stat"><div className="boss-dash-stat-top"><div className="boss-dash-stat-icon"><Icon size={17}/></div><small>{hint}</small></div><strong>{value}</strong><span>{label}</span></div>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [orders, setOrders] = useState(getOrders());
  const [projects, setProjects] = useState(getProjects());
  const [buildRequests, setBuildRequests] = useState([]);
  const [loading, setLoading] = useState(backendMode === 'supabase');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (backendMode !== 'supabase') { setLoading(false); return; }
    const remote = await getRemoteUser();
    if (!remote) { navigate('/login'); return; }
    setRefreshing(true); setError('');
    try {
      const [o, p, b] = await Promise.all([listRemoteOrders(remote.id), listRemoteProjects(remote.id), listRemoteBuildRequests(remote.id)]);
      setOrders(o.map((x) => ({ id: x.id, productId: x.product_id, productName: productFor(x.product_id)?.name || x.product_id || 'BOSS service', productType: productFor(x.product_id)?.type || 'website', business: x.business || 'Business', status: x.status || 'New', paymentStatus: x.payment_status || 'Pending', price: x.price, createdAt: x.created_at, deliveryUrl: x.delivery_url || '', deliveryMessage: x.delivery_message || '' })));
      setProjects(p.map((x) => ({ id: x.id, productId: x.product_id, productName: x.product_name, type: x.type, live: x.live, data: x.data, updatedAt: x.updated_at })));
      setBuildRequests(b.map((x) => ({ id: x.id, business: x.business_name || 'Business setup', status: x.status || 'Build requested', plan: x.plan || 'Custom', paymentStatus: x.payment_status || 'Awaiting payment', price: x.price, createdAt: x.created_at, deliveryUrl: x.delivery_url || '', deliveryMessage: x.delivery_message || '', adminMessage: x.admin_message || '' })));
    } catch (e) {
      console.error('BOSS customer dashboard load failed', e);
      setError(e.message || 'Could not refresh your dashboard.');
    } finally { setRefreshing(false); setLoading(false); }
  };

  useEffect(() => { refresh(); }, [navigate]);

  const activeProjects = projects.filter((p) => p.live);
  const openOrders = orders.filter((o) => !['Completed', 'Cancelled'].includes(o.status));
  const unpaidBuilds = buildRequests.filter((r) => r.paymentStatus !== 'Paid');
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);
  const hasActivity = recentOrders.length || recentProjects.length || buildRequests.length;

  if (loading) return <section className="container page-section boss-dash"><div className="boss-loading"><div className="boss-dash-card"><Sparkles size={22}/><h2>Loading your workspace…</h2><p>Fetching your orders, projects and build progress.</p></div></div></section>;

  return <section className="container page-section boss-dash">
    <div className="boss-dash-shell">
      <header className="boss-dash-hero">
        <div><div className="boss-dash-eyebrow"><Sparkles size={14}/> Customer workspace</div><h1>Welcome back{user?.name ? `, ${user.name}` : ''}.</h1><p>Your BOSS workspace keeps projects, payments, deliveries and build requests in one clean place.</p></div>
        <div className="boss-dash-hero-actions"><button className="secondary-button" onClick={refresh} disabled={refreshing}><RefreshCw size={15}/> {refreshing ? 'Refreshing…' : 'Refresh'}</button><Link className="primary-button" to="/start">Build with BOSS <ArrowRight size={16}/></Link></div>
      </header>

      {error && <div className="boss-error" role="alert">{error}</div>}
      {unpaidBuilds.length > 0 && <div className="boss-dash-notice"><WalletCards size={18}/><div><strong>{unpaidBuilds.length === 1 ? 'Your build is ready for payment.' : `${unpaidBuilds.length} builds are ready for payment.`}</strong><span>Open your build request below to complete checkout and move it into production.</span></div></div>}

      <div className="boss-dash-stats"><Stat icon={PackageCheck} label="Orders" value={orders.length} hint="All time"/><Stat icon={Clock3} label="In progress" value={openOrders.length} hint="Active"/><Stat icon={Globe2} label="Published" value={activeProjects.length} hint="Live"/><Stat icon={Bot} label="AI assistants" value={projects.filter((p) => p.type === 'chatbot').length} hint="Projects"/></div>

      <div className="boss-dash-grid">
        <div className="boss-dash-card"><div className="boss-dash-card-head"><div><h2>Quick actions</h2><p>Start the next thing without hunting through the site.</p></div></div><div className="boss-dash-card-body"><div className="boss-dash-actions">
          <Link className="boss-dash-action" to="/start"><div className="boss-dash-action-icon"><Sparkles size={16}/></div><div><strong>Build with BOSS</strong><span>Send a full brief to the BOSS build team.</span></div></Link>
          <Link className="boss-dash-action" to="/websites"><div className="boss-dash-action-icon"><Globe2 size={16}/></div><div><strong>Browse websites</strong><span>Explore, customize and order a ready-made site.</span></div></Link>
          <Link className="boss-dash-action" to="/chatbots"><div className="boss-dash-action-icon"><Bot size={16}/></div><div><strong>Browse AI assistants</strong><span>Pick an assistant for support, bookings or sales.</span></div></Link>
          <Link className="boss-dash-action" to="/order"><div className="boss-dash-action-icon"><ShoppingBag size={16}/></div><div><strong>Start a new order</strong><span>Place a direct website or chatbot order.</span></div></Link>
        </div></div></div>

        <div className="boss-dash-card"><div className="boss-dash-card-head"><div><h2>Workspace status</h2><p>Everything important at a glance.</p></div></div><div className="boss-dash-card-body"><div className="boss-dash-security"><ShieldCheck size={18}/><div><strong>Your account is protected</strong><span>Your dashboard data is tied to your signed-in account.</span></div></div><div className="boss-dash-list" style={{marginTop:'10px'}}>
          <div className="boss-dash-row"><div className="boss-dash-row-icon"><PackageCheck size={17}/></div><div className="boss-dash-row-main"><strong>Orders</strong><span>{orders.length ? `${orders.length} order${orders.length === 1 ? '' : 's'} on your account` : 'No orders yet'}</span></div><span className="boss-dash-status">{orders.length ? 'Active record' : 'Ready'}</span></div>
          <div className="boss-dash-row"><div className="boss-dash-row-icon"><Globe2 size={17}/></div><div className="boss-dash-row-main"><strong>Published projects</strong><span>{activeProjects.length ? `${activeProjects.length} live project${activeProjects.length === 1 ? '' : 's'}` : 'Nothing published yet'}</span></div><span className={`boss-dash-status ${activeProjects.length ? 'published' : ''}`}>{activeProjects.length ? 'Live' : 'Ready'}</span></div>
          <div className="boss-dash-row"><div className="boss-dash-row-icon"><WalletCards size={17}/></div><div className="boss-dash-row-main"><strong>Build payments</strong><span>{unpaidBuilds.length ? `${unpaidBuilds.length} awaiting payment` : 'No payment action needed'}</span></div><span className={`boss-dash-status ${unpaidBuilds.length ? 'pending' : 'paid'}`}>{unpaidBuilds.length ? 'Pending' : 'Clear'}</span></div>
        </div></div></div>
      </div>

      {buildRequests.length > 0 && <div className="boss-dash-card"><div className="boss-dash-card-head"><div><h2>Build with BOSS</h2><p>Track briefs, payment and delivery from one place.</p></div><Link className="text-link" to="/start">New build <ArrowRight size={14}/></Link></div><div className="boss-dash-card-body"><div>{buildRequests.map((r) => <div className="boss-dash-build" key={r.id}><div className="boss-dash-build-head"><div><h3>{r.business}</h3><div className="boss-dash-build-meta">{r.plan} · submitted {niceDate(r.createdAt)}</div></div><span className={`boss-dash-status ${statusClass(r.status)}`}>{r.status}</span></div>{r.adminMessage && <div className="boss-dash-build-message"><strong>BOSS:</strong> {r.adminMessage}</div>}{r.deliveryMessage && <div className="boss-dash-build-message"><strong>Delivery:</strong> {r.deliveryMessage}</div>}<div className="boss-dash-build-actions">{r.paymentStatus !== 'Paid' && <Link className="primary-button small" to={`/build-payment/${r.id}`}><WalletCards size={13}/> Pay with Pesapal</Link>}{r.deliveryUrl && <a className="small-button" href={r.deliveryUrl} target="_blank" rel="noreferrer"><ExternalLink size={13}/> Open delivery</a>}<span className={`boss-dash-status ${r.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>{r.paymentStatus}</span></div></div>)}</div></div></div>}

      <div className="boss-dash-grid">
        <div className="boss-dash-card"><div className="boss-dash-card-head"><div><h2>Your projects</h2><p>Edit drafts or open published work.</p></div><Link className="text-link" to="/websites">Browse more <ArrowRight size={14}/></Link></div><div className="boss-dash-card-body">{recentProjects.length ? <div>{recentProjects.map((p) => <div className="boss-dash-project" key={p.id}><div className="boss-dash-project-icon">{p.type === 'website' ? <LayoutTemplate size={18}/> : <Bot size={18}/>}</div><div><strong>{p.productName}</strong><span>{p.live ? 'Published' : 'Draft'} · updated {niceDate(p.updatedAt)}</span></div><div className="boss-dash-project-actions"><Link className="small-button" to={`/builder/${p.type}/${p.productId}`}>Edit</Link>{p.live && <Link className="small-button" to={`/published/${encodeURIComponent(p.id)}`}><ExternalLink size={13}/> Open</Link>}</div></div>)}</div> : <div className="boss-dash-empty"><h3>Your workspace is ready.</h3><p>Start with a website, chatbot or full BOSS build and everything will appear here.</p><div className="hero-actions centered"><Link className="primary-button" to="/websites">Browse websites</Link><Link className="secondary-button" to="/chatbots">Browse chatbots</Link></div></div>}</div></div>
        <div className="boss-dash-card"><div className="boss-dash-card-head"><div><h2>Recent orders</h2><p>Latest purchases and their status.</p></div><span className="boss-dash-sync">{orders.length ? `${orders.length} total` : 'No orders yet'}</span></div><div className="boss-dash-card-body">{recentOrders.length ? <div className="boss-dash-list">{recentOrders.map((o) => <div className="boss-dash-row" key={o.id}><div className="boss-dash-row-icon">{o.productType === 'website' ? <LayoutTemplate size={17}/> : <Bot size={17}/>}</div><div className="boss-dash-row-main"><strong>{o.productName}</strong><span>{o.business} · {niceDate(o.createdAt)}</span>{o.deliveryMessage && <small>{o.deliveryMessage}</small>}</div><span className={`boss-dash-status ${statusClass(o.status)}`}>{o.status}</span></div>)}</div> : <div className="boss-dash-empty"><h3>No orders yet.</h3><p>Choose a ready-made website or chatbot when you are ready.</p><Link className="secondary-button" to="/order">Start an order</Link></div>}</div></div>
      </div>
      {!hasActivity && <div className="boss-dash-notice"><CheckCircle2 size={18}/><div><strong>Your BOSS workspace is ready.</strong><span>Once you place your first order or build request, the dashboard becomes your central project hub.</span></div></div>}
    </div>
  </section>;
}
