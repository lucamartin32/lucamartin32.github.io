import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
V='https://www.victoriassecret.cl'
H={'User-Agent':UA,'Accept':'text/html'}
out={}
t=requests.get(V+'/pijamas?product_list_limit=36',headers=H,timeout=40).text
blocks=re.findall(r'"Magento_Swatches/js/swatch-renderer":\s*(\{[\s\S]*?\})\s*\}\s*\}\s*</script>',t)
out['nblocks']=len(blocks)
def bal(s,i):
  d=0
  for k in range(i,len(s)):
    if s[k]=='{': d+=1
    elif s[k]=='}':
      d-=1
      if d==0: return s[i:k+1]
i=t.find('"jsonConfig":'); jc=json.loads(bal(t,t.find('{',i)))
out['jc_keys']=list(jc.keys()); out['images_sample']={k:v for k,v in list((jc.get('images') or {}).items())[:2]}
out['optionPrices']=list((jc.get('optionPrices') or {}).items())[:2]
out['productId']=jc.get('productId'); out['index']=list((jc.get('index') or {}).items())[:3]
i2=t.find('"jsonSwatchConfig":',i); 
if i2>0:
  sc=json.loads(bal(t,t.find('{',i2))); out['swatch_sample']={k:dict(list(v.items())[:3]) for k,v in list(sc.items())[:2]}
out['mediaCallback']=re.findall(r'"mediaCallback":\s*"([^"]+)"',t)[:1]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
