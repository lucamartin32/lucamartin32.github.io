(() => {
const BASE = document.body.dataset.base || '.';
const RAW = 'https://raw.githubusercontent.com/lucamartin32/lucamartin32.github.io/main/';
const CAT = {RE:'Remeras',BZ:'Buzos',PA:'Pantalones',JE:'Jeans',SH:'Shorts',CA:'Camperas',GO:'Gorras',ZA:'Zapatillas',MO:'Mochilas',NE:'Bolsos y neceseres',BI:'Billeteras',CR:'Carteras',RI:'Ropa interior',PJ:'Pijamas'};
const CAT_ORDER = ['ZA','BZ','RE','PA','JE','CA','SH','GO','RI','PJ','NE','MO','CR','BI'];
const TOPB = ['Nike','Jordan','Tommy Hilfiger','Calvin Klein','adidas','New Balance'];
const $ = s => document.querySelector(s);
const f = {sec:'all', cat:'all', brands:new Set(), sizes:new Set(), sale:false, q:'', sort:'top'};
let favs = new Set(), CFG, DATA, BY = {}, RATE, shown = 40, cart = [], form = {nombre:'', lugar:''};

const money = v => '$' + Math.round(v).toLocaleString('es-AR');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const off = p => p.reg > p.clp + 1 ? (p.reg - p.clp) / p.reg : 0;
const imgs = p => (p.imgs && p.imgs.length ? p.imgs : [p.img]).filter(Boolean);
const U = t => !t || /^https?:/.test(t) ? t : String(CFG.img_host || '').replace(/\/$/, '') + '/' + t;   // foto: token corto -> link del servidor de fotos
const GS = {};
async function loadGal(p){
  const k = p.code.slice(-1).toLowerCase();
  GS[k] = GS[k] || fetch(BASE + '/data/gal/' + k + '.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
  const g = await GS[k]; p.imgs = [p.img, ...(g[p.code] || []).map(U)];
}
const store = { get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };

async function getJSON(urls){
  for (const u of urls){ try { const r = await fetch(u + '?t=' + Date.now(), {cache:'no-store'}); if (r.ok) return await r.json(); } catch(e){} }
  throw new Error('sin datos');
}
// ── normalización ──
const AR_RULES = [[new RegExp("(?<!\\p{L})Parka Vest(?!\\p{L})",'giu'),"Chaleco"],[new RegExp("(?<!\\p{L})Con Gorro(?!\\p{L})",'giu'),"Con Capucha"],[new RegExp("(?<!\\p{L})con gorro(?!\\p{L})",'giu'),"con capucha"],[new RegExp("(?<!\\p{L})B\u00e1sico Buzo(?!\\p{L})",'giu'),"B\u00e1sico Jogging"],[new RegExp("(?<!\\p{L})Pantal[o\u00f3]n de Buzo(?!\\p{L})",'giu'),"Jogging"],[new RegExp("(?<!\\p{L})Poleras(?!\\p{L})",'giu'),"Remeras"],[new RegExp("(?<!\\p{L})Polera(?!\\p{L})",'giu'),"Remera"],[new RegExp("(?<!\\p{L})Remera Polo(?!\\p{L})",'giu'),"Chomba"],[new RegExp("(?<!\\p{L})Poler[o\u00f3]nes(?!\\p{L})",'giu'),"Buzos"],[new RegExp("(?<!\\p{L})Poler[o\u00f3]n(?!\\p{L})",'giu'),"Buzo"],[new RegExp("(?<!\\p{L})Pole[o\u00f3]n(?!\\p{L})",'giu'),"Buzo"],[new RegExp("(?<!\\p{L})Jockeys?(?!\\p{L})",'giu'),"Gorra"],[new RegExp("(?<!\\p{L})Chaquetas(?!\\p{L})",'giu'),"Camperas"],[new RegExp("(?<!\\p{L})Chaqueta",'giu'),"Campera "],[new RegExp("(?<!\\p{L})Parkas?(?!\\p{L})",'giu'),"Campera"],[new RegExp("(?<!\\p{L})Cortavientos(?!\\p{L})",'giu'),"Rompevientos"],[new RegExp("(?<!\\p{L})Bototos?(?!\\p{L})",'giu'),"Borcegos"],[new RegExp("(?<!\\p{L})Peto(?!\\p{L})",'giu'),"Top"],[new RegExp("(?<!\\p{L})Pantalon(?!\\p{L})",'giu'),"Pantal\u00f3n"],[new RegExp("(?<!\\p{L})Caf[e\u00e9](?!\\p{L})",'giu'),"Marr\u00f3n"],[new RegExp("(?<!\\p{L})Burdeo(?!\\p{L})",'giu'),"Bord\u00f3"],[new RegExp("(?<!\\p{L})Naranjo(?!\\p{L})",'giu'),"Naranja"],[new RegExp("(?<!\\p{L})Rosado(?!\\p{L})",'giu'),"Rosa"],[new RegExp("(?<!\\p{L})Plomo(?!\\p{L})",'giu'),"Gris"],[new RegExp("(?<!\\p{L})Zapatillas? Vulcanizadas(?!\\p{L})",'giu'),"Zapatillas"],[new RegExp("(?<!\\p{L})Bananos?(?!\\p{L})",'giu'),"Riñonera"],[new RegExp("(?<!\\p{L})Calcet(?:as|ines|a|ín|in)(?!\\p{L})",'giu'),"Medias"]];
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
  if (p.fixed) return p.fixed;
  const step = CFG.redondeo || 500;
  const base = Math.ceil(clp * RATE / step) * step;
  const K = p.pack && CFG.recargos.unidad[p.cat + 'P'] != null ? p.cat + 'P' : p.cat;   // packs de ropa interior llevan otro recargo
  if (may && hasMay(p)) return base + (CFG.recargos.mayorista[K] ?? CFG.recargos.mayorista[p.cat]);          // mayorista: base + recargo, sin redondear
  const r = CFG.redondeo_unidad || 1, v = base + CFG.recargos.unidad[K], rem = v % r;
  const RA = CFG.redondeo_abajo_hasta || {}, tol = RA[p.cat] ?? RA['*'] ?? 0;                 // si se pasa poquito (ej. gorras hasta $1.500) redondea para abajo
  if (rem && rem <= tol) return v - rem;
  return Math.ceil(v / r) * r;                                               // si no, redondea hacia arriba a $5.000
}
const MIN = () => CFG.mayorista_desde || 5;
const arSave = p => p.ar ? p.ar - price(p, p.clp) : 0;
const arShow = p => arSave(p) >= (CFG.ar_min_dif || 40000);
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
  const flag = p.star ? '<span class="flag star">Producto estrella</span>' : isNew(p) ? '<span class="flag new">Nuevo</span>' : isDrop(p) ? '<span class="flag drop">Bajó de precio</span>' : was ? `<span class="flag sale">−${pct}%</span>` : '';
  return `<button class="card" type="button" data-c="${p.code}"><div class="ph"><img loading="lazy" decoding="async" alt="${esc(p.name)}" src="${esc(p.img)}">
    ${flag}${p.units != null && p.units <= 2 ? '<span class="flag last">Últimas</span>' : ''}${favs.has(p.code) ? '<span class="fv" aria-label="Guardado">'+HEART(true)+'</span>' : ''}</div>
    <div class="meta"><span class="b">${esc(p.brand)}</span><span class="n">${esc(p.name)}</span>${sibs(p).length > 1 ? `<span class="cols">${sibs(p).length} colores</span>` : ''}
    <span class="p"><span class="now ${was ? 'sale' : ''}">${money(now)}</span>${was ? `<s>${money(was)}</s>` : ''}</span>
    ${arShow(p) ? `<span class="arc">En Argentina ${money(p.ar)}</span>` : ''}
    ${AUTO() && hasMay(p) ? `<span class="p2">${money(price(p, p.clp, true))} llevando ${MIN()}+ prendas</span>` : ''}</div></button>`;
}
// ── catálogo ──
function pool(ignoreSize){
  const q = f.q.trim().toLowerCase();
  return DATA.productos.filter(p => (isHead(p) || (q && p.code.toLowerCase() === q)) && (!f.arOnly || arShow(p)) && (f.sec === 'all' || p.secs.includes(f.sec)) && (f.cat === 'all' || p.cat === f.cat) &&
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
  const rank = p => p.star ? -99 : (p.brand === "Victoria's Secret" && f.sec === 'M' && ['RI','PJ','BE'].includes(p.cat)) ? -10 - off(p) : (i => (i < 0 ? 9 : i) - off(p) * 4 - (isNew(p) ? 2 : 0))(TOPB.indexOf(p.brand));
  let list = pool();
  if (f.sort === 'top') list.sort((a, c) => rank(a) - rank(c) || pc(a) - pc(c));
  if (f.sort === 'new') list.sort((a, c) => (c.first||'').localeCompare(a.first||'') || rank(a) - rank(c));
  if (f.sort === 'price') list.sort((a, c) => pc(a) - pc(c));
  if (f.sort === 'price-desc') list.sort((a, c) => pc(c) - pc(a));
  if (f.sort === 'off') list.sort((a, c) => off(c) - off(a));
  if (f.sort === 'ar') list.sort((a, c) => (arShow(c) ? arSave(c) : 0) - (arShow(a) ? arSave(a) : 0));
  const nf = f.brands.size + f.sizes.size + (f.sort !== 'top');
  $('#fbtn-n').textContent = nf ? `(${nf})` : '';
  $('#count').textContent = ''; $('#count2').textContent = `${list.length.toLocaleString('es-AR')} productos`;
  const home = f.sec === 'all' && f.cat === 'all' && !f.sale && !f.arOnly && !f.q && !f.brands.size && !f.sizes.size;
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
  const st = DATA.productos.filter(p => p.star && isHead(p)); $('#star').closest('section').hidden = !st.length; $('#star').innerHTML = st.map(card).join('');
  const arr = DATA.productos.filter(p => isHead(p) && arShow(p)).sort((a, b) => arSave(b) - arSave(a));
  sec('#r-ar', arr);
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
    grp('Ordenar', [['top','Destacados'],['new','Recién llegados'],['price','Menor precio'],['price-desc','Mayor precio'],['off','Mayor descuento'],['ar','Más ahorro vs. Argentina']].map(([v,l]) => opt('sort', v, l)).join('')) +
    grp('Talle de ropa', LET.map(x => chip('sizes', x, x)).join('')) +
    grp('Talle de pantalón / jean (cintura)', W.map(x => chip('sizes', x, x.slice(1))).join('')) +
    grp('Talle de zapatillas', ZA.map(x => chip('sizes', x, x)).join('')) +
    grp('Talle de gorra', GO.map(x => chip('sizes', x, x.slice(6))).join('')) +
    grp('Marca', brands.map(b => chip('brands', b, b)).join(''));
}

// ── favoritos ──
const HEART = on => `<svg class="hrt" viewBox="0 0 24 24" width="18" height="18" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.3-9.3C1.4 7.2 3.6 4 7 4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.2 4.3 6.7C19.5 15.4 12 20 12 20z"/></svg>`;
const ICON_STORY = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M9 16.5h6"/></svg>';
function saveFavs(){ store.set('favs', [...favs]); const n = $('#favn'); n.textContent = favs.size || ''; }
function toggleFav(code){ if (favs.has(code)) favs.delete(code); else { favs.add(code); toast('Guardado en favoritos'); } saveFavs(); render(); rails(); }
function openFavs(){
  const d = $('#favs'), list = [...favs].map(c => BY[c]).filter(Boolean);
  const msg = 'Hola! Me interesan estas prendas:\n' + list.map(p => `• ${p.brand} ${p.name} (${p.code}) ${money(price(p, p.clp))}`).join('\n');
  d.innerHTML = `<div class="in"><div class="dh pad"><span>Favoritos</span><button type="button" class="fx" aria-label="Cerrar" style="font-size:24px">×</button></div>
    <div class="items pad">${list.length ? list.map(p => `<div class="it"><img alt="" src="${esc(p.img)}"><div class="t"><span class="b">${esc(p.brand)}</span><span class="n">${esc(p.name)}</span><span class="p">${money(price(p, p.clp))}</span>
      <div class="minis"><button type="button" class="mini" data-fo="${p.code}">Ver prenda</button><button type="button" class="mini" data-fr="${p.code}">Quitar</button></div></div></div>`).join('')
      : '<p class="empty">Todavía no guardaste nada. Tocá "Guardar" en una prenda y aparece acá.</p>'}</div>
    ${list.length ? `<div class="sum pad"><a class="btn g" target="_blank" rel="noopener" href="${WA(msg)}">${WA_ICON}Consultar todas por WhatsApp</a></div>` : ''}</div>`;
  d.querySelector('.fx').onclick = () => d.close();
  d.querySelectorAll('[data-fo]').forEach(b => b.onclick = () => { d.close(); openProduct(b.dataset.fo); });
  d.querySelectorAll('[data-fr]').forEach(b => b.onclick = () => { toggleFav(b.dataset.fr); openFavs(); });
  if (!d.open) d.showModal();
}

// ── guía de talles ──
const GUIDE = {
  ropa: {t: 'Remeras, buzos y camperas', note: 'Medí el contorno de pecho por la parte más ancha, con la cinta horizontal. Si quedás entre dos talles, elegí el más grande.',
    head: ['Talle', 'Pecho (cm)', 'Equivale en AR'], rows: [['XS','82 – 88','XS'],['S','88 – 96','S'],['M','96 – 104','M'],['L','104 – 112','L'],['XL','112 – 124','XL'],['XXL','124 – 136','XXL']]},
  pant: {t: 'Pantalones y jeans', note: 'El número W es la cintura en pulgadas. Medí tu cintura en cm donde usás el pantalón y buscá la fila más cercana.',
    head: ['Talle', 'Cintura (cm)', 'Talle AR aprox.'], rows: [['W28 / S','71','38'],['W30 / S','76','40'],['W32 / M','81','42'],['W34 / L','86','44'],['W36 / XL','91','46'],['W38 / XXL','97','48']]},
  zh: {t: 'Zapatillas de hombre', note: 'Es la tabla de Nike y Jordan; adidas y Puma son casi iguales. Lo más seguro es medir el pie en centímetros: ver cómo abajo.',
    head: ['Pie (cm)', 'US', 'UK', 'EU'], rows: [['25','7','6','40'],['25.5','7.5','6.5','40.5'],['26','8','7','41'],['26.5','8.5','7.5','42'],['27','9','8','42.5'],['27.5','9.5','8.5','43'],['28','10','9','44'],['28.5','10.5','9.5','44.5'],['29','11','10','45'],['29.5','11.5','10.5','45.5'],['30','12','11','46']]},
  zm: {t: 'Zapatillas de mujer', note: 'Es la tabla de Nike y Jordan para mujer. Ojo: el US de mujer es distinto al de hombre (US 8 mujer = US 6.5 hombre).',
    head: ['Pie (cm)', 'US', 'UK', 'EU'], rows: [['22','5','2.5','35.5'],['22.5','5.5','3','36'],['23','6','3.5','36.5'],['23.5','6.5','4','37.5'],['24','7','4.5','38'],['24.5','7.5','5','38.5'],['25','8','5.5','39'],['25.5','8.5','6','40'],['26','9','6.5','40.5'],['26.5','9.5','7','41'],['27','10','7.5','42']]},
};
function openGuide(cat){
  const d = $('#guide');
  let tab = cat === 'ZA' ? 'zh' : (cat === 'PA' || cat === 'JE' || cat === 'SH') ? 'pant' : 'ropa';
  const draw = () => {
    const g = GUIDE[tab];
    d.innerHTML = `<div class="in"><div class="dh pad"><span>Guía de talles</span><button type="button" class="fx" aria-label="Cerrar" style="font-size:24px">×</button></div>
      <div class="db pad"><div class="opts gtabs">${[['ropa','Ropa'],['pant','Pantalones'],['zh','Zapatillas hombre'],['zm','Zapatillas mujer']].map(([k,l]) => `<button type="button" class="opt" data-g="${k}" aria-pressed="${k===tab}">${l}</button>`).join('')}</div>
      <h3 class="gt">${g.t}</h3><p class="gn">${g.note}</p>
      <table class="gtab"><thead><tr>${g.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${g.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      ${tab[0] === 'z' ? `<div class="how-m"><h4>Cómo medir tu pie</h4><ol><li>Apoyá el pie descalzo sobre una hoja, con el talón contra la pared.</li><li>Marcá la punta del dedo más largo.</li><li>Medí desde la pared hasta la marca en centímetros.</li><li>Buscá ese número en la tabla. Si estás entre dos, elegí el más grande.</li></ol></div>` : ''}
      <p class="gn">Cada marca y modelo puede variar un poco. Si tenés dudas, <a target="_blank" rel="noopener" href="${WA('Hola! Necesito ayuda para elegir mi talle')}">escribinos por WhatsApp</a> y te ayudamos antes de reservar.</p></div></div>`;
    d.querySelector('.fx').onclick = () => d.close();
    d.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { tab = b.dataset.g; draw(); });
  };
  draw(); if (!d.open) d.showModal();
}

// ── fotos para revendedores (historia y catálogo) ──
function loadImg(src){ return new Promise((ok, ko) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = ko; i.src = src; }); }
const LOGO_KEY = 'rev-logo';
let LOGO = null;
async function getLogo(){ if (LOGO) return LOGO; const d = store.get(LOGO_KEY, null); if (!d) return null; try { LOGO = await loadImg(d); } catch(e){ LOGO = null; } return LOGO; }
function readLogo(file){ return new Promise((ok, ko) => { const r = new FileReader(); r.onload = async () => {
  const i = await loadImg(r.result); const c = document.createElement('canvas'), s = Math.min(1, 600 / Math.max(i.width, i.height));
  c.width = Math.round(i.width * s); c.height = Math.round(i.height * s); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
  const d = c.toDataURL('image/png'); store.set(LOGO_KEY, d); LOGO = await loadImg(d); ok(LOGO); }; r.onerror = ko; r.readAsDataURL(file); }); }
