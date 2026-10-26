import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
H={'User-Agent':UA,'Accept':'application/json','Content-Type':'application/json','Store':'default'}
V='https://www.victoriassecret.cl'
out={}
def gql(q,v=None,n=3000):
  try:
    r=requests.post(V+'/graphql',headers=H,json={'query':q,'variables':v or {}},timeout=60); return (r.status_code, r.text[:n])
  except Exception as e: return str(e)[:150]
out['all']=gql('{ products(filter:{price:{from:"1"}}, pageSize:2){ total_count aggregations{ attribute_code label count options{ label value count } } } }',n=6000)
out['catlist']=gql('{ categoryList(filters:{}){ id name children_count children{ id name product_count url_path children{ id name product_count url_path } } } }',n=4000)
out['retiro']=gql('{ products(filter:{retiro_express:{eq:"1"}}, pageSize:2){ total_count items{ sku name } } }')
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
