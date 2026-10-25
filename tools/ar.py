import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json'}
out={}
B='https://api-prd.ynk.cl/rest/v2/boldb2cstore/products/search'
try:
  j=requests.get(B,headers=H,params=dict(query=':relevance',pageSize=1,fields='FULL',lang='es_CL',curr='CLP'),timeout=30).json()
  for f in j.get('facets',[]):
    if f.get('code') in ('type','category','gender','subType','tipo'): out['bold_'+f['code']]=[(v.get('code'),v.get('name'),v.get('count')) for v in f.get('values',[])]
  out['bold_facets']=[f.get('code') for f in j.get('facets',[])]
except Exception as e: out['bold']=str(e)[:200]
for st,host in [('TOM','https://cl.tommy.com'),('CK','https://www.calvinklein.cl'),('LIN','https://www.theline.cl')]:
  try:
    t=requests.get(host+'/api/catalog_system/pub/category/tree/3',headers=H,timeout=30).json()
    def walk(n,path,acc):
      for c in n:
        p=path+[c['name']]; acc.append(('/'.join(p), c['id'], c.get('url','')[-60:]))
        walk(c.get('children',[]),p,acc)
      return acc
    acc=walk(t,[],[])
    kw=('mochil','billet','necess','neces','bolso','riñon','rinon','accesor','cartera','estuche','tote','bandolera','backpack','bag','wallet')
    out[st]=[a for a in acc if any(k in a[0].lower() for k in kw)]
  except Exception as e: out[st]=str(e)[:200]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
