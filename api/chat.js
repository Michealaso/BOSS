import { createClient } from '@supabase/supabase-js';

function faqFallback(data, text) {
  const lower = text.toLowerCase();
  const hit = (data?.faqs || []).find(f => lower.includes(String(f.q || '').toLowerCase().split(/\s+/).slice(0,3).join(' ')) || String(f.q || '').toLowerCase().includes(lower));
  return hit?.a || 'I can help with the business information available to this assistant. Try asking about services, prices, hours or contact details.';
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  const { projectId, message } = req.body || {};
  if (!projectId || !message || String(message).length > 1200) return res.status(400).json({ error:'projectId and a reasonable message are required.' });
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI_API_URL, AI_API_KEY, AI_MODEL='gpt-4o-mini' } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error:'Backend is not configured.' });
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth:{autoRefreshToken:false,persistSession:false} });
  const { data: project } = await db.from('projects').select('id,type,data,live,product_name').eq('id', projectId).eq('live', true).maybeSingle();
  if (!project || project.type !== 'chatbot') return res.status(404).json({ error:'Published chatbot not found.' });
  const d = project.data || {};
  if (!AI_API_URL || !AI_API_KEY) return res.status(200).json({ reply: faqFallback(d, message), mode:'fallback' });
  const system = `You are ${d.botName || 'BOSS Assistant'} for a business. Tone: ${d.tone || 'Friendly'}. Answer only from the supplied business knowledge. If the answer is not present, say you do not have that information and suggest contacting the business. Knowledge:\n${JSON.stringify({faqs:d.faqs||[], business:d.business, tagline:d.tagline, phone:d.phone, whatsapp:d.whatsapp, location:d.location, sections:d.sections})}`;
  const response = await fetch(AI_API_URL, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${AI_API_KEY}`}, body:JSON.stringify({ model:AI_MODEL, messages:[{role:'system',content:system},{role:'user',content:String(message)}], temperature:0.2 }) });
  const result = await response.json();
  if (!response.ok) return res.status(502).json({ error: result?.error?.message || 'AI provider error.' });
  const reply = result?.choices?.[0]?.message?.content || faqFallback(d, message);
  return res.status(200).json({ reply, mode:'ai' });
}
