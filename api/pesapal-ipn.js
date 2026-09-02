import { createClient } from '@supabase/supabase-js';
const SANDBOX_BASE='https://cybqa.pesapal.com/pesapalv3', LIVE_BASE='https://pay.pesapal.com/v3';
const BOSS_CURRENCY='USD';
async function token(base,key,secret){const r=await fetch(`${base}/api/Auth/RequestToken`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({consumer_key:key,consumer_secret:secret})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.token)throw new Error(d?.message||'Pesapal authentication failed.');return d.token;}
export default async function handler(req,res){
 const q=req.method==='GET'?req.query:(req.body||{});const tracking=String(q.OrderTrackingId||'');const ref=String(q.OrderMerchantReference||'');const type=String(q.OrderNotificationType||'');
 if(!tracking||!ref)return res.status(400).json({status:400,error:'Missing Pesapal notification fields.'});
 const {SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,PESAPAL_ENV='sandbox',PESAPAL_CONSUMER_KEY,PESAPAL_CONSUMER_SECRET}=process.env;
 if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!PESAPAL_CONSUMER_KEY||!PESAPAL_CONSUMER_SECRET)return res.status(500).json({status:500,error:'Payment service unavailable.'});
 try{
  const db=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});const base=PESAPAL_ENV==='live'?LIVE_BASE:SANDBOX_BASE;const t=await token(base,PESAPAL_CONSUMER_KEY,PESAPAL_CONSUMER_SECRET);const r=await fetch(`${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(tracking)}`,{headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${t}`}});const d=await r.json();const table=ref.includes('-BR-')?'build_requests':'orders';const {data:record}=await db.from(table).select('*').eq('payment_reference',ref).maybeSingle();
  if(!record)return res.status(200).json({orderNotificationType:type,orderTrackingId:tracking,orderMerchantReference:ref,status:200});
  const st=String(d.payment_status_description||'').toUpperCase();const receivedAmount=Number(d.amount);const receivedCurrency=String(d.currency||'').toUpperCase();const expectedAmount=Number(record.price);const good=st==='COMPLETED'&&Number.isFinite(receivedAmount)&&receivedAmount>=expectedAmount&&receivedCurrency===BOSS_CURRENCY;const patch=good?{payment_status:'Paid',status:table==='build_requests'?'Build requested':(record.status==='Awaiting payment'?'In progress':record.status),payment_method:'pesapal'}:st==='FAILED'?{payment_status:'Failed'}:st==='REVERSED'?{payment_status:'Reversed'}:{payment_status:'Awaiting payment'};await db.from(table).update({...patch,pesapal_tracking_id:tracking,updated_at:new Date().toISOString()}).eq('id',record.id);return res.status(200).json({orderNotificationType:type,orderTrackingId:tracking,orderMerchantReference:ref,status:200});
 }catch(e){return res.status(500).json({status:500,error:e.message||'IPN processing failed.'});}
}
