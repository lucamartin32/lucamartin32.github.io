import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
tests={
 'nike':['https://www.nike.com.ar/api/catalog_system/pub/products/search?ft=IO0027-010','https://www.nike.com.ar/api/catalog_system/pub/products/search?ft=jordan%20brooklyn&_from=0&_to=2'],
 'grid':['https://www.grid.com.ar/api/catalog_system/pub/products/search?ft=jordan%20brooklyn&_from=0&_to=2'],
 'moov':['https://www.moov.com.ar/api/catalog_system/pub/products/search?ft=jordan%20brooklyn&_from=0&_to=2'],
 'dexter':['https://www.dexter.com.ar/api/catalog_system/pub/products/search?ft=jordan%20brooklyn&_from=0&_to=2'],
 'tommy':['https://www.tommy.com.ar/api/catalog_system/pub/products/search?ft=MW0MW41338&_from=0&_to=2','https://ar.tommy.com/api/catalog_system/pub/products/search?ft=MW0MW41338'],
 'ck':['https://www.calvinklein.com.ar/api/catalog_system/pub/products/search?ft=47A804G&_from=0&_to=2'],
 'adidas':['https://www.adidas.com.ar/api/search/query?query=samba'],
}
out={}
for k,us in tests.items():
  for u in us:
    try:
      r=requests.get(u,headers=H,timeout=30); t=r.text
      o={'st':r.status_code,'len':len(t),'head':t[:200]}
      try:
        j=r.json()
        if isinstance(j,list) and j:
          p=j[0]; it=p.get('items',[{}])[0]
          o['first']={'name':p.get('productName'),'ref':p.get('productReference'),'brand':p.get('brand'),'link':p.get('link'),
                      'price':(it.get('sellers',[{}])[0].get('commertialOffer',{}) or {}).get('Price'),
                      'list':(it.get('sellers',[{}])[0].get('commertialOffer',{}) or {}).get('ListPrice'),'refid':[x.get('Value') for x in it.get('referenceId',[])],
                      'n':len(j)}
      except Exception as e: o['jerr']=str(e)[:80]
      out[u]=o
    except Exception as e: out[u]={'err':str(e)[:200]}
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
