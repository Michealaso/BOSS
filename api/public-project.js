import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'Backend not configured.' });
  const id = String(req.query?.id || '');
  if (!id) return res.status(400).json({ error: 'id is required.' });
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth:{autoRefreshToken:false,persistSession:false} });
  const { data, error } = await db.from('projects').select('id,product_id,type,product_name,data,live,updated_at').eq('id', id).eq('live', true).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Published project not found.' });
  return res.status(200).json(data);
}
