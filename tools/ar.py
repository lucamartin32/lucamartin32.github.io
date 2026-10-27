import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Content-Type':'application/json'}
B='https://www.theline.cl'; out={}
p=requests.get(B+'/api/catalog_system/pub/products/search/hm5750-010-m-l-1/p',headers=H,timeout=30).json()[0]
out['name']=p['productName']
items=[(it['itemId'],it['name'],(it['sellers'][0]['commertialOffer'] or {}).get('AvailableQuantity')) for it in p['items']]
out['items']=items
res={}
for lng,lat in [(-70.6082,-33.4182),(-70.5459,-33.3917),(-70.7383,-33.5035),(-70.5982,-33.5175),(-70.6486,-33.4397),(-70.66,-33.37)]:
  for iid,nm,_ in items:
    body={'items':[{'id':iid,'quantity':1,'seller':'1'}],'country':'CHL','geoCoordinates':[lng,lat]}
    try:
      j=requests.post(B+'/api/checkout/pub/orderForms/simulation',headers=H,json=body,timeout=30).json()
      for li in j.get('logisticsInfo',[]):
        for sla in li.get('slas',[]):
          ps=sla.get('pickupStoreInfo') or {}
          if ps.get('isPickupStore'):
            a=ps.get('address') or {}
            if sla.get('deliveryChannel')!='pickup-in-point': continue
            res.setdefault(iid,{})[ps.get('friendlyName')]=f"{a.get('street','')} {a.get('number','')}, {a.get('neighborhood') or a.get('city','')}".strip()
    except Exception as e: out.setdefault('err',[]).append(str(e)[:80])
out['pickup']=res
out['sizes']={it['itemId']:(it.get('TALLA') or it.get('Talla') or [it['name']])[0] for it in p['items']}
out['sla_sample']=None
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
