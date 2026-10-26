import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
out={}
r=requests.get(V+'/',headers={'User-Agent':UA,'Accept':'text/html'},timeout=30); t=r.text
out['st']=(r.status_code,len(t))
out['store_snips']=[t[m.start()-80:m.start()+120] for m in re.finditer(r'store',t)][:12]
out['links']=list(dict.fromkeys(re.findall(r'href="(/[a-z0-9\-]+(?:/[a-z0-9\-]+)*)"',t)))[:50]+list(dict.fromkeys(re.findall(r'href="https?://www\.victoriassecret\.cl(/[^"]+)"',t)))[:50]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
