import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
H={'User-Agent':UA,'Accept':'text/html'}
out={}
t=requests.get(V+'/pijamas?product_list_limit=36',headers=H,timeout=40).text
items=re.findall(r'<li class="item product product-item[\s\S]*?(?=<li class="item product product-item|</ol>)',t)
out['n']=len(items); it=items[0]
out['len_item']=len(it)
out['href']=re.findall(r'href="(https://www\.victoriassecret\.cl/[^"]+)"',it)[:2]
out['price']=re.findall(r'data-price-amount="([\d.]+)"[^>]*data-price-type="(\w+)"',it)[:4]
out['name']=re.findall(r'product-item-link"[^>]*>\s*([^<]+)<',it)[:1]
for key in ['jsonConfig','swatch','spConfig','salable','optionPrices','"index"','quick-add','data-product-id']:
  i=it.find(key); out['k_'+key]= it[max(0,i-150):i+700] if i>=0 else None
# global script blocks with swatch configs
out['global_cfg']=[m.start() for m in re.finditer(r'jsonConfig',t)][:5]
i=t.find('jsonConfig'); out['global_snip']=t[i-300:i+2500] if i>0 else None
out['toolbar']=re.findall(r'toolbar-number">(\d+)<',t)[:3]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
