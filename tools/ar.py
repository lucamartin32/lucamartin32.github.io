import requests, json
u='www.victoriassecret.cl/media/catalog/product/1/1/11245348_v11t1_1_5.jpg'
out={}
for name,url in [('wsrv','https://wsrv.nl/?url='+u+'&w=700&output=webp'),('weserv','https://images.weserv.nl/?url='+u+'&w=700')]:
  r=requests.get(url,timeout=40,headers={'Referer':'https://lucaimportados.com/'}); out[name]=(r.status_code,r.headers.get('content-type'),len(r.content),r.headers.get('access-control-allow-origin'))
json.dump(out,open('tools/ar.json','w'))
