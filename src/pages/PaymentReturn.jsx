import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';
import { verifyPesapalPayment } from '../lib/backend';

export default function PaymentReturn(){
  const [params] = useSearchParams(); const [state,setState]=useState('loading'); const [result,setResult]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{ const tracking=params.get('OrderTrackingId'); const merchantRef=params.get('OrderMerchantReference'); if(!tracking||!merchantRef){setState('error');setError('The Pesapal payment return did not include the transaction details.');return;} verifyPesapalPayment(tracking,merchantRef).then(r=>{setResult(r);setState(r.verified?'success':'error');}).catch(e=>{setState('error');setError(e.message||'Unable to verify the payment.');}); },[params]);
  return <section className="container page-section narrow"><div className="success-card">{state==='loading'?<><div className="success-icon"><LoaderCircle className="spin"/></div><div className="eyebrow">Pesapal payment verification</div><h1>Checking your payment…</h1><p>BOSS is verifying the transaction with Pesapal. Keep this page open.</p></>:state==='success'?<><div className="success-icon"><CheckCircle2/></div><div className="eyebrow">Payment confirmed</div><h1>You're all set.</h1><p>Order <strong>{result.orderId}</strong> is now marked <strong>{result.paymentStatus}</strong> and can move into production.</p></>:<><div className="success-icon"><XCircle/></div><div className="eyebrow">Payment not confirmed</div><h1>We couldn't confirm it yet.</h1><p>{error || 'The transaction could not be verified. Check your dashboard or contact BOSS support.'}</p></>}<div className="hero-actions centered"><Link className="primary-button" to="/dashboard">Open dashboard</Link><Link className="secondary-button" to="/websites">Browse BOSS</Link></div></div></section>;
}
