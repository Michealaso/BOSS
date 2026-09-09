import { createClient } from '@supabase/supabase-js';
const SANDBOX_BASE='https://cybqa.pesapal.com/pesapalv3', LIVE_BASE='https://pay.pesapal.com/v3';
const BOSS_CURRENCY='USD';
async function getToken(base,key,secret){const r=await fetch(`${base}/api/Auth/RequestToken`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({consumer_key:key,consumer_secret:secret})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.token)throw new Error(d?.message||'Pesapal authentication failed.');return d.token;}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const {SUPABASE_SERVICE_ROLE_KEY,PESAPAL_ENV='sandbox',PESAPAL_CONSUMER_KEY,PESAPAL_CONSUMER_SECRET}=process.env;
 const SUPABASE_URL=process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL;
 if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!PESAPAL_CONSUMER_KEY||!PESAPAL_CONSUMER_SECRET)return res.status(503).json({error:'Pesapal verification is not configured yet.'});
 const trackingId=String(req.query?.OrderTrackingId||req.query?.trackingId||'');const ref=String(req.query?.OrderMerchantReference||req.query?.merchantReference||'');if(!trackingId&&!ref)return res.status(400).json({error:'Pesapal tracking ID or merchant reference is required.'});
 try{
  const db=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
  const base=PESAPAL_ENV==='live'?LIVE_BASE:SANDBOX_BASE;
  const token=await getToken(base,PESAPAL_CONSUMER_KEY,PESAPAL_CONSUMER_SECRET);
  if(!trackingId)return res.status(400).json({error:'OrderTrackingId is required for Pesapal verification.'});
  const r=await fetch(`${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`,{headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${token}`}});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return res.status(502).json({error:d?.message||d?.error?.message||'Pesapal status lookup failed.',details:d});
  let table='orders',record=null;
  if(ref.includes('-BR-')){table='build_requests';const x=await db.from(table).select('*').eq('payment_reference',ref).maybeSingle();if(x.error)return res.status(500).json({error:`Could not load build request: ${x.error.message}`});record=x.data;}
  else{const x=await db.from(table).select('*').eq('payment_reference',ref).maybeSingle();if(x.error)return res.status(500).json({error:`Could not load order: ${x.error.message}`});record=x.data;}
  if(!record)return res.status(404).json({error:'BOSS payment record not found.',merchantReference:ref});
  const status=String(d.payment_status_description||d.payment_status||'').toUpperCase();
  const receivedAmount=Number(d.amount);const receivedCurrency=String(d.currency||'').toUpperCase();const expectedAmount=Number(record.price);
  const good=status==='COMPLETED'&&Number.isFinite(receivedAmount)&&receivedAmount>=expectedAmount&&receivedCurrency===BOSS_CURRENCY;
  const next=good?{payment_status:'Paid',status:table==='build_requests'?'Build requested':(record.status==='Awaiting payment'?'In progress':record.status),payment_method:'pesapal'}:status==='FAILED'?{payment_status:'Failed'}:status==='REVERSED'?{payment_status:'Reversed'}:{payment_status:'Awaiting payment'};
  const {error:updateError}=await db.from(table).update({...next,updated_at:new Date().toISOString(),pesapal_tracking_id:trackingId}).eq('id',record.id);
  if(updateError)return res.status(500).json({error:`Payment status was read but BOSS could not update the record: ${updateError.message}`});
  return res.status(200).json({verified:good,recordType:table==='build_requests'?'build_request':'order',recordId:record.id,paymentStatus:next.payment_status,pesapalStatus:status,amount:receivedAmount,currency:receivedCurrency,expectedAmount,expectedCurrency:BOSS_CURRENCY});
 }catch(error){console.error('pesapal-payment-status failed',error);return res.status(500).json({error:error?.message||'Unable to verify Pesapal payment.'});}
}
