const KEYS = {
  orders: 'boss_orders',
  user: 'boss_user',
  projects: 'boss_projects',
  messages: 'boss_messages',
  settings: 'boss_settings'
};

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; }

export function getOrders() { return read(KEYS.orders, []); }
export function saveOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  write(KEYS.orders, orders);
  return order;
}
export function updateOrder(id, patch) {
  const orders = getOrders().map(order => order.id === id ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order);
  return write(KEYS.orders, orders);
}
export function getOrder(id) { return getOrders().find(o => o.id === id) || null; }

export function getUser() { return read(KEYS.user, null); }
export function setUser(user) { return write(KEYS.user, { ...user, updatedAt: new Date().toISOString() }); }
export function updateUser(patch) { return setUser({ ...(getUser() || {}), ...patch }); }
export function clearUser() { localStorage.removeItem(KEYS.user); }

export function getProjects() { return read(KEYS.projects, []); }
export function saveProject(project) {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) projects[index] = { ...projects[index], ...project, updatedAt: new Date().toISOString() };
  else projects.unshift({ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  return write(KEYS.projects, projects);
}
export function getProject(id) { return getProjects().find(p => p.id === id) || null; }

export function getMessages(projectId) {
  const all = read(KEYS.messages, []);
  return projectId ? all.filter(m => m.projectId === projectId) : all;
}
export function saveMessage(message) {
  const all = read(KEYS.messages, []);
  all.push({ ...message, id: makeId('MSG'), createdAt: new Date().toISOString() });
  write(KEYS.messages, all);
  return message;
}

export function getSettings() { return read(KEYS.settings, { paymentMode: 'manual', currency: 'USD' }); }
export function saveSettings(patch) { return write(KEYS.settings, { ...getSettings(), ...patch }); }

export function markPayment(orderId, paymentStatus='Paid', paymentMethod='manual') {
  return updateOrder(orderId, { paymentStatus, paymentMethod, paidAt: paymentStatus === 'Paid' ? new Date().toISOString() : null });
}

export function exportData() {
  return {
    exportedAt: new Date().toISOString(),
    orders: getOrders(), projects: getProjects(), messages: getMessages(), user: getUser(), settings: getSettings()
  };
}

export function importData(payload) {
  if (payload?.orders) write(KEYS.orders, payload.orders);
  if (payload?.projects) write(KEYS.projects, payload.projects);
  if (payload?.messages) write(KEYS.messages, payload.messages);
  if (payload?.settings) write(KEYS.settings, payload.settings);
  if (payload?.user) write(KEYS.user, payload.user);
}

export function money(value, currency='USD') {
  const code = currency === 'UGX' ? 'UGX' : 'USD';
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: code === 'UGX' ? 0 : 0 }).format(Number(value)); }
  catch { return `${code} ${Number(value).toFixed(0)}`; }
}
export function makeId(prefix = 'ORD') { return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }
