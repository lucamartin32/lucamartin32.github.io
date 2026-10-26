import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
out={}
t=requests.get(V,headers={'User-Agent':UA},timeout=30).text
out['store']=list(set(re.findall(r'"(?:store_code|storeCode|store)"\s*:\s*"([^"]+)"',t)))[:10]
out['currency']=list(set(re.findall(r'"(?:baseUrl|base_url|websiteId|website_id|storeId|store_id)"\s*:\s*"?([^",}]+)',t)))[:10]
out['graphql']=list(set(re.findall(r'graphql[^"\']{0,80}',t)))[:10]
out['retiro_txt']=list(set(re.findall(r'[^<>]{0,80}(?:[Rr]etiro en tienda|[Rr]etira en tienda|[Cc]lick (?:&amp;|y|&) [Cc]ollect)[^<>]{0,80}',t)))[:10]
out['menu']=list(dict.fromkeys(re.findall(r'href="(https://www\.victoriassecret\.cl/[a-z0-9\-/]+)"',t)))[:60]
# try a category page JSON
for u in out['menu'][:3]:
  pass
for code in ['vs','victoriassecret','vs_cl','victoria','default_vs','vscl']:
  try:
    r=requests.post(V+'/graphql',headers={'User-Agent':UA,'Content-Type':'application/json','Store':code},json={'query':'{ products(filter:{price:{from:"1"}}, pageSize:2){ total_count items{ name } } }'},timeout=40)
    out['gql_'+code]=r.text[:300]
  except Exception as e: out['gql_'+code]=str(e)[:100]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
