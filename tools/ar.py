import requests, json, re
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json'}
out={}
kw=('interior','boxer','calzon','slip','brief','trunk','calcet','media','sostén','sosten','bra','pijama','lounge','underwear','panty','calza','bikini','tanga','body')
def tree(host):
  t=requests.get(host+'/api/catalog_system/pub/category/tree/3',headers=H,timeout=30).json(); acc=[]
  def walk(n,path):
    for c in n:
      p=path+[c['name']]; acc.append(('/'.join(p), c['id'])); walk(c.get('children',[]),p)
  walk(t,[]); return acc
for st,host in [('TOM','https://cl.tommy.com'),('CK','https://www.calvinklein.cl'),('LIN','https://www.theline.cl')]:
  try: out[st]=[a for a in tree(host) if any(k in a[0].lower() for k in kw)]
  except Exception as e: out[st]=str(e)[:150]
B='https://api-prd.ynk.cl/rest/v2/boldb2cstore/products/search'
for q in ['boxer','calcetin','calcetines','calzoncillo','bralette','peto','ropa interior','trunk','brief','pack']:
  try:
    r=requests.get(B,headers=H,params=dict(query=q,pageSize=5,fields='DEFAULT',lang='es_CL',curr='CLP'),timeout=30).json()
    out['bold_'+q]=(r.get('pagination',{}).get('totalResults'),[re.sub('<[^>]+>','',p.get('name','')) for p in r.get('products',[])[:4]])
  except Exception as e: out['bold_'+q]=str(e)[:100]
for host in ['https://www.victoriassecret.cl','https://victoriassecret.cl','https://www.victoriassecret.com/cl/','https://cl.victoriassecret.com','https://www.vsbeautychile.cl']:
  try:
    r=requests.get(host,headers={'User-Agent':H['User-Agent']},timeout=30,allow_redirects=True)
    out['vs '+host]=(r.status_code, r.url, len(r.text), 'vtex' in r.text.lower(), re.findall(r'<title>(.*?)</title>',r.text,re.S)[:1], r.headers.get('server'), r.headers.get('x-powered-by'))
  except Exception as e: out['vs '+host]=str(e)[:150]
for host in ['https://www.victoriassecret.cl']:
  for path in ['/api/catalog_system/pub/category/tree/2','/api/catalog_system/pub/products/search?_from=0&_to=2','/api/checkout/pub/pickup-points?geoCoordinates=-70.6082;-33.4182']:
    try:
      r=requests.get(host+path,headers=H,timeout=30); out['vsapi '+path]=(r.status_code, r.text[:600])
    except Exception as e: out['vsapi '+path]=str(e)[:150]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
