import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
out={}
H={'User-Agent':UA,'Accept':'text/html'}
r=requests.get(V+'/bras?product_list_limit=36',headers=H,timeout=40); t=r.text
out['cat_st']=(r.status_code,len(t))
items=re.findall(r'<li class="item product product-item[\s\S]*?</li>',t)
out['n_items']=len(items)
out['item0']=items[0][:3000] if items else t[t.find('product-item'):t.find('product-item')+3000]
out['toolbar']=re.findall(r'toolbar-number">(\d+)<',t)[:5]
links=re.findall(r'href="(https://www\.victoriassecret\.cl/[a-z0-9\-]+\.html)"',t)
out['links']=list(dict.fromkeys(links))[:5]
if links:
  p=requests.get(links[0],headers=H,timeout=40).text
  i=p.find('spConfig'); out['spconfig']=p[i-200:i+2500] if i>0 else 'none'
  j=p.find('"salable"'); out['salable']=p[j-300:j+800] if j>0 else 'none'
  out['ld']=re.findall(r'<script type="application/ld\+json">([\s\S]{0,1500}?)</script>',p)[:2]
  out['stock_words']=list(set(re.findall(r'(?i)(agotad[oa]|sin stock|out of stock|retiro en tienda|retira en tienda)',p)))
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
