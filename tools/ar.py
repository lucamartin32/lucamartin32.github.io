import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
out={}
def vt(host, **p):
  p.update({'_from':0,'_to':2})
  try:
    r=requests.get(f'https://{host}/api/catalog_system/pub/products/search',headers=H,params=p,timeout=30)
    try:
      j=r.json()
      return [(x.get('productName'),x.get('productReference'),[(it.get('ean'),(it.get('sellers',[{}])[0].get('commertialOffer') or {}).get('Price'),(it.get('sellers',[{}])[0].get('commertialOffer') or {}).get('ListPrice')) for it in x.get('items',[])[:1]]) for x in j[:2]]
    except Exception: return (r.status_code, r.text[:80])
  except Exception as e: return str(e)[:100]
for host in ['www.sporting.com.ar','www.grid.com.ar','www.dash.com.ar']:
  for code in ['IO0027-010','IO0027010','IM5576-070','DM4044-108','DZ2795-604','FV5029-010']:
    out[f'{host} ft {code}']=vt(host,ft=code)
  out[f'{host} refid']=vt(host,fq='alternateIds_RefId:DM4044108-000')
  for e in ['0197600816619','197600816619','0197862756609']:
    out[f'{host} ean {e}']=vt(host,fq='alternateIds_Ean:'+e)
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