const fmtPrice = v => { const n = String(v ?? '').replace(/[^\d]/g, ''); return n ? '$' + Number(n).toLocaleString('es-AR') : ''; };
const FONT = (w, s) => `${w} ${s}px Archivo, "Helvetica Neue", Helvetica, Arial, sans-serif`;
function wrap(x, text, max, lines){ const out = []; let ln = ''; for (const w of text.split(' ')){ const t = ln ? ln + ' ' + w : w; if (x.measureText(t).width > max && ln){ out.push(ln); ln = w; } else ln = t; } out.push(ln);
  if (out.length > lines){ out.length = lines; out[lines - 1] = out[lines - 1].replace(/\s*\S*$/, '') + '…'; } return out; }
/* Foto limpia: fondo blanco, la prenda grande y abajo el precio y los talles. Sin marco tipo página. */
async function drawPhoto(p, o, W, H){
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  const u = W / 1080, M = 64 * u;
  const foot = (o.price ? 150 : 0) + (o.sizes ? 110 : 0) + (o.name ? 120 : 0) + (o.code ? 60 : 0);
  const imgH = H - foot * u - M;
  if (o.img){ const im = o.img, ph = p.store === 'z' || p.store === 'e';
    const s = ph ? Math.max(W / im.width, imgH / im.height) : Math.min((W - 2 * M) / im.width, (imgH - M) / im.height);
    const w = im.width * s, h = im.height * s; x.save(); x.beginPath(); x.rect(0, 0, W, imgH); x.clip();
    x.drawImage(im, (W - w) / 2, ph ? 0 : (imgH - h) / 2 + M / 2, w, h); x.restore(); }
  let y = imgH + 40 * u;
  if (o.name){ x.fillStyle = '#5f6670'; x.font = FONT(600, 40 * u); x.textBaseline = 'top';
    wrap(x, o.name, W - 2 * M, 2).forEach((l, i) => x.fillText(l, M, y + i * 50 * u)); y += 120 * u; }
  x.textBaseline = 'alphabetic';
  if (o.price){ x.fillStyle = '#000'; x.font = FONT(900, 120 * u); x.fillText(o.price, M - 4 * u, y + 105 * u); y += 150 * u; }
  if (o.sizes && o.sizes.length){ let sx = M; x.font = FONT(700, 38 * u);
    for (const t of o.sizes){ const tw = x.measureText(t).width + 44 * u; if (sx + tw > W - M) break;
      x.strokeStyle = '#000'; x.lineWidth = 3 * u; x.beginPath(); x.roundRect(sx, y, tw, 70 * u, 35 * u); x.stroke();
      x.fillStyle = '#000'; x.fillText(t, sx + 22 * u, y + 48 * u); sx += tw + 14 * u; } y += 110 * u; }
  if (o.code){ x.fillStyle = '#5f6670'; x.font = FONT(600, 34 * u); x.fillText('Código ' + p.code, M, y + 34 * u); }
  if (o.logo){ const L = o.logo, lw = (o.logoSize || 220) * u, lh = lw * L.height / L.width, pad = 48 * u;
    const pos = o.logoPos || 'tr', lx = pos[1] === 'l' ? pad : W - pad - lw, ly = pos[0] === 't' ? pad : imgH - pad - lh;
    x.globalAlpha = o.logoAlpha ?? 1; x.drawImage(L, lx, ly, lw, lh); x.globalAlpha = 1; }
  return c;
}
const toBlob = (c, q) => new Promise(r => c.toBlob(r, 'image/jpeg', q || .9));
function logoControls(id){ return `<div class="grp"><h4>Tu logo <em class="opt-l">(opcional)</em></h4>
  <div class="logo-row"><label class="btn line logo-up">Subir logo<input type="file" accept="image/*" id="${id}-file" hidden></label><button type="button" class="mini" id="${id}-rm">Quitar</button></div>
  <div class="opts" id="${id}-pos">${[['tl','Arriba izq.'],['tr','Arriba der.'],['bl','Abajo izq.'],['br','Abajo der.']].map(([v,l]) => `<button type="button" class="opt" data-pos="${v}">${l}</button>`).join('')}</div>
  <label class="rng">Tamaño<input type="range" id="${id}-size" min="120" max="420" step="10"></label>
  <label class="rng">Transparencia<input type="range" id="${id}-alpha" min="30" max="100" step="5"></label></div>`; }
