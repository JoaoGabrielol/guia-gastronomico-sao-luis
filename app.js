/* Sem frameworks: DOM, Fetch API e autenticação REST do Supabase. */
'use strict';
const $ = id => document.getElementById(id);
const state = { places: [], reviews: [], selected: null, session: null, offline: false, signup: false, detailVersion: 0 };
const symbols = { Cafeteria: '☕', Restaurante: '♧', Bar: '♢', Sorveteria: '❋' };
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function storeSession(session) {
  state.session = session;
  try { session ? sessionStorage.setItem('sabores-session', JSON.stringify(session)) : sessionStorage.removeItem('sabores-session'); } catch { /* Sessão em memória quando armazenamento está bloqueado. */ }
  updateAccount();
}
async function request(endpoint, { method = 'GET', body, authenticated = false, headers = {} } = {}) {
  if (!APP_CONFIG.url || !APP_CONFIG.key) throw new Error('Serviço ainda não configurado.');
  const authHeaders = { apikey: APP_CONFIG.key, 'Content-Type': 'application/json', ...headers };
  if (authenticated) {
    if (!state.session) throw new Error('Entre na sua conta para continuar.');
    if (state.session.expires_at * 1000 < Date.now() + 30000) {
      try {
        const refreshed = await request('/auth/v1/token?grant_type=refresh_token', {method:'POST',body:{refresh_token:state.session.refresh_token}});
        refreshed.expires_at = Math.floor(Date.now()/1000) + refreshed.expires_in;
        storeSession(refreshed);
      } catch { storeSession(null); throw new Error('Sua sessão expirou. Entre novamente.'); }
    }
    authHeaders.Authorization = 'Bearer ' + state.session.access_token;
  }
  let response;
  try { response = await fetch(APP_CONFIG.url + endpoint, {method,headers:authHeaders,body:body === undefined ? undefined : JSON.stringify(body),signal:AbortSignal.timeout(12000)}); }
  catch { throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { throw new Error('O serviço retornou uma resposta inválida.'); }
  if (!response.ok) {
    if (response.status === 401 || data?.error_code === 'invalid_credentials') throw new Error('E-mail ou senha inválidos, ou sessão expirada.');
    if (response.status === 429) throw new Error('Muitas tentativas. Aguarde alguns minutos.');
    if ((data?.code || data?.error_code) === 'email_not_confirmed') throw new Error('Confirme seu e-mail antes de entrar.');
    if (data?.code === '23505') throw new Error('Você já avaliou este lugar. Reabra os detalhes para editar.');
    throw new Error(data?.msg || data?.message || data?.error_description || 'Não foi possível concluir a operação.');
  }
  return data;
}
function updateAccount() {
  $('account').textContent = state.session ? 'Olá, ' + (state.session.user.user_metadata?.name || 'visitante') : 'Entrar / Criar conta';
  $('logout').hidden = !state.session;
  $('review-form').hidden = !state.session || state.offline;
  $('review-login').hidden = !!state.session && !state.offline;
  $('review-login').textContent = state.offline ? 'Avaliações indisponíveis no modo de demonstração. Reconecte para publicar.' : 'Entre na sua conta para compartilhar uma experiência.';
  $('review-enter').hidden = !!state.session || state.offline;
}
function renderPlaces(showEmptyHint = false) {
  const query = normalize($('query').value.trim());
  const category = $('category').value;
  const places = state.places.filter(p => normalize(p.name).includes(query) && (!category || p.category === category));
  $('results').replaceChildren();
  for (const place of places) {
    const card = element('article', undefined, 'card');
    const art = element('div', undefined, 'card-art ' + normalize(place.category));
    art.setAttribute('aria-hidden', 'true'); art.append(element('span', symbols[place.category] || '✥'));
    const content = element('div',undefined,'card-body');
    content.append(element('span',place.category,'card-category'),element('h3',place.name),element('p',place.description));
    const meta = element('div',undefined,'card-meta'); meta.append(element('span','⌖ ' + place.neighborhood),element('span',place.price));
    const button = element('button','Conhecer o lugar ↗'); button.type='button'; button.setAttribute('aria-label','Conhecer ' + place.name); button.addEventListener('click',()=>openDetails(place));
    content.append(meta,button); card.append(art,content); $('results').append(card);
  }
  $('empty').hidden = places.length > 0;
  $('result-count').textContent = (showEmptyHint && !query && !category ? 'Busca vazia: mostrando todos os lugares. ' : '') + places.length + (places.length === 1 ? ' lugar encontrado' : ' lugares encontrados');
}
async function loadPlaces() {
  try { state.places = await request('/rest/v1/places?select=*&order=id.asc'); state.offline=false; }
  catch { state.places=window.DEMO_PLACES; state.offline=true; }
  $('notice').textContent = state.offline ? 'Modo de demonstração: serviço indisponível. Catálogo fictício local; login e publicação exigem conexão.' : 'Catálogo acadêmico demonstrativo: nomes, endereços e horários fictícios. Não use como indicação de visita real.';
  renderPlaces(); updateAccount();
}
async function openDetails(place) {
  state.selected = place; const version=++state.detailVersion;
  $('review-message').textContent=''; $('reviews').replaceChildren(); $('review-form').reset(); $('delete-review').hidden=true;
  const content=$('detail-content'); content.replaceChildren(element('p',place.category + ' · ' + place.neighborhood,'eyebrow'));
  const title=element('h2',place.name); title.id='detail-title'; content.append(title,element('p',place.description));
  const list=element('dl');
  for (const [label,value] of [['Endereço',place.address],['Horário',place.hours],['Faixa de preço',place.price]]) list.append(element('dt',label),element('dd',value));
  content.append(list); updateAccount();
  if (!$('details').open) $('details').showModal();
  if (state.offline) { state.reviews=[]; $('reviews-status').textContent='Conecte-se para consultar avaliações reais dos usuários.'; return; }
  $('reviews-status').textContent='Carregando experiências…';
  try {
    const reviews=await request('/rest/v1/reviews?select=*&place_id=eq.' + place.id + '&order=created_at.desc');
    if (version!==state.detailVersion) return;
    state.reviews=reviews; renderReviews();
  } catch(error) { if(version===state.detailVersion) $('reviews-status').textContent=error.message; }
}
function renderReviews() {
  $('reviews').replaceChildren();
  const average=state.reviews.length ? (state.reviews.reduce((sum,r)=>sum+r.rating,0)/state.reviews.length).toFixed(1).replace('.',',') : '';
  $('reviews-status').textContent=state.reviews.length ? '★ ' + average + ' de 5 · ' + state.reviews.length + ' avaliação(ões)' : 'Este lugar ainda não tem avaliações. Seja a primeira pessoa a compartilhar!';
  for (const review of state.reviews) {
    const box=element('article',undefined,'review'); box.append(element('strong',review.author_name + ' · ' + '★'.repeat(review.rating)),element('p',review.comment),element('small',new Date(review.created_at).toLocaleDateString('pt-BR'))); $('reviews').append(box);
  }
  const mine=state.reviews.find(r=>r.user_id===state.session?.user.id);
  $('rating').value=mine ? String(mine.rating) : ''; $('comment').value=mine?.comment || ''; $('delete-review').hidden=!mine;
}
function openAuth() {
  if(state.session) return;
  $('auth-message').textContent=''; $('auth').showModal();
}
$('search-form').addEventListener('submit',event=>{ event.preventDefault();renderPlaces(true); });
$('category').addEventListener('change',()=>renderPlaces());
$('reset').addEventListener('click',()=>{ $('search-form').reset();renderPlaces();$('query').focus(); });
$('account').addEventListener('click',openAuth); $('review-enter').addEventListener('click',openAuth);
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
$('auth-toggle').addEventListener('click',()=>{
  state.signup=!state.signup; $('name-field').hidden=!state.signup; $('name').required=state.signup;
  $('auth-submit').textContent=state.signup?'Criar conta':'Entrar'; $('auth-toggle').textContent=state.signup?'Já tenho conta · Entrar':'Ainda não tenho conta · Criar conta';
  $('password').autocomplete=state.signup?'new-password':'current-password'; $('auth-message').textContent='';
});
$('auth-form').addEventListener('submit',async event=>{
  event.preventDefault(); const button=$('auth-submit');button.disabled=true; $('auth-message').textContent='Aguarde…';
  try {
    const body={email:$('email').value.trim(),password:$('password').value};
    if(state.signup) { const name=$('name').value.trim(); if(name.length<2) throw new Error('Informe um nome com pelo menos 2 caracteres.'); body.data={name}; }
    const result=await request(state.signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{method:'POST',body});
    $('password').value='';
    if(result.access_token) {result.expires_at=Math.floor(Date.now()/1000)+result.expires_in;storeSession(result);$('auth').close();if(state.selected && $('details').open) await openDetails(state.selected);}
    else $('auth-message').textContent='Cadastro solicitado. Verifique seu e-mail para confirmar a conta e depois entre. Se já tem conta, use Entrar.';
  } catch(error) { $('auth-message').textContent=error.message; } finally {button.disabled=false;}
});
$('logout').addEventListener('click',async()=>{
  $('logout').disabled=true;
  try { await request('/auth/v1/logout',{method:'POST',authenticated:true});storeSession(null);if(state.selected) renderReviews(); }
  catch(error) { $('notice').textContent=error.message; } finally {$('logout').disabled=false;}
});
$('review-form').addEventListener('submit',async event=>{
  event.preventDefault(); const button=event.submitter;button.disabled=true;$('review-message').textContent='Salvando…';
  try {
    const comment=$('comment').value.trim(), rating=Number($('rating').value);
    if(comment.length<3 || !Number.isInteger(rating) || rating<1 || rating>5) throw new Error('Informe uma nota de 1 a 5 e um comentário com pelo menos 3 caracteres.');
    const mine=state.reviews.find(r=>r.user_id===state.session?.user.id);
    const body={rating,comment,author_name:state.session.user.user_metadata?.name || 'Visitante'};
    if(!mine) {body.place_id=state.selected.id;body.user_id=state.session.user.id;}
    const result=await request('/rest/v1/reviews' + (mine?'?id=eq.' + mine.id:''),{method:mine?'PATCH':'POST',body,authenticated:true,headers:{Prefer:'return=representation'}});
    if(!result?.length) throw new Error('Avaliação não alterada. Recarregue e entre novamente.');
    await openDetails(state.selected);$('review-message').textContent='Sua avaliação foi salva!';
  } catch(error) {$('review-message').textContent=error.message;} finally {button.disabled=false;}
});
$('delete-review').addEventListener('click',async()=>{
  const mine=state.reviews.find(r=>r.user_id===state.session?.user.id);if(!mine)return;
  $('delete-review').disabled=true;
  try {const result=await request('/rest/v1/reviews?id=eq.'+mine.id,{method:'DELETE',authenticated:true,headers:{Prefer:'return=representation'}});if(!result?.length)throw new Error('Avaliação não encontrada.');await openDetails(state.selected);$('review-message').textContent='Sua avaliação foi excluída.';}
  catch(error){$('review-message').textContent=error.message;}finally{$('delete-review').disabled=false;}
});
try { const saved=JSON.parse(sessionStorage.getItem('sabores-session'));if(saved?.access_token && saved?.refresh_token && saved?.user?.id)state.session=saved; } catch { /* Primeira visita ou armazenamento indisponível. */ }
updateAccount();loadPlaces();
