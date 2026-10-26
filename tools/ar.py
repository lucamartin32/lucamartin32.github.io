import requests, json
t=json.load(open('tools/t.json')); out={}
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
for name,u,h in [('worker','https://fotos.santacruzzluca27.workers.dev/'+t['tok'],{'User-Agent':UA}),('direct',t['url'],{'User-Agent':UA}),('direct_ref',t['url'],{'User-Agent':UA,'Referer':'https://lucaimportados.com/'}),('direct_noua',t['url'],{})]:
  try: r=requests.get(u,headers=h,timeout=30); out[name]=(r.status_code,r.headers.get('content-type'),len(r.content),r.text[:150] if 'image' not in (r.headers.get('content-type') or '') else '')
  except Exception as e: out[name]=str(e)[:150]
json.dump(out,open('tools/ar.json','w'),indent=1)