function bindLogo(d, id, cfg, onChange){
  const sync = async () => { const has = !!(await getLogo()); d.querySelector(`#${id}-rm`).hidden = !has;
    d.querySelectorAll(`#${id}-pos [data-pos]`).forEach(b => b.setAttribute('aria-pressed', b.dataset.pos === cfg.logoPos));
    d.querySelectorAll(`#${id}-pos, label.rng`).forEach(e => e.hidden = !has); };
  d.querySelector(`#${id}-size`).value = cfg.logoSize; d.querySelector(`#${id}-alpha`).value = Math.round(cfg.logoAlpha * 100);
  d.querySelector(`#${id}-file`).onchange = async e => { const f = e.target.files[0]; if (!f) return; await readLogo(f); await sync(); onChange(); };
  d.querySelector(`#${id}-rm`).onclick = async () => { store.set(LOGO_KEY, null); LOGO = null; await sync(); onChange(); };
  d.querySelectorAll(`#${id}-pos [data-pos]`).forEach(b => b.onclick = () => { cfg.logoPos = b.dataset.pos; save(); sync(); onChange(); });
  d.querySelector(`#${id}-size`).oninput = e => { cfg.logoSize = +e.target.value; save(); onChange(); };
  d.querySelector(`#${id}-alpha`).oninput = e => { cfg.logoAlpha = e.target.value / 100; save(); onChange(); };
  function save(){ store.set('rev-cfg', {logoPos: cfg.logoPos, logoSize: cfg.logoSize, logoAlpha: cfg.logoAlpha}); }
  sync();
}
const revCfg = () => Object.assign({logoPos: 'tr', logoSize: 240, logoAlpha: 1}, store.get('rev-cfg', {}));
function shareOrDownload(files){
  return (async () => {
    try { if (navigator.canShare && navigator.canShare({files})) { await navigator.share({files}); return; } } catch(e){ if (e && e.name === 'AbortError') return; }
    for (const f of files){ const u = URL.createObjectURL(f), a = document.createElement('a'); a.href = u; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
  })();
}

function openStory(p, pick){
  const d = $('#story'), cfg = revCfg(); let img = null, url = null, busy = 0;
  const def = money(price(p, p.clp)), sz = p.sizes.map(s => s.t);
  d.innerHTML = `<div class="in"><div class="dh pad"><span>Foto para historia</span><button type="button" class="fx" aria-label="Cerrar" style="font-size:24px">×</button></div>
    <div class="db pad"><div class="st-prev"><img id="st-img" alt="Vista previa de la foto"></div>
    <div class="form" style="padding:16px 0 0;overflow:visible"><label>Precio que va en la foto <em>(vacío = sin precio)</em><input id="st-price" inputmode="numeric" value="${esc(def)}"></label>
    <label class="chk"><input type="checkbox" id="st-sz" checked> Mostrar talles disponibles</label>
    <label class="chk"><input type="checkbox" id="st-nm"> Mostrar nombre de la prenda</label>
    <label class="chk"><input type="checkbox" id="st-cd"> Mostrar código</label></div>
    ${logoControls('st')}</div>
    <div class="df pad"><button type="button" id="st-dl">Descargar</button><button type="button" class="go" id="st-sh">Compartir</button></div></div>`;
  const prev = d.querySelector('#st-img'), q = s => d.querySelector(s);
  const redraw = async () => { const n = ++busy;
    const c = await drawPhoto(p, {img, price: fmtPrice(q('#st-price').value), sizes: q('#st-sz').checked ? sz : null, name: q('#st-nm').checked ? `${p.brand} ${p.name}` : '',
      code: q('#st-cd').checked, logo: await getLogo(), ...cfg}, 1080, 1920);
    if (n !== busy) return; const blob = await toBlob(c, .92); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob); prev.src = url; d._blob = blob; };
  q('.fx').onclick = () => d.close();
  ['#st-price','#st-sz','#st-nm','#st-cd'].forEach(s => q(s).addEventListener('input', redraw));
  bindLogo(d, 'st', cfg, redraw);
  const file = () => new File([d._blob], `${p.code}.jpg`, {type: 'image/jpeg'});
  q('#st-dl').onclick = () => { const a = document.createElement('a'); a.href = url; a.download = `${p.code}.jpg`; document.body.appendChild(a); a.click(); a.remove(); };
  q('#st-sh').onclick = () => shareOrDownload([file()]);
  if (!d.open) d.showModal();
  loadImg(p.simg || p.img).then(i => { img = i; }).catch(() => {}).finally(redraw);
}

