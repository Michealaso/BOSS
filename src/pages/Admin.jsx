import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, Clock3, ExternalLink, PackageCheck, Search, ShieldCheck, X } from 'lucide-react';
import { getUser, setUser } from '../lib/store';
import { backendMode, getRemoteProfile, getRemoteUser, listRemoteBuildRequests, updateRemoteBuildRequest, toLocalUser } from '../lib/backend';

function mapRequest(x) {
  return {
    id: x.id,
    name: x.name || '', email: x.email || '', phone: x.phone || '',
    business: x.business_name || '', businessType: x.business_type || '', country: x.country || '',
    goals: Array.isArray(x.goals) ? x.goals : [], channels: Array.isArray(x.channels) ? x.channels : [],
    style: x.style || '', plan: x.plan || '', notes: x.notes || '',
    recommendedWebsiteName: x.recommended_website_name || '', recommendedBotName: x.recommended_bot_name || '',
    price: x.price || 0, paymentStatus: x.payment_status || 'Awaiting payment', billingType: x.billing_type || 'one-time',
    status: x.status || 'Build requested', adminMessage: x.admin_message || '',
    deliveryUrl: x.delivery_url || '', deliveryMessage: x.delivery_message || '',
    createdAt: x.created_at, updatedAt: x.updated_at
  };
}

export default function Admin() {
  const localUser = getUser();
  const [user, setLocalUser] = useState(localUser);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(backendMode === 'supabase');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (backendMode !== 'supabase') return;
    const remote = await getRemoteUser();
    if (!remote) return;
    setRefreshing(true); setError('');
    try {
      const rows = await listRemoteBuildRequests(remote.id, { admin: true });
      setRequests(rows.map(mapRequest));
    } catch (e) {
      console.error('BOSS build request load failed', e);
      setError(e.message || 'Could not load build requests.');
    } finally { setRefreshing(false); setLoading(false); }
  };

  useEffect(() => {
    let timer;
    (async () => {
      if (backendMode !== 'supabase') { setLoading(false); return; }
      const remote = await getRemoteUser();
      if (!remote) { setLoading(false); return; }
      const profile = await getRemoteProfile(remote.id);
      if (profile?.role !== 'admin') { setLoading(false); return; }
      const mapped = toLocalUser(remote, profile); setLocalUser(mapped); setUser(mapped);
      await refresh();
      timer = setInterval(refresh, 5000);
    })().catch(e => { console.error(e); setError(e.message || 'Admin verification failed.'); setLoading(false); });
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => requests.filter(r => (filter === 'All' || r.status === filter) &&
    [r.id, r.business, r.name, r.email, r.phone, r.businessType, r.plan].join(' ').toLowerCase().includes(query.toLowerCase())), [requests, query, filter]);

  async function change(id, patch) {
    try {
      if (backendMode === 'supabase') {
        const updated = await updateRemoteBuildRequest(id, patch);
        setRequests(prev => prev.map(r => r.id === id ? mapRequest(updated) : r));
        return;
      }
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    } catch (e) { alert(e.message || 'Admin update failed.'); }
  }

  if (backendMode === 'supabase' && loading) return <section className="container page-section narrow"><div className="auth-card"><div className="eyebrow">Checking access</div><h1>Verifying admin access.</h1><p>Please wait while BOSS checks your secure account role.</p></div></section>;
  if (backendMode === 'supabase' && (!user || user.role !== 'admin')) return <Navigate to="/login" replace />;

  return <section className="container page-section">
    <div className="page-heading"><div><div className="eyebrow"><ShieldCheck size={14}/> Private admin</div><h1>BOSS build control room.</h1><p>Build requests submitted through “Build with BOSS” appear here with the customer's full brief.</p></div><div className="admin-key"><span>Signed in as</span><strong>{user?.email}</strong></div></div>
    <div className="stats-grid"><div><PackageCheck/><span>Total build requests</span><strong>{requests.length}</strong></div><div><Clock3/><span>Active</span><strong>{requests.filter(r=>r.status!=='Completed').length}</strong></div><div><ShieldCheck/><span>Requested</span><strong>{requests.filter(r=>r.status==='Build requested').length}</strong></div><div><Check/><span>Completed</span><strong>{requests.filter(r=>r.status==='Completed').length}</strong></div></div>
    <div className="admin-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search build requests…"/></label><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Build requested</option><option>In progress</option><option>Completed</option><option>Cancelled</option></select><button className="small-button" onClick={refresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh requests'}</button></div>
    {error && <div className="admin-error" role="alert">{error}</div>}
    <div className="table-card"><div className="table-head"><h3>BOSS build requests</h3><span>{filtered.length} shown</span></div>{filtered.length ? <div className="order-list">{filtered.map(r => <article className="admin-row" key={r.id}><div className="admin-order"><strong>{r.business || 'Unnamed business'}</strong><span>{r.name} · {r.email} · {r.phone}</span><small>{r.id} · {r.plan || 'No plan'} · {r.price ? `${Number(r.price).toLocaleString()} ${import.meta.env.VITE_PESAPAL_CURRENCY || 'UGX'}` : 'Price pending'} · {r.paymentStatus} · {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</small><div className="admin-brief"><strong>Customer brief</strong><small>Business type: {r.businessType || '—'}</small><small>Country / market: {r.country || '—'}</small><small>Goals: {r.goals.join(', ') || '—'}</small><small>Tools: {r.channels.join(', ') || '—'}</small><small>Style: {r.style || '—'}</small><small>Recommended website: {r.recommendedWebsiteName || '—'}</small><small>Recommended chatbot: {r.recommendedBotName || '—'}</small><small>Notes: {r.notes || '—'}</small></div><label className="admin-inline-field"><span>Admin message</span><textarea rows="2" value={r.adminMessage} onChange={e=>setRequests(prev=>prev.map(x=>x.id===r.id?{...x,adminMessage:e.target.value}:x))} placeholder="Message for the customer…"/></label><label className="admin-inline-field"><span>Delivery URL</span><input value={r.deliveryUrl} onChange={e=>setRequests(prev=>prev.map(x=>x.id===r.id?{...x,deliveryUrl:e.target.value}:x))} placeholder="https://…"/></label><label className="admin-inline-field"><span>Delivery message</span><textarea rows="2" value={r.deliveryMessage} onChange={e=>setRequests(prev=>prev.map(x=>x.id===r.id?{...x,deliveryMessage:e.target.value}:x))} placeholder="Tell the customer what is ready…"/></label><button className="small-button" onClick={()=>change(r.id,{adminMessage:r.adminMessage,deliveryUrl:r.deliveryUrl,deliveryMessage:r.deliveryMessage})}>Save build details</button>{r.deliveryUrl && <small>Delivery: <a className="text-link" href={r.deliveryUrl} target="_blank" rel="noreferrer">Open delivered build <ExternalLink size={12}/></a></small>}</div><div className="admin-controls"><select value={r.status} onChange={e=>change(r.id,{status:e.target.value})}><option>Build requested</option><option>In progress</option><option>Completed</option><option>Cancelled</option></select><button className="icon-button subtle" title="Mark complete" onClick={()=>change(r.id,{status:'Completed'})}><Check size={16}/></button><button className="icon-button subtle" title="Reset" onClick={()=>change(r.id,{status:'Build requested'})}><X size={16}/></button></div></article>)}</div> : <div className="empty-state">No build requests found.</div>}</div>
  </section>;
}
