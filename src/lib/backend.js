import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export function getSupabaseConfigIssue() {
  if (!url) return 'Supabase URL is missing. Add VITE_SUPABASE_URL to your .env file.';
  if (!/^https:\/\//i.test(url)) return 'Supabase URL must start with https://';
  if (!key) return 'Supabase publishable key is missing. Add VITE_SUPABASE_ANON_KEY to your .env file.';
  if (String(key).startsWith('sb_secret_')) return 'A Supabase secret key was placed in VITE_SUPABASE_ANON_KEY. Use the sb_publishable_ key there instead.';
  return '';
}

export const supabase = !getSupabaseConfigIssue() ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
export const backendMode = supabase ? 'supabase' : 'local';

export async function signInWithPassword(email, password) {
  if (!supabase) throw new Error(getSupabaseConfigIssue() || 'Supabase is not configured.');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}
export async function signUpWithPassword(email, password, profile={}) {
  if (!supabase) throw new Error(getSupabaseConfigIssue() || 'Supabase is not configured.');
  try {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: profile } });
    if (error) throw error;
    return data;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}


export async function resetPasswordForEmail(email) {
  if (!supabase) throw new Error(getSupabaseConfigIssue() || 'Supabase is not configured.');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
    if (error) throw error;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export async function updatePassword(password) {
  if (!supabase) throw new Error(getSupabaseConfigIssue() || 'Supabase is not configured.');
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    throw normalizeSupabaseError(error);
  }
}

export function normalizeSupabaseError(error) {
  const raw = String(error?.message || error || 'Unknown error');
  const lower = raw.toLowerCase();
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('fetch failed')) {
    return new Error('BOSS could not reach Supabase. Check VITE_SUPABASE_URL, make sure your Supabase project is active, and confirm the publishable key is correct. Then restart the Vite server.');
  }
  if (lower.includes('email not confirmed')) return new Error('Your email has not been confirmed yet. Check your inbox and confirm the Supabase email before signing in.');
  if (lower.includes('invalid login credentials')) return new Error('Email or password is incorrect.');
  if (lower.includes('user already registered')) return new Error('An account with this email already exists. Sign in instead.');
  return error instanceof Error ? error : new Error(raw);
}

export async function testSupabaseConnection() {
  if (!supabase) return { ok: false, message: getSupabaseConfigIssue() || 'Supabase is not configured.' };
  try {
    const { error } = await supabase.auth.getSession();
    if (error) return { ok: false, message: normalizeSupabaseError(error).message };
    return { ok: true, message: 'Supabase connection is reachable.' };
  } catch (error) {
    return { ok: false, message: normalizeSupabaseError(error).message };
  }
}
export async function signOutRemote() { if (supabase) await supabase.auth.signOut(); }
export async function getRemoteUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user || null;
}
export async function getRemoteProfile(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}
export async function createRemoteBuildRequest(request) {
  if (!supabase) return null;
  const user = await getRemoteUser();
  if (!user) throw new Error('Please sign in before submitting a BOSS build request.');
  const { data, error } = await supabase.rpc('submit_build_request', {
    p_id: request.id,
    p_name: request.name,
    p_email: request.email,
    p_phone: request.phone,
    p_business_name: request.business,
    p_business_type: request.businessType || null,
    p_country: request.country || null,
    p_goals: request.goals || [],
    p_channels: request.channels || [],
    p_style: request.style || null,
    p_plan: request.plan || null,
    p_notes: request.notes || '',
    p_recommended_website_id: request.recommendedWebsiteId || null,
    p_recommended_website_name: request.recommendedWebsiteName || null,
    p_recommended_bot_id: request.recommendedBotId || null,
    p_recommended_bot_name: request.recommendedBotName || null
  });
  if (error) throw error;
  return data;
}

