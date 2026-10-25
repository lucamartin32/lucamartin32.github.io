import requests, json
H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36','Accept':'application/json','Accept-Language':'es-AR,es;q=0.9'}
def raw(host, **p):
  try:
    r=requests.get(f'https://{host}/api/catalog_system/pub/products/search',headers=H,params=p,timeout=30); j=r.json()
    return j if isinstance(j,list) else []
  except Exception: return []
def spec(x,k): return (x.get(k) or [''])[0] if isinstance(x.get(k),list) else ''
out={}
j=raw('www.grid.com.ar',ft='nike',_from=0,_to=9)
out['grid_nike']=[(x.get('productName'),x.get('productReference'),spec(x,'Proveedor')) for x in j]
if j:
  pv=spec(j[0],'Proveedor'); out['grid_ft_prov']=[(x.get('productName'),spec(x,'Proveedor')) for x in raw('www.grid.com.ar',ft=pv)]
  out['grid_ft_prov_nodash']=[(x.get('productName'),spec(x,'Proveedor')) for x in raw('www.grid.com.ar',ft=pv.replace('-',''))]
out['grid_ft_B75807']=[(x.get('productName'),spec(x,'Proveedor')) for x in raw('www.grid.com.ar',ft='B75807')]
j=raw('www.sporting.com.ar',ft='nike',_from=0,_to=9)
out['sp_nike']=[(x.get('productName'),x.get('productReference')) for x in j]
if j:
  ref=j[0].get('productReference'); out['sp_ft_short']=[(x.get('productName'),x.get('productReference')) for x in raw('www.sporting.com.ar',ft=ref.split('-')[0])]
j=raw('www.sporting.com.ar',ft='puma',_from=0,_to=4); out['sp_puma']=[(x.get('productName'),x.get('productReference')) for x in j]
j=raw('www.grid.com.ar',ft='puma',_from=0,_to=4); out['grid_puma']=[(x.get('productName'),spec(x,'Proveedor')) for x in j]
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
