import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json'}
B='https://api-prd.ynk.cl/rest/v2/boldb2cstore'
OK={'2028','2040','2027','2011','2024','2005','2017','2039','2023','2030','2020','2037','2002','2004','2025'}
out={}
for code in ['NIHV0949077','NIHV0949085']:
  d=requests.get(B+'/products/'+code,headers=H,params=dict(lang='es_CL',curr='CLP',fields='FULL'),timeout=30).json()
  o={'name':d.get('name'),'price':(d.get('price') or {}).get('value'),'sizes':{}}
  for v in d.get('variantOptions',[]):
    sz=next((x['value'] for x in v.get('variantOptionQualifiers',[]) if x['qualifier']=='size'),'?')
    s=requests.get(B+f"/products/{v['code']}/stock",headers=H,params=dict(latitude=-33.43,longitude=-70.6,pageSize=100,fields='FULL',lang='es_CL',curr='CLP'),timeout=30).json()
    st=[(x.get('displayName') or x.get('name'), (x.get('address') or {}).get('line1'), (x.get('address') or {}).get('town'), x['stockInfo'].get('stockLevel')) for x in s.get('stores',[]) if x['name'] in OK and (x.get('stockInfo') or {}).get('stockLevel',0)>0]
    if st: o['sizes'][sz]=st
  out[code]=o
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
