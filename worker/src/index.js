// Servidor de fotos de lucaimportados.com. La clave va como secreto KEY en Cloudflare.
let keyP;
const b64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
const getKey = env => keyP ||= crypto.subtle.importKey('raw', b64u(env.KEY), 'AES-GCM', false, ['decrypt']);
async function dec(t, env) { const b = b64u(t); return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, await getKey(env), b.slice(12))); }
const nope = () => new Response('', { status: 404 });

export default {
  async fetch(req, env, ctx) {
    if (req.method !== 'GET' || !env.KEY) return nope();
    const cache = caches.default;
    const hit = await cache.match(req);
    if (hit) return hit;
    const tok = new URL(req.url).pathname.slice(1).replace(/\.\w+$/, '');
    let src;
    try { src = new URL(await dec(tok, env)); } catch (e) { return nope(); }
    if (src.protocol !== 'https:') return nope();
    const up = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/avif,image/webp,image/*' }, cf: { cacheTtl: 604800, cacheEverything: true } });
    if (!up.ok) return nope();
    const res = new Response(up.body, { headers: { 'Content-Type': up.headers.get('Content-Type') || 'image/jpeg', 'Cache-Control': 'public, max-age=2592000, immutable', 'Access-Control-Allow-Origin': '*' } });
    ctx.waitUntil(cache.put(req, res.clone()));
    return res;
  }
};
