"""Testes de integração contra conta técnica descartável, provisionada separadamente."""
import os, json, re, urllib.request, urllib.error, pathlib
config=json.loads(re.search(r'window.APP_CONFIG = (.*);',pathlib.Path('config.js').read_text(encoding='utf-8')).group(1))
def call(endpoint,method='GET',body=None,token=None):
    headers={'apikey':config['key'],'Content-Type':'application/json','Prefer':'return=representation'}
    if token: headers['Authorization']='Bearer '+token
    req=urllib.request.Request(config['url']+endpoint,method=method,headers=headers,data=None if body is None else json.dumps(body).encode())
    try:
        with urllib.request.urlopen(req,timeout=20) as r:
            raw=r.read();return r.status,json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code,json.loads(e.read())
status,places=call('/rest/v1/places?select=*'); assert status==200 and len(places)==6
assert call('/rest/v1/reviews','POST',{'place_id':1,'rating':5,'comment':'Teste sem conta'})[0] in (401,403)
status,session=call('/auth/v1/token?grant_type=password','POST',{'email':os.environ['TEST_EMAIL'],'password':os.environ['TEST_PASSWORD']}); assert status==200,(status,session)
token=session['access_token'];uid=session['user']['id']
payload={'place_id':1,'user_id':uid,'author_name':'Teste técnico','rating':5,'comment':'Teste temporário de integração'}
status,rows=call('/rest/v1/reviews','POST',payload,token); assert status==201,(status,rows)
rid=rows[0]['id']
assert call('/rest/v1/reviews','POST',payload,token)[0]==409
assert call('/rest/v1/reviews?id=eq.'+rid,'PATCH',{'rating':6},token)[0]==400
status,rows=call('/rest/v1/reviews?id=eq.'+rid,'PATCH',{'rating':4,'comment':'Comentário editado no teste'},token);assert status==200 and rows[0]['rating']==4
assert call('/rest/v1/places?id=eq.1','PATCH',{'name':'Alteração indevida'},token)[0] in (401,403)
status,rows=call('/rest/v1/reviews?id=eq.'+rid,'DELETE',token=token);assert status==200 and len(rows)==1
assert call('/auth/v1/logout','POST',token=token)[0] in (200,204)
print('PASS: catálogo, bloqueio anônimo, login, criação, duplicata, nota inválida, edição, proteção do catálogo, exclusão e logout.')
