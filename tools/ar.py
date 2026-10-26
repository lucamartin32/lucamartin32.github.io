import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
out={}
def g(q,store=None):
  h={'User-Agent':UA,'Content-Type':'application/json'}
  if store: h['Store']=store
  r=requests.post(V+'/graphql',headers=h,json={'query':q},timeout=60); return r.text[:3000]
out['stores']=g('{ availableStores(useCurrentGroup:false){ store_code store_name website_code store_group_code } }')
codes=re.findall(r'"store_code":"([^"]+)"',out['stores'])
for c in codes:
  out['n_'+c]=g('{ products(filter:{price:{from:"1"}}, pageSize:2){ total_count items{ name sku } } }',c)[:300]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
