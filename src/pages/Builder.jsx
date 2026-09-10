import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, CheckCircle2, Copy, Download, ExternalLink, Globe2, MessageSquareText, Palette, Save, Sparkles } from 'lucide-react';
import { allProducts } from '../data/products';
import { backendMode, getRemoteProject, saveRemoteProject } from '../lib/backend';
import { downloadText, websiteHtml, chatbotExport } from '../lib/export';
import { getProjects, getUser, saveProject } from '../lib/store';

const DEFAULT_FAQS = [
  { q: 'What are your opening hours?', a: 'We are open Monday to Saturday from 8:00 AM to 6:00 PM.' },
  { q: 'How can I contact you?', a: 'Call or WhatsApp us using the contact button on our website.' }
];

export default function Builder() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => allProducts.find(p => p.id === id && p.type === type), [id, type]);
  const user = getUser();
  const existing = getProjects().find(p => p.id === `PROJECT-${id}` || (p.productId === id && (!user?.email || p.ownerEmail === user.email)));
  const [remoteExisting, setRemoteExisting] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (backendMode === 'supabase') getRemoteProject(existing?.id || `PROJECT-${id}`, id).then(setRemoteExisting).catch(()=>{}); }, [id, existing?.id]);
  const [data, setData] = useState(existing?.data || remoteExisting?.data || (type === 'chatbot' ? {
    botName: product?.name || 'BOSS Assistant', welcome: 'Hi! How can I help your customers today?', tone: 'Friendly', faqs: DEFAULT_FAQS
  } : {
    business: 'Your Business', tagline: 'A better way to serve your customers online.', phone: '+256 700 000 000', whatsapp: '+256700000000', location: 'Kampala, Uganda', primary: product?.colors?.[0] || '#635bff', cta: 'Contact us', sections: product?.features || []
  }));
  useEffect(()=>{ if(remoteExisting?.data && !existing?.data) setData(remoteExisting.data); },[remoteExisting?.id, existing?.data]);
  if (!product) return <section className="container page-section"><h1>Builder item not found.</h1><Link className="primary-button" to="/">Back home</Link></section>;

  const projectId = existing?.id || remoteExisting?.id || `PROJECT-${id}`;
  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const save = async () => {
    const payload={ id: projectId, productId: id, type, ownerEmail: user?.email || '', productName: product.name, data, live:false };
    try { if (backendMode === 'supabase') await saveRemoteProject(payload); else saveProject(payload); setSaved(true); setTimeout(() => setSaved(false), 1800); } catch(err){ alert(err.message || 'Save failed.'); }
  };
  const publish = async () => {
    const payload={ id: projectId, productId: id, type, ownerEmail: user?.email || '', productName: product.name, data, live:true };
    try { if (backendMode === 'supabase') await saveRemoteProject(payload); else saveProject(payload); navigate(`/published/${encodeURIComponent(projectId)}`); } catch(err){ alert(err.message || 'Publish failed.'); }
  };
  const exportProject = () => { if(type==='website') downloadText(`${data.business || 'boss-site'}.html`, websiteHtml({id:projectId, data}),'text/html'); else downloadText(`${data.botName || 'boss-chatbot'}.json`, chatbotExport({id:projectId, productName:product.name, data}),'application/json'); };
  async function copyEmbed() {
    const code = `<script src="https://boss.example/widget.js" data-boss-project="${projectId}"></script>`;
    try { await navigator.clipboard.writeText(code); setSaved(true); setTimeout(() => setSaved(false), 1600); } catch {}
  }

  return <section className="container page-section">
    <Link className="back-link" to="/dashboard"><ArrowLeft size={15}/> Back to dashboard</Link>
    <div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> BOSS Studio</div><h1>{type === 'website' ? 'Customize your website.' : 'Train your chatbot.'}</h1><p>Make changes, save them, then preview or publish the project.</p></div><div className="builder-actions"><button className="secondary-button" onClick={save}><Save size={16}/> {saved ? 'Saved' : 'Save changes'}</button><button className="primary-button" onClick={publish}><Globe2 size={16}/> Publish</button><button className="small-button" onClick={exportProject}><Download size={14}/> Export</button></div></div>
    <div className="builder-layout">
      <div className="form-card">
        {type === 'website' ? <>
          <h3><Palette size={17}/> Brand & contact</h3>
          <div className="two-col"><label>Business name<input value={data.business} onChange={e => set('business', e.target.value)}/></label><label>Primary color<input type="color" value={data.primary} onChange={e => set('primary', e.target.value)}/></label></div>
          <label>Tagline<input value={data.tagline} onChange={e => set('tagline', e.target.value)}/></label>
          <div className="two-col"><label>Phone<input value={data.phone} onChange={e => set('phone', e.target.value)}/></label><label>WhatsApp<input value={data.whatsapp} onChange={e => set('whatsapp', e.target.value)}/></label></div>
          <label>Location<input value={data.location} onChange={e => set('location', e.target.value)}/></label>
          <label>Main call-to-action<input value={data.cta} onChange={e => set('cta', e.target.value)}/></label>
          <h3 className="builder-subhead"><Globe2 size={17}/> Sections</h3>
          <div className="check-grid">{(product.features || []).map(f => <label className="check-option" key={f}><input type="checkbox" checked={(data.sections || []).includes(f)} onChange={e => set('sections', e.target.checked ? [...(data.sections || []), f] : (data.sections || []).filter(x => x !== f))}/><span>{f}</span></label>)}</div>
        </> : <>
          <h3><Bot size={17}/> Assistant settings</h3>
          <label>Bot name<input value={data.botName} onChange={e => set('botName', e.target.value)}/></label>
          <label>Welcome message<textarea rows="3" value={data.welcome} onChange={e => set('welcome', e.target.value)}/></label>
          <label>Tone<select value={data.tone} onChange={e => set('tone', e.target.value)}><option>Friendly</option><option>Professional</option><option>Short & direct</option><option>Sales-focused</option></select></label>
          <div className="builder-row-head"><h3 className="builder-subhead"><MessageSquareText size={17}/> Knowledge base</h3><button className="small-button" onClick={() => set('faqs', [...data.faqs, {q:'New question',a:'New answer'}])}>Add FAQ</button></div>
          <div className="faq-editor">{data.faqs.map((faq, i) => <div className="faq-edit" key={i}><input value={faq.q} onChange={e => { const faqs=[...data.faqs]; faqs[i]={...faqs[i],q:e.target.value}; set('faqs',faqs); }}/><textarea rows="2" value={faq.a} onChange={e => { const faqs=[...data.faqs]; faqs[i]={...faqs[i],a:e.target.value}; set('faqs',faqs); }}/></div>)}</div>
          <div className="embed-card"><div><strong>Website embed</strong><p>Copy this snippet when you connect the real chatbot backend.</p></div><button className="small-button" onClick={copyEmbed}><Copy size={14}/> Copy code</button></div>
        </>}
      </div>
      <div className="studio-preview">
        <div className="studio-head"><span>Live preview</span><span className="status status-completed">● Ready</span></div>
        {type === 'website' ? <div className="website-studio" style={{'--accent': data.primary}}><div className="studio-nav"><strong>{data.business}</strong><span>Services</span><span>About</span><span>Contact</span></div><div className="studio-hero"><div className="eyebrow">BOSS POWERED</div><h2>{data.tagline}</h2><p>{data.location} · {data.phone}</p><button style={{background:data.primary}}>{data.cta}</button></div><div className="studio-cards">{(data.sections || []).slice(0,3).map(x => <div key={x}><strong>{x}</strong><p>Professional section ready for your content.</p></div>)}</div></div> : <div className="bot-window studio-bot"><div className="chat-header"><div className="bot-avatar"><Bot size={18}/></div><div><strong>{data.botName}</strong><span>Online · {data.tone}</span></div></div><div className="bot-messages"><div className="chat-msg bot">{data.welcome}</div>{data.faqs.slice(0,3).map((faq,i)=><div key={i} className="chat-msg user">{faq.q}</div>)}</div><div className="chat-compose"><span>Type a message...</span><button type="button" title="Chat preview"><MessageSquareText size={15}/></button></div></div>}
        <div className="studio-foot"><Link className="small-button" to={product.preview}><ExternalLink size={14}/> Live preview</Link><button className="small-button" onClick={publish}><CheckCircle2 size={14}/> Publish project</button></div>
      </div>
    </div>
  </section>;
}
