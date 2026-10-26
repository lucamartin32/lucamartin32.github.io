import requests, json, re
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
H={'User-Agent':UA,'Accept':'application/json','Content-Type':'application/json','Store':'default'}
V='https://www.victoriassecret.cl'
out={}
def gql(q,v=None):
  try:
    r=requests.post(V+'/graphql',headers=H,json={'query':q,'variables':v or {}},timeout=40); return (r.status_code, r.text[:2500])
  except Exception as e: return str(e)[:150]
out['cats']=gql('{ categories(filters:{}){ items{ id name url_path children{ id name url_path product_count children{ id name url_path product_count } } } } }')
out['prods']=gql('{ products(search:"", pageSize:3){ total_count items{ __typename sku name url_key stock_status price_range{ minimum_price{ final_price{value} regular_price{value} } } small_image{url} ... on ConfigurableProduct { configurable_options{ attribute_code label values{label} } variants{ product{ sku stock_status } attributes{ code label } } } } } }')
out['pickup']=gql('{ pickupLocations(pageSize:30){ total_count items{ pickup_location_code name city street latitude longitude } } }')
out['storeconfig']=gql('{ storeConfig{ store_code base_currency_code locale } }')
r=requests.get(V,headers={'User-Agent':UA},timeout=30); t=r.text
out['home_hints']=[m for m in set(re.findall(r'(retiro[^<"]{0,60}|click\s*&?\s*collect[^<"]{0,40}|magento[^<"]{0,30}|Magento_[A-Za-z]+)',t,re.I))][:20]
out['rest']=requests.get(V+'/rest/V1/store/storeViews',headers={'User-Agent':UA},timeout=30).status_code
json.dump(out,open('tools/ar.json','w'),indent=1,ensure_ascii=False)