// ── catálogo para revendedores ──
const LIBS = {pdf: BASE + '/assets/vendor/jspdf.umd.min.js', zip: BASE + '/assets/vendor/jszip.min.js'};
const libP = {};
const lib = k => libP[k] ||= new Promise((ok, ko) => { const s = document.createElement('script'); s.src = LIBS[k]; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
function openCatalog(){
  const d = $('#catdl'), cfg = Object.assign(revCfg(), store.get('cat-cfg', {sec: 'all', cat: 'all', brand: 'all', mode: 'mine', margin: 30, fmt: 'pdf'}));
  const save = () => store.set('cat-cfg', {sec: cfg.sec, cat: cfg.cat, brand: cfg.brand, mode: cfg.mode, margin: cfg.margin, fmt: cfg.fmt});
  const MAX = 60;
  const list = () => DATA.productos.filter(p => isHead(p) && (cfg.sec === 'all' || p.secs.includes(cfg.sec)) && (cfg.cat === 'all' || p.cat === cfg.cat) && (cfg.brand === 'all' || p.brand === cfg.brand))
    .sort((a, b) => (b.star ? 1 : 0) - (a.star ? 1 : 0) || (TOPB.indexOf(a.brand) + 99) % 99 - (TOPB.indexOf(b.brand) + 99) % 99 || off(b) - off(a));
  const pr = p => { const base = price(p, p.clp); return cfg.mode === 'none' ? '' : money(cfg.mode === 'margin' ? Math.ceil(base * (1 + cfg.margin / 100) / 1000) * 1000 : base); };
  const draw = () => {
    const L = list(), brands = [...new Set(DATA.productos.filter(p => (cfg.sec === 'all' || p.secs.includes(cfg.sec)) && (cfg.cat === 'all' || p.cat === cfg.cat)).map(p => p.brand))].sort();
    const opt = (k, v, l) => `<button type="button" class="opt" data-k="${k}" data-v="${esc(v)}" aria-pressed="${cfg[k] === v}">${esc(l)}</button>`;
    d.innerHTML = `<div class="in"><div class="dh pad"><span>Catálogo para revendedores</span><button type="button" class="fx" aria-label="Cerrar" style="font-size:24px">×</button></div>
      <div class="db pad"><p class="gn">Descargá las fotos con talles, código y el precio que quieras, para mandarle a tus clientes. Si te piden una prenda, buscá el código en la lupa de esta página y vas a ver si sigue disponible.</p>
      <div class="grp"><h4>Para</h4><div class="opts">${opt('sec','all','Todos')}${opt('sec','H','Hombre')}${opt('sec','M','Mujer')}</div></div>
      <div class="grp"><h4>Categoría</h4><div class="opts">${opt('cat','all','Todas')}${CAT_ORDER.map(c => opt('cat', c, CAT[c])).join('')}</div></div>
      <div class="grp"><h4>Marca</h4><div class="opts">${opt('brand','all','Todas')}${brands.map(b => opt('brand', b, b)).join('')}</div></div>
      <div class="grp"><h4>Precio en las fotos</h4><div class="opts">${opt('mode','mine','Mi precio de compra')}${opt('mode','margin','Con mi ganancia')}${opt('mode','none','Sin precio')}</div>
        ${cfg.mode === 'margin' ? `<label class="rng">Ganancia: <b id="mg-v">${cfg.margin}%</b><input type="range" id="mg" min="5" max="150" step="5" value="${cfg.margin}"></label>` : ''}</div>
      <div class="grp"><h4>Formato</h4><div class="opts">${opt('fmt','pdf','PDF (para mandar por WhatsApp)')}${opt('fmt','zip','Fotos sueltas')}</div></div>
      ${logoControls('cg')}
      <p class="gn" id="cg-n">${L.length ? `${Math.min(L.length, MAX)} prendas${L.length > MAX ? ` (de ${L.length}; elegí una categoría o marca para ver el resto)` : ''}.` : 'No hay prendas con esa selección.'}</p></div>
      <div class="df pad"><button type="button" class="go" id="cg-go" ${L.length ? '' : 'disabled'}>Descargar catálogo</button></div></div>`;
    d.querySelector('.fx').onclick = () => d.close();
    d.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { cfg[b.dataset.k] = b.dataset.v; if (b.dataset.k !== 'brand' && b.dataset.k !== 'mode' && b.dataset.k !== 'fmt') cfg.brand = 'all'; save(); const sc = d.querySelector('.db').scrollTop; draw(); d.querySelector('.db').scrollTop = sc; });
    const mg = d.querySelector('#mg'); if (mg) mg.oninput = e => { cfg.margin = +e.target.value; d.querySelector('#mg-v').textContent = cfg.margin + '%'; save(); };
    bindLogo(d, 'cg', cfg, () => {});
    d.querySelector('#cg-go').onclick = () => build(list().slice(0, MAX));
  };
  const build = async items => {
    const btn = d.querySelector('#cg-go'), n = d.querySelector('#cg-n'); btn.disabled = true;
    try {
      await lib(cfg.fmt === 'pdf' ? 'pdf' : 'zip'); const logo = await getLogo(); const out = [];
      for (let i = 0; i < items.length; i++){
        const p = items[i]; btn.textContent = `Armando ${i + 1} de ${items.length}…`;
        let im = null; try { im = await loadImg(p.simg || p.img); } catch(e){}
        const c = await drawPhoto(p, {img: im, price: pr(p), sizes: p.sizes.map(s => s.t), name: `${p.brand} ${p.name}`, code: true, logo, ...cfg}, cfg.fmt === 'pdf' ? 720 : 1080, cfg.fmt === 'pdf' ? 1000 : 1500);
        out.push({p, c});
      }
      btn.textContent = 'Preparando archivo…';
      const tag = [cfg.sec === 'H' ? 'hombre' : cfg.sec === 'M' ? 'mujer' : '', cfg.cat !== 'all' ? CAT[cfg.cat].toLowerCase() : '', cfg.brand !== 'all' ? cfg.brand.toLowerCase() : ''].filter(Boolean).join('-') || 'todo';
      if (cfg.fmt === 'pdf'){
        const {jsPDF} = window.jspdf, doc = new jsPDF({unit: 'mm', format: 'a4'}), cw = 90, ch = cw * 1000 / 720, gx = 10, gy = 8;
        out.forEach(({c}, i) => { const k = i % 4; if (i && !k) doc.addPage(); doc.addImage(c.toDataURL('image/jpeg', .82), 'JPEG', 10 + (k % 2) * (cw + gx), 10 + Math.floor(k / 2) * (ch + gy), cw, ch, undefined, 'FAST'); });
        await shareOrDownload([new File([doc.output('blob')], `catalogo-${tag}.pdf`, {type: 'application/pdf'})]);
      } else {
        const z = new JSZip(); for (const {p, c} of out) z.file(`${p.code}.jpg`, await toBlob(c, .88));
        await shareOrDownload([new File([await z.generateAsync({type: 'blob'})], `catalogo-${tag}.zip`, {type: 'application/zip'})]);
      }
      btn.textContent = 'Listo. Descargar de nuevo';
    } catch(e){ btn.textContent = 'No se pudo armar. Probá de nuevo'; }
    btn.disabled = false;
  };
  draw(); if (!d.open) d.showModal();
}

// ── ficha ──
const GRP = {};
const sibs = p => p.group ? GRP[p.group] || [p] : [p];
const isHead = p => !p.group || sibs(p)[0] === p;
function openProduct(code, keep){
  const p = BY[code]; if (!p) return;
  const now = price(p, p.clp), may = price(p, p.clp, true), was = off(p) > .04 ? price(p, p.reg) : null;
  let pick = keep && p.sizes.some(s => s.t === keep) ? keep : p.sizes.length === 1 ? p.sizes[0].t : null;
  let im = imgs(p); const d = $('#product'), sb = sibs(p);
  const draw = () => {
    const msg = `Hola! Tengo una consulta por: ${p.brand} ${p.name}${pick ? ' · talle ' + pick : ''} (código ${p.code})`;
    d.innerHTML = `<div class="pd"><div class="gal"><button class="x" type="button" aria-label="Cerrar">×</button>
      <div class="track">${im.map(u => `<img alt="${esc(p.name)}" src="${esc(u)}">`).join('')}</div>
      ${im.length > 1 ? `<div class="dots">${im.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>
      <div class="info pad"><span class="b">${esc(p.brand)} · ${CAT[p.cat]}</span><h2>${esc(p.name)}</h2>
      ${AUTO() && hasMay(p) ? `<div class="tier"><div><small>1 o 2 prendas</small><strong>${money(now)}</strong>${was ? `<s style="font-size:12px;color:var(--muted)">${money(was)}</s>` : ''}</div><div><small>Desde ${MIN()} prendas</small><strong>${money(may)}</strong><small style="text-transform:none;letter-spacing:0">c/u · ahorrás ${money(now - may)}</small></div></div>
        <p class="tier-note">Sumá ${MIN()} prendas cualquiera al carrito, pueden ser distintas, y pagás todas a precio mayorista. No aplica a zapatillas.</p>`
      : `<span class="p"><span class="now ${was ? 'sale' : ''}">${money(now)}</span>${was ? `<s>${money(was)}</s><span class="off">−${Math.round(off(p)*100)}%</span>` : ''}</span>`}
      ${arShow(p) ? `<div class="arbox"><div><small>En Argentina sale</small><strong>${money(p.ar)}</strong></div><div><small>Con nosotros ahorrás</small><strong>${money(arSave(p))}</strong></div><p>Precio del mismo modelo en tiendas de Argentina, revisado esta semana.</p></div>` : ''}
      ${!AUTO() && hasMay(p) ? `<a class="mini" target="_blank" rel="noopener" href="${WA('Hola! Soy revendedor y quiero el precio mayorista de ' + p.brand + ' ' + p.name + ' (código ' + p.code + ')')}">¿Comprás para revender? Consultá precio mayorista</a>` : ''}
      ${sb.length > 1 ? `<span class="lbl"><span>Color: ${esc(p.color || '')}</span></span><div class="sws">${sb.map(s => `<button type="button" class="sw" data-sw="${s.code}" aria-pressed="${s === p}" aria-label="${esc(s.color)}"><img alt="" src="${esc(s.img)}"><span>${esc(s.color)}</span></button>`).join('')}</div>` : ''}
      <span class="lbl"><span>Talle${pick ? ': ' + esc(pick) : ''}</span>${p.units != null && p.units <= 2 ? '<span style="color:var(--sale)">Últimas unidades</span>' : ''}</span>
      <div class="opts">${p.sizes.map(s => `<button type="button" class="opt" aria-pressed="${s.t === pick}" data-s="${esc(s.t)}">${esc(s.t)}</button>`).join('')}</div>
      <div class="minis"><button type="button" class="mini" id="guide-open">Guía de talles</button><a class="mini" target="_blank" rel="noopener" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent('Hola! Tengo una duda con el talle de ' + p.brand + ' ' + p.name + ' (código ' + p.code + ')')}">¿Dudas? Preguntanos</a></div>
      <button class="btn k" id="add" type="button" ${pick ? '' : 'aria-disabled="true"'}>${pick ? 'Agregar al carrito' : 'Elegí tu talle'}</button>
      <div class="row2"><button class="btn line fav-t" id="fav" type="button" aria-pressed="${favs.has(p.code)}">${HEART(favs.has(p.code))}${favs.has(p.code) ? 'Guardado' : 'Guardar'}</button><a class="btn line" target="_blank" rel="noopener" href="https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(msg)}">Consultar</a></div>
      <div class="row2"><button class="btn line" id="story-btn" type="button">${ICON_STORY}Para historia</button><button class="btn line" id="share" type="button">Compartir</button></div>
      <div class="perks"><div>${ICON_OK}<span>Producto 100% original, nuevo y con etiqueta.</span></div><div>${ICON_CLOCK}<span>Te confirmamos disponibilidad por WhatsApp antes de señar.</span></div><div>${ICON_BOX}<span>Envíos a todo el país por Correo Argentino, Vía Cargo, Andreani o a domicilio.</span></div></div>
      <span class="code">Código ${p.code}</span></div></div>`;
    d.querySelector('.x').onclick = () => d.close();
    d.querySelector('#fav').onclick = () => { toggleFav(p.code); const sc = d.querySelector('.pd').scrollTop; draw(); d.querySelector('.pd').scrollTop = sc; };
    d.querySelector('#guide-open').onclick = () => openGuide(p.cat);
    d.querySelector('#story-btn').onclick = () => openStory(p, pick);
    d.querySelectorAll('.sw').forEach(b => b.onclick = () => { if (b.dataset.sw !== p.code) openProduct(b.dataset.sw, pick); });
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
  draw(); if (!d.open) d.showModal();
  try { history.replaceState(null, '', '#' + p.code); } catch(e){}
  if (!p.imgs) loadGal(p).then(() => { if (d.open && decodeURIComponent(location.hash.slice(1)) === p.code && imgs(p).length > im.length){ im = imgs(p); const pd = d.querySelector('.pd'), sc = pd.scrollTop; draw(); d.querySelector('.pd').scrollTop = sc; } });
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
  DATA.productos = DATA.productos.filter(p => CAT[p.cat] && !/perfume|mist|loci[oó]n|crema|jab[oó]n|varilla|set de regalo/i.test(p.name));
  DATA.productos = DATA.productos.filter(p => { const e = est[p.store]; return !e || !e.ultimo_ok || (Date.now() - new Date(e.ultimo_ok)) < lim; });
  DATA.productos.forEach(p => {
    p.img = U(p.img); if (p.simg) p.simg = U(p.simg);
    p.name = arName(p.name);
    p.brand = BRAND_FIX[(p.brand || '').trim().toLowerCase()] || (p.brand || '').trim();
    p.sizes = p.sizes.map(s => ({...s, t: cleanSize(s.t, p.cat)}));
    const seenS = new Set(); p.sizes = p.sizes.filter(s => !seenS.has(s.t) && seenS.add(s.t));
    p.sizes.forEach(s => s.tg = tags(s.t, p.cat));
    BY[p.code] = p;
    if (p.group) (GRP[p.group] = GRP[p.group] || []).push(p);
  });
  document.querySelectorAll('.wa-link').forEach(a => a.href = `https://wa.me/${CFG.whatsapp}`);
  document.querySelectorAll('.min-n').forEach(e => e.textContent = MIN());

  favs = new Set(store.get('favs', [])); saveFavs();
  cart = store.get('cart', []); form = Object.assign(form, store.get('form', {})); saveCart();
  rails(); render();
  const h = decodeURIComponent(location.hash.slice(1)); if (h && BY[h]) openProduct(h);
}
const jump = () => document.getElementById('catalogo').scrollIntoView({behavior: 'smooth'});
document.addEventListener('click', e => {
  const c = e.target.closest('.card'); if (c) return openProduct(c.dataset.c);
  const bo = e.target.closest('[data-open]'); if (bo) return openProduct(bo.dataset.open);
  const s = e.target.closest('[data-sec]');
  if (s){ f.arOnly = false; if (s.dataset.sec === 'sale') f.sale = !f.sale; else { f.sec = s.dataset.sec; f.sale = false; } f.cat = 'all'; f.sizes.clear(); f.brands.clear(); shown = 40; render(); if (s.dataset.jump || s.closest('.nav')) jump(); return; }
  const k = e.target.closest('[data-cat]'); if (k){ f.cat = k.dataset.cat; f.sizes.clear(); shown = 40; render(); if (k.dataset.jump) jump(); return; }
  const r = e.target.closest('[data-rail]'); if (r){ f.sort = r.dataset.rail; if (r.dataset.rail === 'off') f.sale = true; f.arOnly = r.dataset.rail === 'ar'; render(); jump(); return; }
  const o = e.target.closest('#fbody .opt');
  if (o){ if (o.dataset.m){ const s = f[o.dataset.m]; s.has(o.dataset.v) ? s.delete(o.dataset.v) : s.add(o.dataset.v); } else f[o.dataset.k] = o.dataset.v; filtersUI(); return; }
});
$('#fbtn').onclick = () => { filtersUI(); $('#filters').showModal(); };
$('#fclose').onclick = () => $('#filters').close();
$('#fapply').onclick = () => $('#filters').close();
$('#fclear').onclick = () => { f.brands.clear(); f.sizes.clear(); f.sort = 'top'; filtersUI(); };
$('#filters').addEventListener('close', () => { shown = 40; render(); });
$('#product').addEventListener('close', () => { try { history.replaceState(null, '', location.pathname); } catch(e){} });
$('#fbtn2').onclick = openFavs;
document.querySelectorAll('.guide-link').forEach(b => b.onclick = () => openGuide('BZ'));
document.querySelectorAll('.cat-dl').forEach(b => b.onclick = openCatalog);
['#filters','#product','#cart','#favs','#guide','#story','#catdl'].forEach(id => $(id).addEventListener('click', e => { if (e.target === $(id)) $(id).close(); }));
$('#cbtn').onclick = openCart;
$('#sbtn').onclick = () => { const r = $('#srow'); r.hidden = !r.hidden; if (!r.hidden) $('#q').focus(); };
$('#q').oninput = e => { f.q = e.target.value; shown = 40; render(); const c = f.q.trim().toUpperCase().replace(/^(LI)[\s-]?/, 'LI-'); if (/^LI-[A-Z0-9]{4,}$/.test(c) && BY[c]) openProduct(c); };
$('#more').onclick = () => { shown += 40; render(); };
start();
})();
