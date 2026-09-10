import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, Send, ShieldCheck } from 'lucide-react';
import { allProducts } from '../data/products';
import { getUser, makeId, money, saveOrder, saveProject, updateOrder } from '../lib/store';
import { backendMode, createRemoteOrder, getRemoteUser, saveRemoteProject, startPesapalPayment } from '../lib/backend';

export default function Order() {
  const location = useLocation();
  const selected = location.state?.product;
  const wizard = location.state?.wizardData;
  const initialProduct = selected || allProducts[0];
  const [productId, setProductId] = useState(initialProduct.id);
  const product = useMemo(() => allProducts.find(p => p.id === productId) || initialProduct, [productId, initialProduct]);
  const user = getUser();
  const [form, setForm] = useState({ name: wizard?.name || user?.name || '', email: wizard?.email || user?.email || '', phone: wizard?.phone || '', business: wizard?.businessName || '', notes: wizard?.orderNotes || '' });
  const [paymentMethod, setPaymentMethod] = useState('manual');
  const [orderId, setOrderId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    try {
      const id = makeId();
      const draft = { id, ...form, userEmail: user?.email || form.email, productId: product.id, productName: product.name, productType: product.type, price: product.price, paymentMethod, paymentStatus: paymentMethod === 'test' ? 'Paid' : 'Pending', status: 'New', createdAt: new Date().toISOString(), requirements: form.notes };
      if (backendMode === 'supabase') {
        const remoteUser = await getRemoteUser();
        if (!remoteUser) throw new Error('Please sign in to place a real order.');
        const order = await createRemoteOrder(draft);
        const projectId = `PROJECT-${product.id}-${id}`;
        const projectData = product.type === 'chatbot' ? { botName: product.name, welcome: 'Hi! How can I help your customers today?', tone: 'Friendly', faqs: [{ q: 'What do you offer?', a: product.description }, { q: 'How do I contact you?', a: form.phone || 'Use the contact details on our website.' }] } : { business: form.business || 'Your Business', tagline: product.description, phone: form.phone || '', whatsapp: form.phone || '', location: 'Uganda', primary: product.colors?.[0] || '#635bff', cta: 'Contact us', sections: product.features || [] };
        await saveRemoteProject({ id: projectId, productId: product.id, type: product.type, productName: product.name, live: false, data: projectData });
        if (paymentMethod === 'pesapal') {
          const result = await startPesapalPayment('order', order.id);
          window.location.href = result.link;
          return;
        }
        setOrderId(id); setSubmitted(true); return;
      }
      saveOrder(draft);
      const projectId = `PROJECT-${product.id}-${id}`;
      saveProject({ id: projectId, productId: product.id, type: product.type, ownerEmail: user?.email || form.email, productName: product.name, live: false, orderId: id, data: product.type === 'chatbot' ? { botName: product.name, welcome: 'Hi! How can I help your customers today?', tone: 'Friendly', faqs: [{ q: 'What do you offer?', a: product.description }, { q: 'How do I contact you?', a: form.phone || 'Use the contact details on our website.' }] } : { business: form.business || 'Your Business', tagline: product.description, phone: form.phone || '', whatsapp: form.phone || '', location: 'Uganda', primary: product.colors?.[0] || '#635bff', cta: 'Contact us', sections: product.features || [] } });
      if (paymentMethod === 'test') updateOrder(id, { paymentReference: 'TEST-' + id.slice(-6), projectId }); else updateOrder(id, { projectId });
      setOrderId(id); setSubmitted(true);
    } catch (err) { setOrderId(''); setSubmitted(false); alert(err.message || 'Unable to place order.'); }
  }
  if (submitted) return <section className="container page-section narrow"><div className="success-card"><div className="success-icon"><CheckCircle2/></div><div className="eyebrow">Order {orderId}</div><h1>{paymentMethod === 'test' ? 'Payment test complete.' : 'We’ve got it.'}</h1><p>{paymentMethod === 'test' ? 'This is a local payment simulation. No money was charged.' : paymentMethod === 'pesapal' ? 'Your payment checkout was started. Your order will update after server-side verification.' : 'Your order is saved. The next payment step can be handled manually.'}</p>{paymentMethod !== 'test' && paymentMethod !== 'pesapal' && <div className="payment-instructions"><strong>Next step</strong><span>Send payment using your agreed method, then share the reference with BOSS support. An admin can mark the order paid.</span></div>}<div className="hero-actions centered"><Link className="primary-button" to="/dashboard">Open dashboard</Link><Link className="secondary-button" to="/websites">Keep browsing</Link></div></div></section>;
  return <section className="container page-section narrow">
    <Link className="back-link" to="/"><ArrowLeft size={15}/> Back</Link>
    <div className="page-heading simple"><div><div className="eyebrow"><Send size={14}/> Order</div><h1>Tell us what to build.</h1><p>Choose the product, give us your details, then choose how you want to handle payment.</p></div></div>
    <form className="order-layout" onSubmit={submit}><div className="form-card"><h3>Project details</h3>
      <label>Product<select value={productId} onChange={e => setProductId(e.target.value)}>{allProducts.map(p => <option key={p.id} value={p.id}>{p.name} — {money(p.price)}</option>)}</select></label>
      <div className="two-col"><label>Your name<input required name="name" value={form.name} onChange={onChange}/></label><label>Email<input required type="email" name="email" value={form.email} onChange={onChange}/></label></div>
      <div className="two-col"><label>WhatsApp / phone<input required name="phone" value={form.phone} onChange={onChange}/></label><label>Business name<input required name="business" value={form.business} onChange={onChange}/></label></div>
      <label>What do you want it to do?<textarea name="notes" value={form.notes} onChange={onChange} rows="6" placeholder="Example: add my menu, WhatsApp number, opening hours, and a booking form."/></label>
      <h3 className="builder-subhead"><CreditCard size={17}/> Payment</h3>
      <div className="payment-options"><label className={paymentMethod==='pesapal'?'payment-option selected':'payment-option'}><input type="radio" checked={paymentMethod==='pesapal'} onChange={()=>setPaymentMethod('pesapal')}/><span><strong>Pay online</strong><small>Pesapal checkout presents the payment methods enabled for your merchant account.</small></span></label><label className={paymentMethod==='manual'?'payment-option selected':'payment-option'}><input type="radio" checked={paymentMethod==='manual'} onChange={()=>setPaymentMethod('manual')}/><span><strong>Manual / mobile payment</strong><small>Place the order first. You can verify payment from the admin side.</small></span></label>{backendMode==='local' && <label className={paymentMethod==='test'?'payment-option selected':'payment-option'}><input type="radio" checked={paymentMethod==='test'} onChange={()=>setPaymentMethod('test')}/><span><strong>Payment test</strong><small>Local simulation only — no money is charged.</small></span></label>}</div>
      <button className="primary-button large full" type="submit"><CreditCard size={17}/> Submit order</button>
      <div className="small-note"><ShieldCheck size={15}/> Payment secrets stay server-side. Pesapal must be configured before real online payments work.</div>
    </div><aside className="summary-card"><div className="eyebrow">Your selection</div><h3>{product.name}</h3><p>{product.description}</p><div className="summary-price">{money(product.price)} <span>one-time setup</span></div><div className="check-list">{product.features.slice(0,5).map(x=><div key={x}><CheckCircle2 size={14}/>{x}</div>)}</div></aside></form>
  </section>;
}
