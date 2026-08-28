import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, BriefcaseBusiness, Check, CheckCircle2, Globe2, MessageCircle, Palette, ShoppingCart, Sparkles, CalendarDays, Smartphone, Store, Building2, Utensils, Scissors, Car, Home as HomeIcon, Dumbbell, Camera, Rocket, ShieldCheck } from 'lucide-react';
import { allProducts } from '../data/products';
import { backendMode, createRemoteBuildRequest, getRemoteUser, startPesapalPayment } from '../lib/backend';
import { getUser, makeId, saveOrder } from '../lib/store';

const STEPS = ['Business', 'Goals', 'Channels', 'Style', 'Plan', 'Details', 'Review'];
const businessTypes = [
  { id: 'restaurant', label: 'Restaurant / food', icon: Utensils },
  { id: 'shop', label: 'Shop / retail', icon: Store },
  { id: 'salon', label: 'Salon / beauty', icon: Scissors },
  { id: 'real-estate', label: 'Real estate', icon: HomeIcon },
  { id: 'car', label: 'Cars / dealership', icon: Car },
  { id: 'fitness', label: 'Fitness / gym', icon: Dumbbell },
  { id: 'creative', label: 'Creative / portfolio', icon: Camera },
  { id: 'company', label: 'Company / services', icon: Building2 },
];
const goals = [
  { id: 'presence', label: 'Look professional online', icon: Globe2 },
  { id: 'leads', label: 'Get more enquiries', icon: MessageCircle },
  { id: 'sales', label: 'Sell products or services', icon: ShoppingCart },
  { id: 'booking', label: 'Take bookings / appointments', icon: CalendarDays },
  { id: 'support', label: 'Answer customers with AI', icon: Bot },
];
const channels = [
  { id: 'website', label: 'Professional website', icon: Globe2 },
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  { id: 'chatbot', label: 'AI chatbot', icon: Bot },
  { id: 'booking', label: 'Booking form', icon: CalendarDays },
  { id: 'store', label: 'Online store / orders', icon: ShoppingCart },
];
const styles = ['Clean & modern', 'Bold & energetic', 'Premium & elegant', 'Friendly & local'];
const plans = [
  { id: 'starter', label: 'Starter', range: '$49–$99 one-time', monthly: '$19/month', desc: 'A polished online presence with the essentials.' },
  { id: 'business', label: 'Business', range: '$99–$199 one-time', monthly: '$29/month', desc: 'Website plus lead capture, WhatsApp and automation.' },
  { id: 'pro', label: 'Pro', range: '$199–$399+ one-time', monthly: '$49/month', desc: 'A complete online business setup with AI and sales tools.' },
];

function toggle(list, value) { return list.includes(value) ? list.filter(x => x !== value) : [...list, value]; }

