(() => {
const BASE = document.body.dataset.base || '.';
const RAW = 'https://raw.githubusercontent.com/lucamartin32/lucamartin32.github.io/main/';
const CAT = {RE:'Remeras',BZ:'Buzos',PA:'Pantalones',JE:'Jeans',SH:'Shorts',CA:'Camperas',GO:'Gorras',ZA:'Zapatillas'};
const CAT_ORDER = ['ZA','BZ','RE','PA','JE','CA','SH','GO'];
const TOPB = ['Nike','Jordan','Tommy Hilfiger','Calvin Klein','adidas','New Balance'];
const $ = s => document.querySelector(s);
const f = {sec:'all', cat:'all', brands:new Set(), sizes:new Set(), sale:false, q:'', sort:'top'};
let CFG, DATA, BY = {}, RATE, shown = 40, cart = [], form = {nombre:'', lugar:''};

const money = v => '$' + Math.round(v).toLocaleString('es-AR');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const off = p => p.reg > p.clp + 1 ? (p.reg - p.clp) / p.reg : 0;
const imgs = p => (p.imgs && p.imgs.length ? p.imgs : [p.img]).filter(Boolean);
const store = { get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };

async function getJSON(urls){
  for (const u of urls){ try { const r = await fetch(u + '?t=' + Date.now(), {cache:'no-store'}); if (r.ok) return await r.json(); } catch(e){} }
  throw new Error('sin datos');
}
// ── normalización ──
const AR_RULES = [[new RegExp("(?<!\\p{L})Parka Vest(?!\\p{L})",'giu'),"Chaleco"],[new RegExp("(?<!\\p{L})Con Gorro(?!\\p{L})",'giu'),"Con Capucha"],[new RegExp("(?<!\\p{L})con gorro(?!\\p{L})",'giu'),"con capucha"],[new RegExp("(?<!\\p{L})B\u00e1sico Buzo(?!\\p{L})",'giu'),"B\u00e1sico Jogging"],[new RegExp("(?<!\\p{L})Pantal[o\u00f3]n de Buzo(?!\\p{L})",'giu'),"Jogging"],[new RegExp("(?<!\\p{L})Poleras(?!\\p{L})",'giu'),"Remeras"],[new RegExp("(?<!\\p{L})Polera(?!\\p{L})",'giu'),"Remera"],[new RegExp("(?<!\\p{L})Remera Polo(?!\\p{L})",'giu'),"Chomba"],[new RegExp("(?<!\\p{L})Poler[o\u00f3]nes(?!\\p{L})",'giu'),"Buzos"],[new RegExp("(?<!\\p{L})Poler[o\u00f3]n(?!\\p{L})",'giu'),"Buzo"],[new RegExp("(?<!\\p{L})Pole[o\u00f3]n(?!\\p{L})",'giu'),"Buzo"],[new RegExp("(?<!\\p{L})Jockeys?(?!\\p{L})",'giu'),"Gorra"],[new RegExp("(?<!\\p{L})Chaquetas(?!\\p{L})",'giu'),"Camperas"],[new RegExp("(?<!\\p{L})Chaqueta",'giu'),"Campera "],[new RegExp("(?<!\\p{L})Parkas?(?!\\p{L})",'giu'),"Campera"],[new RegExp("(?<!\\p{L})Cortavientos(?!\\p{L})",'giu'),"Rompevientos"],[new RegExp("(?<!\\p{L})Bototos?(?!\\p{L})",'giu'),"Borcegos"],[new RegExp("(?<!\\p{L})Peto(?!\\p{L})",'giu'),"Top"],[new RegExp("(?<!\\p{L})Pantalon(?!\\p{L})",'giu'),"Pantal\u00f3n"],[new RegExp("(?<!\\p{L})Caf[e\u00e9](?!\\p{L})",'giu'),"Marr\u00f3n"],[new RegExp("(?<!\\p{L})Burdeo(?!\\p{L})",'giu'),"Bord\u00f3"],[new RegExp("(?<!\\p{L})Naranjo(?!\\p{L})",'giu'),"Naranja"],[new RegExp("(?<!\\p{L})Rosado(?!\\p{L})",'giu'),"Rosa"],[new RegExp("(?<!\\p{L})Plomo(?!\\p{L})",'giu'),"Gris"],[new RegExp("(?<!\\p{L})Zapatillas? Vulcanizadas(?!\\p{L})",'giu'),"Zapatillas"]];
const arName = n => AR_RULES.reduce((s,[a,b]) => s.replace(a,b), n||'').replace(/\s{2,}/g,' ').trim();
const BRAND_FIX = {joran:'Jordan', jordan:'Jordan', nike:'Nike', 'nike aps':'Nike', adidas:'adidas', mitchellyness:'Mitchell & Ness', 'mitchell and ness':'Mitchell & Ness', 'mitchell y ness':'Mitchell & Ness', joia:'JOIA', levis:"Levi's", "levi's":"Levi's", puma:'Puma', 'new balance':'New Balance', lacoste:'Lacoste', vans:'Vans', converse:'Converse', 'new era':'New Era', on:'On'};
const CAPS = {'718':'7-1/8','714':'7-1/4','738':'7-3/8','712':'7-1/2','758':'7-5/8','734':'7-3/4'};
function cleanSize(t, cat){
  t = String(t).trim(); const u = t.toUpperCase();
  if (t.length > 12 && t.includes(' ')) return 'Único';
  if (u === '2XL' || u === 'XXL') return 'XXL';
  if (u === '3XL' || u === 'XXXL') return 'XXXL';
  if (/^(XS|S|M|L|XL)[-/](S|M|L|XL|XXL)$/.test(u)) return u.replace('-', '/');
  if (cat === 'GO' && CAPS[t]) return CAPS[t];
  if (cat === 'ZA') return zaSize(t);
  return t;
}
function zaSize(t){
  t = t.replace(/\s*(MEN|MEM|WMNS|UNSX|UNSEX|USNX)$/i, '').trim();
  let m = t.match(/^(US|UK|EU|CL)\s*(\d+(?:[.,]\d+)?)$/i); if (m){ const sys = parseFloat(m[2]) >= 30 && /^(US|UK)$/i.test(m[1]) ? 'EU' : m[1].toUpperCase(); return sys + ' ' + m[2].replace(',', '.'); }
  m = t.match(/^(\d+(?:[.,]\d+)?)$/); if (m){ const n = parseFloat(m[1].replace(',', '.')); return (n >= 30 ? 'EU ' : 'US ') + m[1].replace(',', '.'); }
  return t;
}
// etiquetas de filtro: un mismo talle puede responder a varios filtros (M/L → M y L; 34/32 → 34)
function tags(t, cat){
  if (cat === 'ZA') return [t];
  if (cat === 'GO') return ['Gorra ' + t];
  const m = t.match(/^(\d{2})(\/|$)/); if (m && ['PA','JE','SH'].includes(cat)) return ['W' + m[1]];
  if (/\//.test(t) && /^[A-Z/]+$/.test(t)) return t.split('/');
  return [t];
}
// ── precios ──
const hasMay = p => CFG.recargos.mayorista[p.cat] != null;
function price(p, clp, may){
  const step = CFG.redondeo || 500;
  const base = Math.ceil(clp * RATE / step) * step;
  if (may && hasMay(p)) return base + CFG.recargos.mayorista[p.cat];          // mayorista: base + recargo, sin redondear
  const r = CFG.redondeo_unidad || 1;                                        // unidad: redondeado hacia arriba (ej. a $5.000)
  return Math.ceil((base + CFG.recargos.unidad[p.cat]) / r) * r;
}
const MIN = () => CFG.mayorista_desde || 5;
const AUTO = () => CFG.mayorista_modo === 'auto';
const WA = t => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t)}`;
function ago(iso){
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  return m < 1 ? 'recién' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m/60)} h` : `hace ${Math.round(m/1440)} días`;
}
const isNew = p => p.first && !p.first.startsWith('2000') && (Date.now() - new Date(p.first)) < 3 * 864e5;
const isDrop = p => p.drop && (Date.now() - new Date(p.drop)) < 5 * 864e5;
function sk(t){ const sys = {US:100,UK:200,EU:300,CL:400}; const m0 = t.match(/^(US|UK|EU|CL)\s*(\d+(?:[.,]\d+)?)/i); if (m0) return sys[m0[1].toUpperCase()] + parseFloat(m0[2].replace(',', '.')); const o = {XXS:0,XS:1,S:2,M:3,L:4,XL:5,XXL:6,'2XL':6,'3XL':7,'Único':8}; if (t in o) return o[t]; const m = t.match(/\d+(?:[.,]\d+)?/); return m ? 10 + parseFloat(m[0].replace(',', '.')) : 999; }

