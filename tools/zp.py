import requests, json
H={'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1','Accept':'application/json, text/plain, */*','Accept-Language':'es-CL,es;q=0.9'}
out={}
for u in ['https://www.zara.com/cl/es/cazadora-bomber-ligera-p04302510.html?v1=557105265&ajax=true',
          'https://www.zara.com/cl/es/products-details?productIds=557105265&ajax=true',
          'https://www.zara.com/cl/es/cazadora-combinado-acolchado-p08574700.html?v1=551703675&ajax=true']:
    try:
        r=requests.get(u,headers=H,timeout=30); t=r.text
        out[u]={'status':r.status_code,'len':len(t),'head':t[:300]}
        try:
            j=r.json(); s=json.dumps(j)
            import re
            out[u]['sizes']=re.findall(r'"name":"(XS|S|M|L|XL|XXL)","availability":"(\w+)"',s)[:40]
            out[u]['avail']=re.findall(r'"availability":"(\w+)"',s)[:40]
            out[u]['colors']=re.findall(r'"name":"([^"]{2,20})","productId":(\d+)',s)[:10]
            out[u]['snip']=s[s.find('sizes'):s.find('sizes')+1500]
        except Exception as e: out[u]['json']=str(e)
    except Exception as e: out[u]={'err':str(e)}
json.dump(out,open('tools/zp.json','w'),indent=1)
