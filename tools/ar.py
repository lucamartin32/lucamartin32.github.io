import requests, json
S=json.load(open('tools/t.json')); out=[]
for st,cat,name,tok,url in S:
  try:
    r=requests.get('https://fotos.santacruzzluca27.workers.dev/'+tok,timeout=30); d=requests.get(url,timeout=30)
    out.append((st,cat,name,r.status_code,d.status_code,d.headers.get('content-type'),url[-60:]))
  except Exception as e: out.append((st,name,str(e)[:80]))
json.dump(out,open('tools/ar.json','w'),indent=0,ensure_ascii=False)
