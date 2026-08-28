function esc(value='') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

export function websiteHtml(project) {
  const d = project.data || {};
  const sections = (d.sections || []).map((x, i) => `<article><div class="icon">${i+1}</div><h3>${esc(x)}</h3><p>Ready for your business content, offers and customer information.</p></article>`).join('');
  const phone = String(d.phone || '').replace(/[^0-9+]/g,'');
  const wa = String(d.whatsapp || '').replace(/\D/g,'');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(d.business || 'Your Business')}</title><style>:root{--a:${esc(d.primary || '#635bff')} }*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a}header{display:flex;align-items:center;gap:24px;padding:18px 6vw;border-bottom:1px solid #e5e7eb}header strong{margin-right:auto;font-size:20px}header a{background:var(--a);color:white;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:800}main{padding:90px 6vw;background:linear-gradient(135deg,#f8fafc,#eef2ff)}.kicker{color:var(--a);font-weight:900;letter-spacing:.12em;font-size:12px}.hero{max-width:850px}.hero h1{font-size:clamp(42px,7vw,72px);line-height:1;letter-spacing:-.06em;margin:12px 0}.hero p{font-size:18px;color:#64748b}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.actions a,.actions button{border:0;padding:12px 15px;border-radius:10px;text-decoration:none;font-weight:800}.primary{background:var(--a);color:#fff}.secondary{background:#fff;color:#0f172a;border:1px solid #e5e7eb!important}.grid{max-width:1100px;margin:auto;padding:36px 6vw;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.grid article{border:1px solid #e5e7eb;border-radius:16px;padding:22px}.icon{width:30px;height:30px;border-radius:9px;background:#eef2ff;color:var(--a);display:grid;place-items:center;font-weight:900}footer{text-align:center;padding:30px;color:#64748b;border-top:1px solid #eef2f7}@media(max-width:650px){header nav{display:none}}</style></head><body><header><strong>${esc(d.business || 'Your Business')}</strong><nav>Home &nbsp; Services &nbsp; About &nbsp; Contact</nav><a href="https://wa.me/${wa}">WhatsApp</a></header><main><div class="hero"><div class="kicker">BOSS WEBSITE</div><h1>${esc(d.tagline || 'A better way to serve your customers online.')}</h1><p>${esc(d.location || '')}${d.location && d.phone ? ' · ' : ''}${esc(d.phone || '')}</p><div class="actions"><a class="primary" href="tel:${phone}">${esc(d.cta || 'Contact us')}</a><a class="secondary" href="https://wa.me/${wa}">Message on WhatsApp</a></div></div></main><section class="grid">${sections}</section><footer>Built and delivered with BOSS.</footer></body></html>`;
}

export function chatbotExport(project) {
  return JSON.stringify({
    product: project.productName,
    projectId: project.id,
    bot: project.data || {},
    embed: `<script src="/boss-widget.js" data-boss-project="${project.id}"></script>`
  }, null, 2);
}

export function downloadText(filename, text, type='text/plain') {
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
