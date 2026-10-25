import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json'}
out={}
B='https://api-prd.ynk.cl/rest/v2/boldb2cstore/products/search'
def s(q,**k):
  try: return requests.get(B,headers=H,params=dict(query=q,pageSize=5,fields='DEFAULT',lang='es_CL',curr='CLP',**k),timeout=30).json()
  except Exception as e: return {'err':str(e)[:100]}
j=s(':relevance:type:polerones')
out['keys']=list(j.keys()); out['facets']=[(f.get('name'),[(v.get('name'),v.get('count'),(v.get('query') or {}).get('query',{}).get('value','')[-60:]) for v in f.get('values',[])[:40]]) for f in j.get('facets',[])]
for t in ['mochilas','billeteras','bolsos','banano','bananos','necessaires','neceser','neceseres','accesorios','canguros','carteras','estuches']:
  r=s(f':relevance:type:{t}'); out['t_'+t]=(r.get('pagination',{}).get('totalResults'), [p.get('name') for p in r.get('products',[])[:3]])
for q in ['mochila','billetera','banano','neceser','bolso']:
  r=s(q); out['q_'+q]=(r.get('pagination',{}).get('totalResults'), [p.get('name') for p in r.get('products',[])[:3]])
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