export default function SetupWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    businessType: '', businessName: '', country: 'Uganda', goals: [], channels: ['website'], style: 'Clean & modern', plan: 'business', name: '', email: '', phone: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    const pending = location.state?.wizardData;
    if (pending) {
      setData(prev => ({ ...prev, ...pending }));
      window.history.replaceState({}, document.title, window.location.href);
    }
  }, [location.state]);

  const recommended = useMemo(() => {
    const wantsBot = data.channels.includes('chatbot') || data.goals.includes('support');
    const wantsStore = data.channels.includes('store') || data.goals.includes('sales');
    let website = allProducts.find(p => p.type === 'website' && /business/i.test(p.name));
    if (data.businessType === 'restaurant') website = allProducts.find(p => p.type === 'website' && /restaurant/i.test(p.name)) || website;
    if (wantsStore) website = allProducts.find(p => p.type === 'website' && /store/i.test(p.name)) || website;
    if (!website) website = allProducts.find(p => p.type === 'website');
    const bot = wantsBot ? allProducts.find(p => p.type === 'chatbot') : null;
    return { website, bot };
  }, [data]);

  const chosenPlan = plans.find(p => p.id === data.plan) || plans[1];
  const canContinue = [
    Boolean(data.businessType && data.businessName.trim()),
    data.goals.length > 0,
    data.channels.length > 0,
    Boolean(data.style),
    Boolean(data.plan),
    Boolean(data.name.trim() && data.email.trim() && data.phone.trim()),
  ][step];

  const next = () => { if (!canContinue) return; setStep(s => Math.min(STEPS.length - 1, s + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const back = () => { setStep(s => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const start = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);
    const chosenPlan = plans.find(p => p.id === data.plan) || plans[1];
    const chosenPrice = ({ starter: 79, business: 149, pro: 299 })[data.plan] ?? 149;
    const orderNotes = [
      'BOSS Setup Wizard build request',
      `Business type: ${data.businessType}`,
      `Goals: ${data.goals.join(', ')}`,
      `Channels: ${data.channels.join(', ')}`,
      `Style: ${data.style}`,
      `Plan: ${chosenPlan.label}`,
      data.notes ? `Extra notes: ${data.notes}` : ''
    ].filter(Boolean).join('\n');
    const firstProduct = recommended.website || recommended.bot || allProducts[0];
    const user = getUser();
    const id = makeId('BUILD');
    const base = {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      business: data.businessName,
      userEmail: user?.email || data.email,
      productId: firstProduct?.id || 'business-pro',
      productName: firstProduct?.name || 'Custom BOSS Build',
      productType: firstProduct?.type || 'website',
      price: chosenPrice,
      paymentMethod: 'not_required',
      paymentStatus: 'Not required',
      billingType: 'one-time',
      subscriptionStatus: 'not_applicable',
      packageId: data.plan,
      status: 'Build requested',
      createdAt: new Date().toISOString(),
      requirements: orderNotes,
      notes: orderNotes,
      buildDetails: { ...data, recommended: { websiteId: recommended.website?.id || null, websiteName: recommended.website?.name || null, botId: recommended.bot?.id || null, botName: recommended.bot?.name || null } },
      deliveryMessage: '',
      deliveryUrl: ''
    };
    try {
      if (backendMode === 'supabase') {
        const remote = await getRemoteUser();
        if (!remote) {
          try { sessionStorage.setItem('boss_pending_build', JSON.stringify(data)); } catch {}
          navigate('/login', { state: { from: '/start', wizardData: data } });
          return;
        }
        await createRemoteBuildRequest({
          id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          business: data.businessName,
          businessType: data.businessType,
          country: data.country,
          goals: data.goals,
          channels: data.channels,
          style: data.style,
          plan: data.plan,
          notes: data.notes,
          recommendedWebsiteId: recommended.website?.id || null,
          recommendedWebsiteName: recommended.website?.name || null,
          recommendedBotId: recommended.bot?.id || null,
          recommendedBotName: recommended.bot?.name || null
        });
        navigate(`/build-payment/${id}`);
        return;
      } else {
        // Keep the local fallback lightweight; Build with BOSS is a request, not a template order.
        saveOrder({ ...base, status: 'Build requested', paymentStatus: 'Not required' });
      }
      setSubmitted(base);
      setStep(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(error.message || 'Could not send your build request.');
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="container page-section wizard-page">
    <div className="wizard-topbar"><button className="back-link as-button" onClick={() => step === 0 ? navigate('/') : back()}><ArrowLeft size={15}/> {step === 0 ? 'Back home' : 'Back'}</button><div className="wizard-progress">{STEPS.map((label, i) => <div key={label} className={i <= step ? 'wizard-step active' : 'wizard-step'}><span>{i < step ? <Check size={13}/> : i + 1}</span><small>{label}</small></div>)}</div></div>

    <div className="wizard-hero"><div className="eyebrow pill"><Sparkles size={14}/> BOSS Business Setup</div><h1>Tell BOSS what your business needs.</h1><p>Answer a few questions and we’ll recommend the right website, AI assistant and business tools for you.</p></div>

    {submitted && <div className="build-success"><div className="build-success-icon"><CheckCircle2 size={24}/></div><div><div className="eyebrow">Request saved</div><h2>Your BOSS build is ready for payment.</h2><p>Your build request has been saved. Complete payment to send it into the BOSS production queue. Once payment is confirmed, allow about <strong>10 minutes</strong> while we prepare your first build. Your request ID is <strong>{submitted.id}</strong>.</p><div className="hero-actions"><button className="primary-button" onClick={()=>navigate('/dashboard')}>Open my dashboard <ArrowRight size={16}/></button><button className="secondary-button" onClick={()=>setSubmitted(null)}>Start another build</button></div></div></div>}

    <div className="wizard-layout">
      <div className="wizard-main">
        {step === 0 && <StepCard title="What kind of business are you building?" sub="Pick the closest match. BOSS will use this to recommend the right starting point."><div className="option-grid eight">{businessTypes.map(({id,label,icon:Icon}) => <button key={id} type="button" className={data.businessType===id ? 'choice-card selected' : 'choice-card'} onClick={()=>setData({...data,businessType:id})}><span className="choice-icon"><Icon size={20}/></span><strong>{label}</strong></button>)}</div><div className="wizard-fields"><label>Business name<input value={data.businessName} onChange={e=>setData({...data,businessName:e.target.value})} placeholder="e.g. Kampala Kitchen"/></label><label>Country / market<input value={data.country} onChange={e=>setData({...data,country:e.target.value})} placeholder="Uganda"/></label></div></StepCard>}
        {step === 1 && <StepCard title="What do you want BOSS to help you achieve?" sub="Choose as many as you need."><div className="option-grid">{goals.map(({id,label,icon:Icon}) => <button key={id} type="button" className={data.goals.includes(id) ? 'choice-card selected' : 'choice-card'} onClick={()=>setData({...data,goals:toggle(data.goals,id)})}><span className="choice-icon"><Icon size={20}/></span><strong>{label}</strong><span className="choice-check">{data.goals.includes(id) ? <CheckCircle2 size={17}/> : null}</span></button>)}</div></StepCard>}
        {step === 2 && <StepCard title="Which tools should be included?" sub="These are the building blocks BOSS can combine into one setup."><div className="option-grid">{channels.map(({id,label,icon:Icon}) => <button key={id} type="button" className={data.channels.includes(id) ? 'choice-card selected' : 'choice-card'} onClick={()=>setData({...data,channels:toggle(data.channels,id)})}><span className="choice-icon"><Icon size={20}/></span><strong>{label}</strong><span className="choice-check">{data.channels.includes(id) ? <CheckCircle2 size={17}/> : null}</span></button>)}</div><div className="wizard-note"><ShieldCheck size={17}/><span>Start with the essentials. You can add more features later from your BOSS dashboard.</span></div></StepCard>}
        {step === 3 && <StepCard title="What should your brand feel like?" sub="This sets the direction for the first design and preview. You can change it later."><div className="style-grid">{styles.map(s=><button key={s} type="button" className={data.style===s ? 'style-card selected' : 'style-card'} onClick={()=>setData({...data,style:s})}><span className={`style-swatch style-${styles.indexOf(s)}`}/><div><strong>{s}</strong><small>{s==='Clean & modern'?'Crisp, calm and versatile.':s==='Bold & energetic'?'High contrast and punchy.':s==='Premium & elegant'?'Polished and refined.':'Warm, welcoming and simple.'}</small></div>{data.style===s&&<Check size={16}/>}</button>)}</div></StepCard>}
        {step === 4 && <StepCard title="Choose your starting level" sub="These are starting ranges, not a final quote. BOSS will tailor the build to your needs."><div className="plan-grid">{plans.map(p=><button key={p.id} type="button" className={data.plan===p.id ? 'plan-card selected' : 'plan-card'} onClick={()=>setData({...data,plan:p.id})}><div className="plan-head"><strong>{p.label}</strong><span>{p.range}</span></div><p>{p.desc}</p>{data.plan===p.id&&<div className="selected-tag"><Check size={13}/> Recommended starting point</div>}</button>)}</div></StepCard>}
                {step === 5 && <StepCard title="Where should BOSS send your project details?" sub="These details go directly to the BOSS build team. We’ll use them to prepare your first version."><div className="wizard-fields single"><label>Your name<input required value={data.name} onChange={e=>setData({...data,name:e.target.value})} placeholder="Your name"/></label><label>Email<input required type="email" value={data.email} onChange={e=>setData({...data,email:e.target.value})} placeholder="you@example.com"/></label><label>WhatsApp / phone<input required value={data.phone} onChange={e=>setData({...data,phone:e.target.value})} placeholder="+256 ..."/></label><label>Anything else BOSS should know?<textarea rows="5" value={data.notes} onChange={e=>setData({...data,notes:e.target.value})} placeholder="Tell us about your products, services, booking process, etc."/></label></div></StepCard>}
        {step === 6 && <StepCard title="Review your BOSS setup" sub="Everything looks good? Build with BOSS and your full brief will be sent to the admin team."><div className="review-grid"><div><span>Business</span><strong>{data.businessName}</strong><small>{businessTypes.find(x=>x.id===data.businessType)?.label}</small></div><div><span>Plan</span><strong>{chosenPlan.label}</strong><small>Starting build package</small></div><div><span>Tools</span><strong>{data.channels.length} selected</strong><small>{data.channels.map(x=>channels.find(c=>c.id===x)?.label).join(', ')}</small></div><div><span>Style</span><strong>{data.style}</strong><small>{data.goals.map(x=>goals.find(g=>g.id===x)?.label).join(', ')}</small></div><div className="review-recommend"><div className="eyebrow">Recommended build</div>{recommended.website && <p><Globe2 size={15}/> {recommended.website.name}</p>}{recommended.bot && <p><Bot size={15}/> {recommended.bot.name}</p>}<small>Your brief is sent to the BOSS admin team when you click Build my BOSS setup. We’ll then prepare the first version for you.</small></div></div></StepCard>}
        <div className="wizard-actions">{step > 0 && <button className="secondary-button" onClick={back}><ArrowLeft size={16}/> Back</button>}{step < STEPS.length - 1 ? <button className="primary-button" disabled={!canContinue} onClick={next}>Continue <ArrowRight size={16}/></button> : <button className="primary-button" disabled={!canContinue} onClick={start}>Build my BOSS setup <Rocket size={16}/></button>}</div>
      </div>

      <aside className="wizard-summary"><div className="summary-card sticky-summary"><div className="eyebrow">Your BOSS plan</div><h3>{data.businessName || 'Your business'}</h3><div className="summary-list"><SummaryItem icon={BriefcaseBusiness} label="Business" value={businessTypes.find(x=>x.id===data.businessType)?.label || 'Choose a business type'}/><SummaryItem icon={Sparkles} label="Goals" value={data.goals.length ? `${data.goals.length} selected` : 'Choose your goals'}/><SummaryItem icon={Globe2} label="Tools" value={data.channels.length ? data.channels.map(x=>channels.find(c=>c.id===x)?.label).join(', ') : 'Choose your tools'}/><SummaryItem icon={Palette} label="Style" value={data.style || 'Choose a style'}/><SummaryItem icon={ShoppingCart} label="Plan" value={plans.find(p=>p.id===data.plan)?.label || 'Choose a plan'}/></div><div className="recommend-box"><div className="eyebrow">BOSS recommends</div>{recommended.website && <div className="recommend-row"><Globe2 size={16}/><span><strong>{recommended.website.name}</strong><small>Website foundation</small></span></div>}{recommended.bot && <div className="recommend-row"><Bot size={16}/><span><strong>{recommended.bot.name}</strong><small>AI assistant</small></span></div>}<p>When you build, your brief is sent to the BOSS admin team. They prepare the first version and return it to your dashboard.</p></div></div></aside>
    </div>
  </section>;
}

function StepCard({title,sub,children}) { return <div className="wizard-card"><div className="wizard-card-head"><div><div className="eyebrow">Step into BOSS</div><h2>{title}</h2><p>{sub}</p></div></div>{children}</div>; }
function SummaryItem({icon:Icon,label,value}) { return <div className="summary-item"><span className="summary-item-icon"><Icon size={16}/></span><div><small>{label}</small><strong>{value}</strong></div></div>; }
