import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
out={}
def vt(host, **p):
  try:
    r=requests.get(f'https://{host}/api/catalog_system/pub/products/search',headers=H,params=p,timeout=30)
    try:
      j=r.json(); return [(x.get('productName'),x.get('productReference'),[((it.get('sellers',[{}])[0].get('commertialOffer') or {}).get('Price'),[q.get('Value') for q in (it.get('referenceId') or [])]) for it in x.get('items',[])[:1]]) for x in j[:5]] if isinstance(j,list) else j
    except Exception: return (r.status_code, r.text[:120])
  except Exception as e: return str(e)[:120]
out['ar_remera']=vt('www.calvinklein.ar',ft='remera',_from=0,_to=4)
out['ar_47A804G']=vt('www.calvinklein.ar',ft='47A804G')
out['ar_47A804G001']=vt('www.calvinklein.ar',ft='47A804G001')
out['cl_sample']=vt('www.calvinklein.cl',ft='remera',_from=0,_to=4)
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
