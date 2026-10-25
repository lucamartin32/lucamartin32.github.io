import requests, json
H={'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1','Accept':'application/json, text/plain, */*','Accept-Language':'es-CL,es;q=0.9'}
out={}
for u in ['https://www.zara.com/cl/es/cazadora-bomber-ligera-p04302510.html?v1=557105265&ajax=true',
          'https://www.zara.com/cl/es/cazadora-combinado-acolchado-p08574700.html?v1=551703675&ajax=true']:
    j=requests.get(u,headers=H,timeout=30).json()
    p=j.get('product',{})
    o={'top':list(j.keys())[:40],'pkeys':list(p.keys())[:40]}
    d=p.get('detail',{})
    o['dkeys']=list(d.keys())[:40]
    cols=[]
    for c in d.get('colors',[]):
        cols.append({'name':c.get('name'),'id':c.get('id'),'productId':c.get('productId'),'price':c.get('price'),
                     'sizes':[(s.get('name'),s.get('availability'),s.get('sku')) for s in c.get('sizes',[])],
                     'imgs':[(m.get('url') or '')[:200] for m in (c.get('xmedia') or [])[:6]],
                     'ckeys':list(c.keys())})
    o['colors']=cols
    out[u]=o
json.dump(out,open('tools/zp.json','w'),indent=1,ensure_ascii=False)
