import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
out={}
def raw(host, path='/api/catalog_system/pub/products/search', **p):
  r=requests.get(f'https://{host}{path}',headers=H,params=p,timeout=30)
  try: return r.json()
  except Exception: return [r.status_code, r.text[:80]]
j=raw('www.sporting.com.ar',ft='nike air force',_from=0,_to=4)
out['sp_sample']=[(x.get('productName'),x.get('productReference'),x.get('productId'),[(it.get('itemId'),it.get('ean'),[r.get('Value') for r in (it.get('referenceId') or [])]) for it in x.get('items',[])[:2]]) for x in j] if isinstance(j,list) else j
if isinstance(j,list) and j:
  ref=j[0].get('productReference'); it=j[0]['items'][0]; rid=(it.get('referenceId') or [{}])[0].get('Value'); ean=it.get('ean')
  out['by_ft_ref']=len(raw('www.sporting.com.ar',ft=ref) or [])
  out['by_ft_ref_short']=len(raw('www.sporting.com.ar',ft=ref.split('-')[0]) or [])
  out['by_refid']=len(raw('www.sporting.com.ar',fq='alternateIds_RefId:'+str(rid)) or [])
  out['by_ean']=len(raw('www.sporting.com.ar',fq='alternateIds_Ean:'+str(ean)) or [])
  out['by_ean_skuapi']=str(raw('www.sporting.com.ar',path='/api/catalog_system/pub/products/search',fq='alternateIds_Ean:'+str(ean)))[:150]
j=raw('www.grid.com.ar',ft='nike air force',_from=0,_to=4)
out['grid_sample']=[(x.get('productName'),x.get('productReference'),[(it.get('ean'),[r.get('Value') for r in (it.get('referenceId') or [])], it.get('name')) for it in x.get('items',[])[:1]], [ (k,x.get(k)) for k in x.get('allSpecifications',[]) ][:6]) for x in j] if isinstance(j,list) else j
if isinstance(j,list) and j:
  ean=j[0]['items'][0].get('ean'); out['grid_by_ean']=len(raw('www.grid.com.ar',fq='alternateIds_Ean:'+str(ean)) or [])
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
