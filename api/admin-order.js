import { createClient } from '@supabase/supabase-js';
export default async function handler(req,res){
  if(req.method!=='PATCH') return res.status(405).end();
  const {SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY}=process.env; if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY)return res.status(503).json({error:'Backend not configured.'});
  const auth=req.headers.authorization||''; const token=auth.startsWith('Bearer ')?auth.slice(7):''; if(!token)return res.status(401).json({error:'Authentication required.'});
  const db=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}}); const {data:userData}=await db.auth.getUser(token); if(!userData?.user)return res.status(401).json({error:'Invalid session.'});
  const {data:profile}=await db.from('profiles').select('role').eq('id',userData.user.id).single(); if(profile?.role!=='admin')return res.status(403).json({error:'Forbidden.'});
  const {id,status,paymentStatus,paymentReference,deliveryUrl,deliveryMessage}=req.body||{}; if(!id)return res.status(400).json({error:'id required'}); const patch={updated_at:new Date().toISOString()}; if(status)patch.status=status; if(paymentStatus)patch.payment_status=paymentStatus; if(paymentReference!==undefined)patch.payment_reference=paymentReference; if(deliveryUrl!==undefined)patch.delivery_url=deliveryUrl; if(deliveryMessage!==undefined)patch.delivery_message=deliveryMessage; const {data,error}=await db.from('orders').update(patch).eq('id',id).select().single(); if(error)return res.status(400).json({error:error.message}); return res.status(200).json(data);
}
