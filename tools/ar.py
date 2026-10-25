import requests, json, re
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
out={}
def g(u,**k):
  try: r=requests.get(u,headers=H,timeout=30,**k); return r
  except Exception as e: return str(e)[:150]
# Bold full product
r=g('https://api-prd.ynk.cl/rest/v2/boldb2cstore/products/NIIO0027010',params=dict(lang='es_CL',curr='CLP',fields='FULL'))
try:
  j=r.json(); s=json.dumps(j)
  out['bold_keys']=list(j.keys()); out['bold_ean']=re.findall(r'"(ean|upc|gtin|eanCode)[^"]*":\s*"?([\w-]+)',s)[:10]
  out['bold_variant']=json.dumps((j.get('variantOptions') or [{}])[0])[:800]
except Exception as e: out['bold']=str(r)[:200]
# Grid
for ft in ['IO0027-010','IO0027','FD1437','jordan brooklyn']:
  r=g('https://www.grid.com.ar/api/catalog_system/pub/products/search',params={'ft':ft,'_from':0,'_to':2})
  try:
    j=r.json(); out['grid_'+ft]=[(p.get('productName'),p.get('productReference'),[ (it.get('ean'),it.get('name')) for it in p.get('items',[])[:2]]) for p in j[:3]]
    if j and ft=='jordan brooklyn':
      p=j[0]; out['grid_keys']=list(p.keys()); out['grid_specs']={k:p.get(k) for k in p.get('allSpecifications',[])}
      out['grid_desc']=(p.get('description') or '')[:300]; out['grid_meta']=p.get('metaTagDescription')
  except Exception as e: out['grid_'+ft]=str(r)[:150]
# CK AR
for u in ['https://ar.calvinklein.com/api/catalog_system/pub/products/search?ft=47A804G','https://www.calvinklein.com.ar/','https://calvinklein.com.ar/api/catalog_system/pub/products/search?ft=remera']:
  r=g(u); out['ck '+u]=(r.status_code, r.text[:150]) if hasattr(r,'status_code') else r
# Dexter / Moov alt
for u in ['https://www.dexter.com.ar/api/catalog_system/pub/products/search/jordan','https://www.moov.com.ar/api/catalog_system/pub/products/search/jordan','https://www.solodeportes.com.ar/api/catalog_system/pub/products/search?ft=IO0027-010','https://www.nike.com.ar/IO0027-010?_q=IO0027-010']:
  r=g(u); out[u]=(r.status_code, r.text[:120]) if hasattr(r,'status_code') else r
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
