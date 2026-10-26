import requests, json, re, html, concurrent.futures as cf, time
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
S=requests.Session(); S.headers.update({'User-Agent':UA,'Accept':'text/html,application/json','Accept-Language':'es-CL,es;q=0.9'})
def bal(s,i):
    d=0; q=False; e=False
    for k in range(i,len(s)):
        c=s[k]
        if q:
            if e: e=False
            elif c=='\\': e=True
            elif c=='"': q=False
            continue
        if c=='"': q=True
        elif c=='{': d+=1
        elif c=='}':
            d-=1
            if d==0: return s[i:k+1]
def page(path,p):
    for a in range(3):
        try:
            r=S.get(V+path,params={'product_list_limit':36,'p':p},timeout=60)
            if r.status_code==200: return r.text
        except Exception: pass
        time.sleep(2)
    return ''
def parse(t):
    out=[]
    items=re.findall(r'<li class="item product product-item[\s\S]*?(?=<li class="item product product-item|</ol>)',t)
    for it in items:
        pid=(re.search(r'data-product-id="(\d+)"',it) or [None,None])[1]
        name=html.unescape((re.search(r'product-item-link"[^>]*>\s*([^<]+?)\s*<',it) or [None,''])[1])
        href=html.unescape((re.search(r'product-item-link" href="([^"]+)"',it) or [None,''])[1])
        brand=html.unescape((re.search(r'product-item-brand">\s*<span>([^<]+)<',it) or [None,''])[1])
        img=html.unescape((re.search(r'product-image-photo"\s+src="([^"]+)"',it) or [None,''])[1])
        fin=re.findall(r'data-price-amount="([\d.]+)"[^>]*data-price-type="finalPrice"',it); old=re.findall(r'data-price-amount="([\d.]+)"[^>]*data-price-type="oldPrice"',it)
        jc=sc=None
        m=re.search(r'swatch-option-%s\]"\s*:\s*\{'%pid,t)
        if m:
            i=t.find('"jsonConfig":',m.end()); j=t.find('"jsonSwatchConfig":',m.end())
            try: jc=json.loads(bal(t,t.find('{',i)))
            except Exception: jc=None
            try: sc=json.loads(bal(t,t.find('{',j)))
            except Exception: sc=None
        out.append(dict(pid=pid,name=name,href=href,brand=brand,img=img,fin=float(fin[0]) if fin else None,old=float(old[0]) if old else None,jc=jc,sc=sc))
    return out
def media(child):
    try:
        j=S.get(V+'/swatches/ajax/media/',params={'product_id':child,'isAjax':'true'},headers={'X-Requested-With':'XMLHttpRequest','Accept':'application/json'},timeout=40).json()
        g=j.get('gallery') or {}
        ims=[v.get('large') or v.get('full') for v in (g.values() if isinstance(g,dict) else g)]
        return [x for x in ([j.get('large')]+ims) if x][:4]
    except Exception: return []
if __name__=='__main__':
    out={}
    for path in ['/bras','/panties','/pijamas','/beauty','/pink','/lenceria','/ropa-deportiva','/deporte','/trajes-de-bano','/accesorios','/novedades','/ofertas']:
        t=page(path,1); n=re.findall(r'toolbar-number">(\d+)<',t)
        out[path]=(len(t), n[-1:] if n else None)
    t=page('/panties',1); ps=parse(t)
    out['parsed']=len(ps); p=ps[0]
    cols=[]
    if p['jc']:
        jc=p['jc']; attrs=sorted(jc['attributes'].values(),key=lambda a:int(a.get('position',0)))
        out['attrs']=[(a['code'],[o['label'] for o in a['options']][:12]) for a in attrs]
        out['salable']=str(jc.get('salable'))[:300]
        out['index0']=list(jc['index'].items())[:2]
    out['p0']={k:v for k,v in p.items() if k not in('jc','sc')}
    out['media']=media(list(p['jc']['index'].keys())[0]) if p['jc'] else None
    simple=[x for x in parse(page('/beauty',1)) if not x['jc']]
    out['beauty_simple']=[(x['name'],x['fin'],x['img'][:80]) for x in simple[:4]]
    json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
