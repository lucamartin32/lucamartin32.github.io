import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
out={}
def vt(host, ft=None, fq=None):
  p={'_from':0,'_to':2}
  if ft: p['ft']=ft
  if fq: p['fq']=fq
  try:
    r=requests.get(f'https://{host}/api/catalog_system/pub/products/search',headers=H,params=p,timeout=30)
    try:
      j=r.json()
      return [(x.get('productName'),x.get('productReference'),x.get('brand'),[(it.get('ean'),(it.get('sellers',[{}])[0].get('commertialOffer') or {}).get('Price')) for it in x.get('items',[])[:1]]) for x in j[:2]]
    except Exception: return (r.status_code, r.text[:100])
  except Exception as e: return str(e)[:120]
for host in ['www.sporting.com.ar','www.opensports.com.ar','www.digitalsport.com.ar','www.stockcenter.com.ar','www.grid.com.ar','www.solodeportes.com.ar','www.thefoot.com.ar','ar.calvinklein.com','www.vaypol.com.ar','www.dash.com.ar','www.redsport.com.ar']:
  out[host+' style']=vt(host,ft='IO0027-010')
  out[host+' text']=vt(host,ft='jordan')
# The Line (Chile) ean sample
try:
  r=requests.get('https://www.theline.cl/api/catalog_system/pub/products/search',headers=H,params={'ft':'nike','_from':0,'_to':2},timeout=30).json()
  out['theline']=[(x.get('productName'),x.get('productReference'),[it.get('ean') for it in x.get('items',[])[:2]],[ (it.get('referenceId') or [{}])[0].get('Value') for it in x.get('items',[])[:2]]) for x in r]
except Exception as e: out['theline']=str(e)[:100]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