// ── tarjeta ──
function card(p){
  const now = price(p, p.clp), was = off(p) > .04 ? price(p, p.reg) : null, pct = Math.round(off(p) * 100);
  const flag = isNew(p) ? '<span class="flag new">Nuevo</span>' : isDrop(p) ? '<span class="flag drop">Bajó de precio</span>' : was ? `<span class="flag sale">−${pct}%</span>` : '';
  return `<button class="card" type="button" data-c="${p.code}"><div class="ph"><img loading="lazy" decoding="async" alt="${esc(p.name)}" src="${esc(p.img)}">
    ${flag}${p.units != null && p.units <= 2 ? '<span class="flag last">Últimas</span>' : ''}</div>
    <div class="meta"><span class="b">${esc(p.brand)}</span><span class="n">${esc(p.name)}</span>
    <span class="p"><span class="now ${was ? 'sale' : ''}">${money(now)}</span>${was ? `<s>${money(was)}</s>` : ''}</span>
    ${AUTO() && hasMay(p) ? `<span class="p2">${money(price(p, p.clp, true))} llevando ${MIN()}+ prendas</span>` : ''}</div></button>`;
}
// ── catálogo ──
function pool(ignoreSize){
  const q = f.q.trim().toLowerCase();
  return DATA.productos.filter(p => (f.sec === 'all' || p.secs.includes(f.sec)) && (f.cat === 'all' || p.cat === f.cat) &&
    (!f.brands.size || f.brands.has(p.brand)) && (!f.sale || off(p) > .04 || isDrop(p)) && (ignoreSize || !f.sizes.size || p.sizes.some(s => s.tg.some(x => f.sizes.has(x)))) &&
    (!q || (p.name + ' ' + p.brand + ' ' + (p.color||'') + ' ' + p.code + ' ' + CAT[p.cat]).toLowerCase().includes(q)));
}
function setNav(){
  document.querySelectorAll('[data-sec]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sec === 'sale' ? f.sale : (!f.sale && f.sec === b.dataset.sec)));
  const cats = CAT_ORDER.filter(c => DATA.productos.some(p => p.cat === c && (f.sec === 'all' || p.secs.includes(f.sec))));
  $('#cats').innerHTML = [['all','Todo'], ...cats.map(c => [c, CAT[c]])].map(([v,l]) => `<button type="button" data-cat="${v}" aria-pressed="${f.cat===v}">${l}</button>`).join('');
}
function render(){
  setNav();
  const pc = p => price(p, p.clp);
  const rank = p => { const i = TOPB.indexOf(p.brand); return (i < 0 ? 9 : i) - off(p) * 4 - (isNew(p) ? 2 : 0); };
  let list = pool();
  if (f.sort === 'top') list.sort((a, c) => rank(a) - rank(c) || pc(a) - pc(c));
  if (f.sort === 'new') list.sort((a, c) => (c.first||'').localeCompare(a.first||'') || rank(a) - rank(c));
  if (f.sort === 'price') list.sort((a, c) => pc(a) - pc(c));
  if (f.sort === 'price-desc') list.sort((a, c) => pc(c) - pc(a));
  if (f.sort === 'off') list.sort((a, c) => off(c) - off(a));
  const nf = f.brands.size + f.sizes.size + (f.sort !== 'top');
  $('#fbtn-n').textContent = nf ? `(${nf})` : '';
  $('#count').textContent = ''; $('#count2').textContent = `${list.length.toLocaleString('es-AR')} productos`;
  const home = f.sec === 'all' && f.cat === 'all' && !f.sale && !f.q && !f.brands.size && !f.sizes.size;
  document.querySelectorAll('.home-only').forEach(e => e.hidden = !home);
  $('#grid').innerHTML = list.length ? list.slice(0, shown).map(card).join('') : '<p class="empty">No hay productos con esa búsqueda ahora mismo. Escribinos y te lo buscamos.</p>';
  $('#more').hidden = list.length <= shown;
}
function rails(){
  const tiles = CAT_ORDER.map(c => { const p = DATA.productos.filter(x => x.cat === c && TOPB.includes(x.brand)).sort((a,b) => off(b)-off(a))[0] || DATA.productos.find(x => x.cat === c); return p && [c, p]; }).filter(Boolean);
  $('#tiles').innerHTML = tiles.map(([c, p]) => `<button class="tile" type="button" data-cat="${c}" data-jump="1"><span class="tph"><img loading="lazy" decoding="async" alt="" src="${esc(p.img)}"></span><span class="tl">${CAT[c]}</span></button>`).join('');
  const nw = DATA.productos.filter(isNew).sort((a, b) => (b.first||'').localeCompare(a.first||''));
  const dr = DATA.productos.filter(isDrop).sort((a, b) => off(b) - off(a));
  const top = DATA.productos.filter(p => TOPB.slice(0,4).includes(p.brand) && off(p) > .2).sort((a,b) => off(b) - off(a));
  const pickTop = []; const seen = {}; for (const p of top){ const k = p.brand + p.cat; seen[k] = (seen[k]||0) + 1; if (seen[k] <= 2) pickTop.push(p); if (pickTop.length >= 12) break; }
  const sec = (id, items) => { const el = $(id); el.closest('.rail-wrap').hidden = !items.length; el.innerHTML = items.slice(0, 12).map(card).join(''); };
  sec('#r-new', nw); sec('#r-drop', dr); sec('#r-top', pickTop);
  const hero = []; const hs = new Set();
  const hk = p => p.brand + p.cat;
  for (const p of DATA.productos.filter(p => TOPB.includes(p.brand) && ['BZ','ZA','CA','RE'].includes(p.cat)).sort((a,b) => off(b)-off(a))){ if (hero.length >= 12) break; if (hs.has(hk(p))) continue; hs.add(hk(p)); hero.push(p); }
  const bi = p => `<button class="bi" type="button" data-open="${p.code}" aria-label="${esc(p.brand + ' ' + p.name)}"><img decoding="async" alt="" src="${esc(p.img)}"><span>${esc(p.brand)}</span></button>`;
  $('#belt').innerHTML = `<div class="belt-track">${hero.map(bi).join('')}</div><div class="belt-track" aria-hidden="true">${hero.map(bi).join('')}</div>`;
  $('#belt').querySelectorAll('[aria-hidden] button').forEach(b => b.tabIndex = -1);
}
function filtersUI(){
  const base = DATA.productos.filter(p => (f.sec==='all'||p.secs.includes(f.sec)) && (f.cat==='all'||p.cat===f.cat));
  const all = new Set(base.flatMap(p => p.sizes.flatMap(s => s.tg)));
  const LET = ['XS','S','M','L','XL','XXL','XXXL'].filter(x => all.has(x));
  const W = [...all].filter(x => /^W\d+$/.test(x)).sort((a, b) => +a.slice(1) - +b.slice(1));
  const ZA = [...all].filter(x => /^(US|UK|EU|CL) /.test(x)).sort((a, b) => sk(a) - sk(b));
  const gv = x => { const m = x.match(/(\d+)(?:-(\d+)\/(\d+))?/); return m ? +m[1] + (m[2] ? m[2] / m[3] : 0) : 100 + ['S/M','M','M/L','L','L/XL','Único'].indexOf(x.slice(6)); };
  const GO = [...all].filter(x => x.startsWith('Gorra ')).sort((a, b) => gv(a) - gv(b));
  const brands = [...new Set(base.map(p => p.brand))].sort((a,c) => a.localeCompare(c));
  const chip = (k, v, l) => `<button type="button" class="opt" data-m="${k}" data-v="${esc(v)}" aria-pressed="${f[k].has(v)}">${esc(l)}</button>`;
  const opt = (k, v, l) => `<button type="button" class="opt" data-k="${k}" data-v="${esc(v)}" aria-pressed="${f[k] === v}">${esc(l)}</button>`;
  const grp = (t, html) => html ? `<div class="grp"><h4>${t}</h4><div class="opts">${html}</div></div>` : '';
  $('#fbody').innerHTML =
    grp('Ordenar', [['top','Destacados'],['new','Recién llegados'],['price','Menor precio'],['price-desc','Mayor precio'],['off','Mayor descuento']].map(([v,l]) => opt('sort', v, l)).join('')) +
    grp('Talle de ropa', LET.map(x => chip('sizes', x, x)).join('')) +
    grp('Talle de pantalón / jean (cintura)', W.map(x => chip('sizes', x, x.slice(1))).join('')) +
    grp('Talle de zapatillas', ZA.map(x => chip('sizes', x, x)).join('')) +
    grp('Talle de gorra', GO.map(x => chip('sizes', x, x.slice(6))).join('')) +
    grp('Marca', brands.map(b => chip('brands', b, b)).join(''));
}
// ── ficha ──
function openProduct(code){
  const p = BY[code]; if (!p) return;
  const now = price(p, p.clp), may = price(p, p.clp, true), was = off(p) > .04 ? price(p, p.reg) : null;
  let pick = p.sizes.length === 1 ? p.sizes[0].t : null;
  const d = $('#product'), im = imgs(p);
  const draw = () => {
    const msg = `Hola! Tengo una consulta por: ${p.brand} ${p.name}${pick ? ' · talle ' + pick : ''} (código ${p.code})`;
    d.innerHTML = `<div class="pd"><div class="gal"><button class="x" type="button" aria-label="Cerrar">×</button>
      <div class="track">${im.map(u => `<img alt="${esc(p.name)}" src="${esc(u)}">`).join('')}</div>
      ${im.length > 1 ? `<div class="dots">${im.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>
      <div class="info pad"><span class="b">${esc(p.brand)} · ${CAT[p.cat]}</span><h2>${esc(p.name)}</h2>
      ${AUTO() && hasMay(p) ? `<div class="tier"><div><small>1 o 2 prendas</small><strong>${money(now)}</strong>${was ? `<s style="font-size:12px;color:var(--muted)">${money(was)}</s>` : ''}</div><div><small>Desde ${MIN()} prendas</small><strong>${money(may)}</strong><small style="text-transform:none;letter-spacing:0">c/u · ahorrás ${money(now - may)}</small></div></div>
        <p class="tier-note">Sumá ${MIN()} prendas cualquiera al carrito, pueden ser distintas, y pagás todas a precio mayorista. No aplica a zapatillas.</p>`
      : `<span class="p"><span class="now ${was ? 'sale' : ''}">${money(now)}</span>${was ? `<s>${money(was)}</s><span class="off">−${Math.round(off(p)*100)}%</span>` : ''}</span>`}
      ${!AUTO() && hasMay(p) ? `<a class="mini" target="_blank" rel="noopener" href="${WA('Hola! Soy revendedor y quiero el precio mayorista de ' + p.brand + ' ' + p.name + ' (código ' + p.code + ')')}">¿Comprás para revender? Consultá precio mayorista</a>` : ''}
      <span class="lbl"><span>Talle${pick ? ': ' + esc(pick) : ''}</span>${p.units != null && p.units <= 2 ? '<span style="color:var(--sale)">Últimas unidades</span>' : ''}</span>
      <div class="opts">${p.sizes.map(s => `<button type="button" class="opt" aria-pressed="${s.t === pick}" data-s="${esc(s.t)}">${esc(s.t)}</button>`).join('')}</div>
      <a class="mini" target="_blank" rel="noopener" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent('Hola! Tengo una duda con el talle de ' + p.brand + ' ' + p.name + ' (código ' + p.code + ')')}">¿Dudas con el talle? Preguntanos</a>
      <button class="btn k" id="add" type="button" ${pick ? '' : 'aria-disabled="true"'}>${pick ? 'Agregar al carrito' : 'Elegí tu talle'}</button>
      <div class="row2"><a class="btn line" target="_blank" rel="noopener" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}">Consultar</a><button class="btn line" id="share" type="button">Compartir</button></div>
      <div class="perks"><div>${ICON_OK}<span>Producto 100% original, nuevo y con etiqueta.</span></div><div>${ICON_CLOCK}<span>Te confirmamos disponibilidad por WhatsApp antes de señar.</span></div><div>${ICON_BOX}<span>Envíos a todo el país por Correo Argentino, Vía Cargo, Andreani o a domicilio.</span></div></div>
      <span class="code">Código ${p.code}</span></div></div>`;
    d.querySelector('.x').onclick = () => d.close();
    d.querySelectorAll('.info .opt').forEach(b => b.onclick = () => { pick = b.dataset.s; const sc = d.querySelector('.pd').scrollTop; draw(); d.querySelector('.pd').scrollTop = sc; });
    const add = d.querySelector('#add'); if (pick) add.onclick = () => { addToCart(p.code, pick); d.close(); };
    d.querySelector('#share').onclick = async () => {
      const url = location.origin + location.pathname + '#' + p.code;
      try { if (navigator.share) { await navigator.share({title: p.name, url}); return; } } catch(e){ return; }
      try { await navigator.clipboard.writeText(url); toast('Link copiado'); } catch(e){ prompt('Copiá el link', url); }
    };
    const tr = d.querySelector('.track'), dots = d.querySelectorAll('.dots i');
    tr.onscroll = () => { const i = Math.round(tr.scrollLeft / tr.clientWidth); dots.forEach((x, j) => x.classList.toggle('on', j === i)); };
  };
  draw(); d.showModal();
  try { history.replaceState(null, '', '#' + p.code); } catch(e){}
}
// ── carrito ──
function lines(){
  return cart.map(l => { const p = BY[l.code]; const ok = p && p.sizes.some(s => s.t === l.size); return {...l, p, ok}; });
}
function totals(){
  const L = lines().filter(l => l.ok);
  const count = L.reduce((n, l) => n + (l.p.cat === 'ZA' && !CFG.mayorista_cuenta_zapatillas ? 0 : l.qty), 0);
  const may = AUTO() && count >= MIN();
  let unit = 0, total = 0;
  for (const l of L){ unit += price(l.p, l.p.clp) * l.qty; total += price(l.p, l.p.clp, may) * l.qty; }
  return {L, count, may, unit, total, saving: unit - total, items: L.reduce((n, l) => n + l.qty, 0)};
}
function saveCart(){ store.set('cart', cart); const t = totals(), n = $('#cartn'); if (n.textContent !== String(t.items || '')){ n.textContent = t.items || ''; n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); } }
function addToCart(code, size){
  const l = cart.find(x => x.code === code && x.size === size);
  if (l) l.qty++; else cart.push({code, size, qty: 1});
  saveCart();
  const t = totals(), falta = MIN() - t.count;
  toast(!AUTO() ? 'Agregado al carrito' : t.may ? `Agregado · Precio mayorista activado` : falta > 0 && hasMay(BY[code]) ? `Agregado · Sumá ${falta} más para precio mayorista` : 'Agregado al carrito', true);
}
let view = 'cart';
function drawCart(){
  const t = totals(), all = lines(), c = $('#cart');
  const falta = Math.max(0, MIN() - t.count), pct = Math.min(100, t.count / MIN() * 100);
  // ahorro potencial si llega al mínimo
  const pot = t.L.reduce((s, l) => s + (price(l.p, l.p.clp) - price(l.p, l.p.clp, true)) * l.qty, 0);
  const head = `<div class="dh pad"><span>${view === 'form' ? 'Tus datos' : view === 'done' ? 'Pedido enviado' : `Tu carrito (${t.items})`}</span><button type="button" class="cx" aria-label="Cerrar" style="font-size:22px">×</button></div>`;
  if (view === 'done'){
    c.innerHTML = `<div class="in">${head}<div class="ordered pad"><h3>¡Pedido ${esc(lastOrder.id)} listo!</h3><p>Se abrió WhatsApp con tu pedido armado. Si no se abrió, tocá el botón de abajo.</p>
      <a class="btn g" target="_blank" rel="noopener" href="${lastOrder.url}">${WA_ICON}Enviar pedido por WhatsApp</a>
      <h4 style="margin:10px 0 0">Qué sigue</h4><ol><li>Te confirmamos stock, talles y fecha de entrega.</li><li>Reservás tu pedido con una seña.</li><li>Lo recibís y pagás el resto.</li></ol>
      <button class="btn line" type="button" id="keep">Seguir viendo</button></div></div>`;
    c.querySelector('#keep').onclick = () => c.close(); c.querySelector('.cx').onclick = () => c.close(); return;
  }
  if (view === 'form'){
    c.innerHTML = `<div class="in">${head}<div class="form pad">
      <label for="f-nombre">Tu nombre<input id="f-nombre" autocomplete="name" value="${esc(form.nombre)}"><span class="err" id="e-nombre"></span></label>
      <label for="f-lugar">¿De dónde sos? <em>(ciudad y provincia)</em><input id="f-lugar" autocomplete="address-level2" value="${esc(form.lugar)}" placeholder="Ej: Rosario, Santa Fe"></label>
      ${AUTO() ? '' : `<label style="flex-direction:row;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-size:14px;font-weight:500"><input type="checkbox" id="f-rev" ${form.rev ? 'checked' : ''} style="width:20px;height:20px">Compro para revender: quiero precio mayorista</label>`}
      <p class="tier-note">Te llega el pedido armado por WhatsApp. Ahí te confirmamos stock y talles, y coordinamos la seña y el envío.</p></div>
      <div class="sum pad"><div class="l t"><span>Total</span><span>${money(t.total)}</span></div>
      <button class="btn g" type="button" id="send">${WA_ICON}Enviar pedido por WhatsApp</button><button class="mini" type="button" id="back" style="align-self:center">Volver al carrito</button></div></div>`;
    c.querySelector('#back').onclick = () => { keepForm(); view = 'cart'; drawCart(); };
    c.querySelector('#send').onclick = send;
    c.querySelector('.cx').onclick = () => { keepForm(); c.close(); };
    return;
  }
  c.innerHTML = `<div class="in">${head}
    ${t.items && AUTO() ? `<div class="prog pad ${t.may ? 'reached' : ''}"><p>${t.may ? `✓ Precio mayorista activado: ahorrás ${money(t.saving)}` : t.count === 0 ? `Llevando ${MIN()} prendas pagás todo a precio mayorista` : `Sumá ${falta} prenda${falta > 1 ? 's' : ''} más y pagás todo a precio mayorista (ahorrás ${money(pot)})`}</p><div class="pbar"><i style="width:${t.may ? 100 : pct}%"></i></div></div>` : ''}
    <div class="items pad">${all.length ? all.map((l, i) => l.ok ? `<div class="it"><img alt="" src="${esc(l.p.img)}"><div class="t"><span class="b">${esc(l.p.brand)}</span><span class="n">${esc(l.p.name)}</span>
      <span class="b" style="text-transform:none;letter-spacing:0">Talle ${esc(l.size)}</span>
      <span class="p"><span>${money(price(l.p, l.p.clp, t.may) * l.qty)}</span>${t.may && hasMay(l.p) ? `<s>${money(price(l.p, l.p.clp) * l.qty)}</s>` : ''}</span>
      <div class="q"><button type="button" data-q="${i}" data-d="-1" aria-label="Uno menos">−</button><span>${l.qty}</span><button type="button" data-q="${i}" data-d="1" aria-label="Uno más">+</button></div>
      <button type="button" class="rm" data-rm="${i}">Quitar</button></div></div>`
      : `<div class="it gone"><img alt="" src="${esc(l.p ? l.p.img : '')}"><div class="t"><span class="n">${esc(l.p ? l.p.name : 'Producto')}</span><span class="b" style="color:var(--sale)">Se agotó${l.p ? ' en talle ' + esc(l.size) : ''}</span><button type="button" class="rm" data-rm="${i}">Quitar</button></div></div>`).join('')
      : '<p class="empty">Tu carrito está vacío.</p>'}</div>
    ${t.items ? `<div class="sum pad"><div class="l"><span>Subtotal (${t.items} producto${t.items > 1 ? 's' : ''})</span><span>${money(t.unit)}</span></div>
      ${t.saving > 0 ? `<div class="l s"><span>Descuento mayorista</span><span>−${money(t.saving)}</span></div>` : ''}
      <div class="l t"><span>Total</span><span>${money(t.total)}</span></div>
      <button class="btn k" type="button" id="go">Hacer pedido</button><span class="tier-note" style="text-align:center">Sin pago online: lo confirmamos todo por WhatsApp.</span></div>` : ''}</div>`;
  c.querySelector('.cx').onclick = () => c.close();
  c.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const l = cart[+b.dataset.q]; l.qty = Math.max(1, Math.min(9, l.qty + +b.dataset.d)); saveCart(); drawCart(); });
  c.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { cart.splice(+b.dataset.rm, 1); saveCart(); drawCart(); });
  const go = c.querySelector('#go'); if (go) go.onclick = () => { view = 'form'; drawCart(); };
}
function keepForm(){ ['nombre','lugar'].forEach(k => { const e = $('#f-' + k); if (e) form[k] = e.value.trim(); }); const r = $('#f-rev'); if (r) form.rev = r.checked; store.set('form', form); }
let lastOrder = null;
function send(){
  keepForm();
  let ok = true;
  [['nombre','Escribí tu nombre para saber a quién va el pedido.']].forEach(([k, m]) => {
    const bad = !form[k]; ok = ok && !bad; $('#f-' + k).setAttribute('aria-invalid', bad); $('#e-' + k).textContent = bad ? m : '';
  });
  if (!ok) return;
  const t = totals(), d = new Date();
  const id = 'P' + String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0') + '-' + Math.floor(100 + Math.random() * 900);
  const L = t.L.map((l, i) => `${i+1}) ${l.p.brand} · ${l.p.name}\n   Talle ${l.size} · x${l.qty} · ${money(price(l.p, l.p.clp, t.may) * l.qty)} · ${l.p.code}`);
  const msg = `*Pedido ${id}* 🛍️\nHola Luca! Soy ${form.nombre}${form.lugar ? ' (' + form.lugar + ')' : ''}. Quiero este pedido:\n\n${L.join('\n')}\n\n` +
    `Productos: ${t.items}${t.may ? ' · Precio mayorista ✅' : ''}\n` + (t.saving > 0 ? `Ahorro: ${money(t.saving)}\n` : '') + `*Total: ${money(t.total)}*\n\n` +
    (form.rev && !AUTO() ? `Soy revendedor: ¿me pasás el precio mayorista? ` : '') + `¿Me confirmás stock y talles?`;
  const url = `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}`;
  lastOrder = {id, url}; store.set('pedidos', [{id, fecha: d.toISOString(), total: t.total, items: cart}, ...store.get('pedidos', [])].slice(0, 20));
  window.open(url, '_blank', 'noopener');
  cart = []; saveCart(); view = 'done'; drawCart();
}
function openCart(){ view = 'cart'; drawCart(); $('#cart').showModal(); }
let tt;
function toast(msg, withCart){
  const e = $('#toast'); e.innerHTML = `<span>${esc(msg)}</span>${withCart ? '<button type="button" id="tcart">Ver carrito</button>' : ''}`;
  e.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 3500);
  const b = e.querySelector('#tcart'); if (b) b.onclick = () => { e.classList.remove('on'); openCart(); };
}
const WA_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>';
const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6 9 17l-5-5"/></svg>';
const ICON_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_BOX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>';

async function start(){
  try {
    CFG = await getJSON([RAW + 'config.json', BASE + '/config.json']);
    DATA = await getJSON([RAW + 'data/catalogo.json', BASE + '/data/catalogo.json']);
  } catch(e){ $('#grid').innerHTML = '<p class="empty">No pudimos cargar el catálogo. Recargá la página en un momento.</p>'; return; }
  RATE = Number(CFG.cambio) || 1.67;
  const est = DATA.estado || {}, lim = 6 * 3600 * 1000;
  DATA.productos = DATA.productos.filter(p => { const e = est[p.store]; return !e || !e.ultimo_ok || (Date.now() - new Date(e.ultimo_ok)) < lim; });
  DATA.productos.forEach(p => {
    p.name = arName(p.name);
    p.brand = BRAND_FIX[(p.brand || '').trim().toLowerCase()] || (p.brand || '').trim();
    p.sizes = p.sizes.map(s => ({...s, t: cleanSize(s.t, p.cat)}));
    const seenS = new Set(); p.sizes = p.sizes.filter(s => !seenS.has(s.t) && seenS.add(s.t));
    p.sizes.forEach(s => s.tg = tags(s.t, p.cat));
    BY[p.code] = p;
  });
  document.querySelectorAll('.wa-link').forEach(a => a.href = `https://wa.me/${CFG.whatsapp}`);
  document.querySelectorAll('.min-n').forEach(e => e.textContent = MIN());

  cart = store.get('cart', []); form = Object.assign(form, store.get('form', {})); saveCart();
  rails(); render();
  const h = decodeURIComponent(location.hash.slice(1)); if (h && BY[h]) openProduct(h);
}
const jump = () => document.getElementById('catalogo').scrollIntoView({behavior: 'smooth'});
document.addEventListener('click', e => {
  const c = e.target.closest('.card'); if (c) return openProduct(c.dataset.c);
  const bo = e.target.closest('[data-open]'); if (bo) return openProduct(bo.dataset.open);
  const s = e.target.closest('[data-sec]');
  if (s){ if (s.dataset.sec === 'sale') f.sale = !f.sale; else { f.sec = s.dataset.sec; f.sale = false; } f.cat = 'all'; f.sizes.clear(); f.brands.clear(); shown = 40; render(); if (s.dataset.jump || s.closest('.nav')) jump(); return; }
  const k = e.target.closest('[data-cat]'); if (k){ f.cat = k.dataset.cat; f.sizes.clear(); shown = 40; render(); if (k.dataset.jump) jump(); return; }
  const r = e.target.closest('[data-rail]'); if (r){ f.sort = r.dataset.rail; if (r.dataset.rail === 'off') f.sale = true; render(); jump(); return; }
  const o = e.target.closest('#fbody .opt');
  if (o){ if (o.dataset.m){ const s = f[o.dataset.m]; s.has(o.dataset.v) ? s.delete(o.dataset.v) : s.add(o.dataset.v); } else f[o.dataset.k] = o.dataset.v; filtersUI(); return; }
});
$('#fbtn').onclick = () => { filtersUI(); $('#filters').showModal(); };
$('#fclose').onclick = () => $('#filters').close();
$('#fapply').onclick = () => $('#filters').close();
$('#fclear').onclick = () => { f.brands.clear(); f.sizes.clear(); f.sort = 'top'; filtersUI(); };
$('#filters').addEventListener('close', () => { shown = 40; render(); });
$('#product').addEventListener('close', () => { try { history.replaceState(null, '', location.pathname); } catch(e){} });
['#filters','#product','#cart'].forEach(id => $(id).addEventListener('click', e => { if (e.target === $(id)) $(id).close(); }));
$('#cbtn').onclick = openCart;
$('#sbtn').onclick = () => { const r = $('#srow'); r.hidden = !r.hidden; if (!r.hidden) $('#q').focus(); };
$('#q').oninput = e => { f.q = e.target.value; shown = 40; render(); };
$('#more').onclick = () => { shown += 40; render(); };
start();
})();