export async function listRemoteBuildRequests(userId, options = {}) {
  if (!supabase || !userId) return [];
  if (options.admin) {
    const { data, error } = await supabase.rpc('admin_list_build_requests');
    if (error) throw error;
    return data || [];
  }
  const { data, error } = await supabase.from('build_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}

export async function updateRemoteBuildRequest(id, patch) {
  if (!supabase || !id) return null;
  const { data, error } = await supabase.rpc('admin_update_build_request', {
    p_id: id,
    p_status: 'status' in patch ? patch.status : null,
    p_admin_message: 'adminMessage' in patch ? patch.adminMessage : null,
    p_delivery_url: 'deliveryUrl' in patch ? patch.deliveryUrl : null,
    p_delivery_message: 'deliveryMessage' in patch ? patch.deliveryMessage : null
  });
  if (error) throw error;
  return data;
}

export async function listRemoteOrders(userId, options = {}) {
  if (!supabase || !userId) return [];
  if (options.admin) {
    // Primary path: the authenticated admin session reads the orders table directly.
    // This keeps the dashboard working even when the optional RPC migration has not
    // been applied yet, while RLS still enforces the admin-only read policy.
    const direct = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500);
    if (!direct.error && direct.data?.length) return direct.data;
    if (direct.error) console.warn('BOSS admin direct order query failed:', direct.error.message);

    // Secondary path: use the security-definer admin RPC when the direct query is
    // blocked by an older/partial RLS installation.
    let rpc = await supabase.rpc('admin_get_build_queue');
    if (rpc.error) rpc = await supabase.rpc('admin_list_orders');
    if (!rpc.error) return rpc.data || [];

    const reason = rpc.error?.message || direct.error?.message || 'No orders could be loaded.';
    throw new Error(`Admin order loading failed: ${reason}. Run supabase/admin-build-request-fix.sql in your BOSS Supabase project, then refresh the dashboard.`);
  }
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) throw error;
  return data || [];
}
export async function createRemoteOrder(order) {
  if (!supabase) return null;
  const user = await getRemoteUser();
  if (!user) throw new Error('Please sign in before placing a real order.');
  const payload = {
    id: order.id,
    user_id: user.id,
    product_id: order.productId,
    name: order.name,
    email: order.email,
    phone: order.phone,
    business: order.business,
    notes: order.notes || order.requirements || '',
    price: order.price,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus || 'Pending',
    status: order.status || 'New',
    payment_reference: order.paymentReference || null,
    billing_type: order.billingType || 'one-time',
    subscription_plan_id: order.subscriptionPlanId || null,
    subscription_status: order.subscriptionStatus || 'not_applicable',
    package_id: order.packageId || null,
    build_details: order.buildDetails || null,
  };
  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function updateRemoteOrder(id, patch) {
  if (!supabase || !id) return null;
  const safe = { updated_at: new Date().toISOString() };
  if ('status' in patch) safe.status = patch.status;
  if ('payment_status' in patch) safe.payment_status = patch.payment_status;
  if ('payment_method' in patch) safe.payment_method = patch.payment_method;
  if ('payment_reference' in patch) safe.payment_reference = patch.payment_reference;
  if ('notes' in patch) safe.notes = patch.notes;
  if ('delivery_url' in patch) safe.delivery_url = patch.delivery_url;
  if ('delivery_message' in patch) safe.delivery_message = patch.delivery_message;
  if ('subscription_status' in patch) safe.subscription_status = patch.subscription_status;
  if ('build_details' in patch) safe.build_details = patch.build_details;
  const { data, error } = await supabase.from('orders').update(safe).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function listRemoteProjects(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function getRemoteProject(id, productId=null) {
  if (!supabase) return null;
  if (id) { const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle(); if (error) throw error; if (data) return data; }
  if (productId) { const { data, error } = await supabase.from('projects').select('*').eq('product_id', productId).order('updated_at',{ascending:false}).limit(1).maybeSingle(); if(error)throw error; return data; }
  return null;
}
export async function saveRemoteProject(project) {
  if (!supabase) return null;
  const user = await getRemoteUser();
  if (!user) throw new Error('Please sign in before saving a real project.');
  const payload = {
    id: project.id,
    user_id: user.id,
    product_id: project.productId,
    type: project.type,
    product_name: project.productName,
    data: project.data || {},
    live: !!project.live,
  };
  const { data, error } = await supabase.from('projects').upsert(payload).select().single();
  if (error) throw error;
  return data;
}
export async function saveRemoteMessage(message) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('bot_messages').insert({ project_id: message.projectId, sender: message.sender, message: message.message }).select().single();
  if (error) throw error;
  return data;
}

export function toLocalUser(remoteUser, profile) {
  return {
    name: profile?.name || remoteUser?.user_metadata?.name || 'Customer',
    email: remoteUser?.email || '',
    role: profile?.role || 'customer',
    remoteId: remoteUser?.id,
  };
}

export function subscribeToAuth(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe() {} } } };
  return supabase.auth.onAuthStateChange(callback).data;
}
export async function updateRemoteProfile(patch) {
  if (!supabase) return null;
  const user = await getRemoteUser();
  if (!user) throw new Error('Please sign in first.');
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', user.id).select().single();
  if (error) throw error;
  return data;
}
export async function startPesapalPayment(recordType, recordId, billingType = null) {
  if (!supabase) throw new Error(getSupabaseConfigIssue() || 'Supabase is not configured.');
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error('Please sign in before paying.');
  const response = await fetch('/api/pesapal-create-payment', {
    method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
    body:JSON.stringify({recordType, recordId, billingType})
  });
  const result = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(result.error || 'Could not start Pesapal checkout.');
  return result;
}

export async function verifyPesapalPayment(trackingId, merchantReference) {
  if (!supabase) throw new Error(getSupabaseConfigIssue() || 'Supabase is not configured.');
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error('Please sign in to verify your payment.');
  const query = new URLSearchParams();
  if (trackingId) query.set('OrderTrackingId', trackingId);
  if (merchantReference) query.set('OrderMerchantReference', merchantReference);
  const response = await fetch(`/api/pesapal-payment-status?${query}`, {headers:{Authorization:`Bearer ${token}`}});
  const result = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(result.error || 'Payment verification failed.');
  return result;
}
