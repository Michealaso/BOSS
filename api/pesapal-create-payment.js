import { createClient } from '@supabase/supabase-js';

const SANDBOX_BASE='https://cybqa.pesapal.com/pesapalv3';
const LIVE_BASE='https://pay.pesapal.com/v3';

async function getToken(base,key,secret){
  const r=await fetch(`${base}/api/Auth/RequestToken`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({consumer_key:key,consumer_secret:secret})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok || !d.token) throw new Error(d?.message||d?.error?.message||'Pesapal authentication failed.');
  return d.token;
}

async function getAuthenticatedUser(token){
  const supabaseUrl=process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL;
  const anonKey=process.env.VITE_SUPABASE_ANON_KEY;
  if(!supabaseUrl||!anonKey) throw new Error('Supabase server authentication is not configured.');
  const authClient=createClient(supabaseUrl,anonKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data,error}=await authClient.auth.getUser(token);
  if(error||!data?.user) throw new Error(error?.message||'Invalid Supabase session.');
  return data.user;
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const {SUPABASE_SERVICE_ROLE_KEY,PESAPAL_ENV='sandbox',PESAPAL_CONSUMER_KEY,PESAPAL_CONSUMER_SECRET,PESAPAL_CALLBACK_URL,PESAPAL_IPN_ID,PESAPAL_IPN_URL}=process.env;
    const supabaseUrl=process.env.VITE_SUPABASE_URL||process.env.SUPABASE_URL;
    if(!supabaseUrl||!SUPABASE_SERVICE_ROLE_KEY||!PESAPAL_CONSUMER_KEY||!PESAPAL_CONSUMER_SECRET) return res.status(503).json({error:'Pesapal is not configured yet.'});
    const auth=req.headers.authorization||'';
    const token=auth.startsWith('Bearer ')?auth.slice(7).trim():'';
    if(!token) return res.status(401).json({error:'Authentication required.'});
    let user;
    try{ user=await getAuthenticatedUser(token); }
    catch(error){ return res.status(401).json({error:`Supabase session validation failed: ${error?.message||'Invalid session.'}`}); }
    const db=createClient(supabaseUrl,SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
    const {recordType='order',recordId,billingType}=req.body||{};
    if(!recordId) return res.status(400).json({error:'recordId is required.'});
    const base=PESAPAL_ENV==='live'?LIVE_BASE:SANDBOX_BASE;
    const pesapalToken=await getToken(base,PESAPAL_CONSUMER_KEY,PESAPAL_CONSUMER_SECRET);
    let record,table;
    if(recordType==='build_request'){
      table='build_requests';
      const {data,error}=await db.from(table).select('*').eq('id',recordId).eq('user_id',user.id).maybeSingle();
      if(error) return res.status(500).json({error:`Could not load build request: ${error.message}`});
      if(!data) return res.status(404).json({error:'Build request not found.'});
      record=data;
      if(record.payment_status==='Paid') return res.status(409).json({error:'Build request is already paid.'});
      const mode=billingType==='monthly'?'monthly':'one-time';
      const {data:pkg,error:pkgError}=await db.from('boss_packages').select('id,one_time_price,monthly_price').eq('id',record.plan).maybeSingle();
      if(pkgError) return res.status(500).json({error:`Could not load BOSS package: ${pkgError.message}`});
      if(!pkg) return res.status(400).json({error:'The selected BOSS package is not configured.'});
      record.billing_type=mode;
      record.price=mode==='monthly'?Number(pkg.monthly_price):Number(pkg.one_time_price);
      const {error:updateError}=await db.from(table).update({billing_type:mode,price:record.price,payment_method:'pesapal',payment_status:'Awaiting payment',updated_at:new Date().toISOString()}).eq('id',record.id).eq('user_id',user.id);
      if(updateError) return res.status(500).json({error:`Could not prepare build request: ${updateError.message}`});
    }else{
      table='orders';
      const {data,error}=await db.from(table).select('*').eq('id',recordId).eq('user_id',user.id).maybeSingle();
      if(error) return res.status(500).json({error:`Could not load order: ${error.message}`});
      if(!data) return res.status(404).json({error:'Order not found.'});
      record=data;
      if(record.payment_status==='Paid') return res.status(409).json({error:'Order is already paid.'});
    }
    const merchantRef=`BOSS-${recordType==='build_request'?'BR':'ORD'}-${String(record.id).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,35)}-${Date.now()}`.slice(0,50);
    const notificationId=PESAPAL_IPN_ID;
    if(!notificationId) return res.status(503).json({error:'PESAPAL_IPN_ID is missing. Register the BOSS IPN URL and add its ID to the server environment.'});
    const callback=PESAPAL_CALLBACK_URL||`${process.env.VITE_SITE_URL||req.headers.origin}/payment/return`;
    const fullName=String(record.name||'Customer').trim().split(/\s+/); const first=fullName.shift()||'Customer'; const last=fullName.join(' ');
    const billingAddress={email_address:record.email,phone_number:record.phone||'',country_code:String(record.country||'UG').slice(0,2).toUpperCase(),first_name:first,middle_name:'',last_name:last,line_1:record.business||record.business_name||'BOSS Customer',line_2:'',city:'',state:'',postal_code:'',zip_code:''};
    const payload={id:merchantRef,currency:process.env.PESAPAL_CURRENCY||'UGX',amount:Number(record.price||0),description:(record.product_name||record.business_name||'BOSS service').slice(0,100),callback_url:callback,notification_id:notificationId,billing_address:billingAddress};
    if(record.billing_type==='monthly') payload.account_number=`BOSS-SUB-${record.id}`;
    const r=await fetch(`${base}/api/Transactions/SubmitOrderRequest`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:`Bearer ${pesapalToken}`},body:JSON.stringify(payload)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.redirect_url) return res.status(502).json({error:d?.message||d?.error?.message||'Pesapal checkout could not be created.',details:d});
    const patch={payment_reference:merchantRef,payment_method:'pesapal',payment_status:'Awaiting payment',updated_at:new Date().toISOString(),pesapal_tracking_id:d.order_tracking_id||d.orderTrackingId||null,pesapal_merchant_reference:merchantRef};
    const {error:patchError}=await db.from(table).update(patch).eq('id',record.id).eq('user_id',user.id);
    if(patchError) return res.status(500).json({error:`Payment was created but BOSS could not save the payment reference: ${patchError.message}`});
    return res.status(200).json({link:d.redirect_url,merchantReference:merchantRef,trackingId:d.order_tracking_id||d.orderTrackingId||null});
  }catch(error){
    console.error('pesapal-create-payment failed',error);
    return res.status(500).json({error:error?.message||'Unable to create Pesapal payment.'});
  }
}
