(function(){
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var AL='ABCDEFGHJKMNPQRSTUVWXYZ23456789',HX='0123456789abcdef';
function rnd(n,al){var s='';for(var i=0;i<n;i++)s+=al[Math.floor(Math.random()*al.length)];return s}
function rr(a){return(Math.random()*2-1)*a}
var K=111320,me={lat:-3.1190,lon:-60.0217,code:'!'+rnd(8,HX)},cosL=Math.cos(me.lat*Math.PI/180),range=3500,sfv='SF9';
var nid=0,gid=0;
function mkNode(name,n,e,code){return{id:'n'+(++nid),name:name,code:code||'!'+rnd(8,HX),lat:me.lat+n/K,lon:me.lon+e/(K*cosL),vx:rr(3),vy:rr(3),st:'ok',seen:Date.now()}}
var nodes=[['Mãe',900,1200],['Pai',-2600,1800],['Vovó',-5200,2600],['Davi',1500,-6800],['Tio Luís',7800,5400]].map(function(a){return mkNode(a[0],a[1],a[2])});
var groups=[{id:'g'+(++gid),name:'Família',code:rnd(6,AL),members:nodes.map(function(n){return n.id})}];
var msgs=[],sup={},cur=null,mg=null,sel=null,fid=0;
function mkNote(n,e,road,hole,miss,cov){return{id:'f'+(++fid),lat:me.lat+n/K,lon:me.lon+e/(K*cosL),road:road,hole:hole,miss:miss,cov:cov,t:Date.now()}}
var field=[mkNote(220,80,'asfalto',0,0,'boa'),mkNote(-400,520,'terra',1,0,'média'),mkNote(1100,-900,'trilha',0,1,'fraca'),mkNote(-1800,200,'cascalho',1,0,'média'),mkNote(3200,1400,'ponte',0,0,'boa'),mkNote(-700,-2400,'terra',0,1,'fraca')];
var heatS=[],mesh=(window.LORA_BR||[]).map(function(x){return{lat:x[0],lon:x[1],q:x[2]}});
try{var sv=JSON.parse(localStorage.getItem('abrigo')||'null');if(sv){msgs=sv.m||[];sup=sv.s||{};if(sv.g){groups=sv.g;gid=sv.gi}if(sv.n){nodes=sv.n.map(function(o){o.vx=rr(3);o.vy=rr(3);o.st='ok';o.seen=Date.now();return o});nid=sv.ni}if(sv.c)me.code=sv.c;if(sv.f&&sv.f.length){field=sv.f;fid=sv.fi||field.length}if(sv.h)heatS=sv.h}}catch(e){}
if(!heatS.length)field.forEach(function(f){heatS.push({lat:f.lat,lon:f.lon,q:f.cov==='boa'?.92:f.cov==='média'?.5:.16,t:f.t})});
function save(){if(real)return;try{localStorage.setItem('abrigo',JSON.stringify({m:msgs.slice(-300).map(function(m){var o={};for(var k in m)if(k!=='u')o[k]=m[k];return o}),s:sup,g:groups,gi:gid,ni:nid,c:me.code,n:nodes.map(function(n){return{id:n.id,name:n.name,code:n.code,lat:n.lat,lon:n.lon}}),f:field,fi:fid,h:heatS.slice(-400)}))}catch(e){}}
function sys(c,x){msgs.push({c:c,f:'Sistema',x:x,sys:1,t:Date.now(),rd:1})}
if(!msgs.length){var n0=Date.now();msgs=[{c:'dn1',f:'Mãe',x:'Chegou bem?',t:n0-3600000},{c:'g1',f:'Pai',x:'Se a casa não for segura, nos encontramos na ponte velha.',t:n0-1800000},{c:'dn4',f:'Davi',x:'Estou com água e lanterna.',t:n0-900000}];sys('g1','Grupo criado. Código de convite: '+groups[0].code)}
function nodeBy(i){return nodes.filter(function(n){return n.id===i})[0]}
function dist(a,b){if(a.lat==null||b.lat==null)return Infinity;return Math.hypot((a.lat-b.lat)*K,(a.lon-b.lon)*K*cosL)}
function route(to){if(!to)return -1;if(real)return to.num&&Date.now()-to.seen<900000?(to.hops||0)+1:-1;var all=[me].concat(nodes),seen={},q=[[me,0]];seen.me=1;
 while(q.length){var c=q.shift();if(c[0]===to)return c[1];all.forEach(function(n){var k=n===me?'me':n.id;if(!seen[k]&&dist(c[0],n)<=range){seen[k]=1;q.push([n,c[1]+1])}})}return -1}
function rssi(d){return Math.round(-50-25*Math.log10(Math.max(d,100)/100))}
function hhmm(t){return new Date(t).toTimeString().slice(0,5)}
function ago(t){var s=Math.round((Date.now()-t)/1000);return s<60?'agora':s<3600?Math.round(s/60)+' min':Math.round(s/3600)+' h'}
function chats(){return groups.map(function(g){return{id:g.id,name:g.name,g:g}}).concat(nodes.map(function(n){return{id:'d'+n.id,name:n.name,n:n}})).concat([{id:'me',name:'Você (lista)'}])}
function chOf(id){return chats().filter(function(c){return c.id===id})[0]}
function last(id){for(var i=msgs.length-1;i>=0;i--)if(msgs[i].c===id)return msgs[i]}
function unread(id){return msgs.filter(function(m){return m.c===id&&!m.rd&&m.f!=='Eu'}).length}
function av(c){var h=0;for(var i=0;i<c.name.length;i++)h+=c.name.charCodeAt(i);return '<div class="av" style="background:'+(c.g?'#4a5a2a':c.id==='me'?'#5d5d4a':'hsl('+(h*37%360)+',35%,32%)')+'">'+(c.g?'👥':c.id==='me'?'📝':esc(c.name[0]))+'</div>'}
function tk(m){return m.s==='q'?'🕓':m.s==='ok'?'✓✓':m.s==='err'?'⚠':''}
function pane(p){['pl','pc','pm'].forEach(function(s){$(s).classList.toggle('on',s===p)});[].forEach.call($('nav').children,function(b){b.classList.toggle('on',b.dataset.p===p)});if(p==='pm')resize()}
$('nav').onclick=function(e){if(e.target.dataset.p)pane(e.target.dataset.p)};
function drawList(){var rows=chats().map(function(c){return{c:c,l:last(c.id)}}).sort(function(a,b){return(b.l?b.l.t:0)-(a.l?a.l.t:0)});
 $('rows').innerHTML=rows.map(function(r){var u=unread(r.c.id),l=r.l,p=l?(l.loc?'📍 Localização':l.a?'🎙 Áudio '+l.a+' s':l.x||''):'Sem mensagens';
  return '<div class="row'+(cur===r.c.id?' sel':'')+'" tabindex="0" data-c="'+r.c.id+'">'+av(r.c)+'<div class="mid"><div class="t"><b>'+esc(r.c.name)+'</b><small>'+(l?hhmm(l.t):'')+'</small></div><div class="t"><span class="pv">'+(l&&l.f==='Eu'?tk(l)+' ':'')+esc(p)+'</span>'+(u?'<i class="bd">'+u+'</i>':'')+'</div></div></div>'}).join('')}
function setSub(){var c=chOf(cur);if(!c)return;$('cS').textContent=c.g?c.g.members.map(function(i){var n=nodeBy(i);return n?n.name:'?'}).join(', ')||'Sem membros':c.id==='me'?'Só você':(route(c.n)>=0?'● online · '+route(c.n)+' salto(s)':'sem sinal · visto há '+ago(c.n.seen))}
function supCard(){var S=['Água (3 L por pessoa por dia)','Comida para 7 dias','Lanterna e pilhas','Remédios e receitas','Primeiros socorros','Documentos em saco plástico','Power bank carregado','Rádio a pilha'];
 return '<div class="b"><b>Suprimentos da casa</b>'+S.map(function(s,i){return '<label class="chip"><input type="checkbox" data-i="'+i+'"'+(sup[i]?' checked':'')+'><span>'+esc(s)+'</span></label>'}).join('')+'</div>'}
function drawConv(){var c=chOf(cur);if(!c)return;var el=$('msgs'),bot=el.scrollHeight-el.scrollTop-el.clientHeight<40;
 $('pcE').hidden=true;$('pcC').hidden=false;$('cAv').innerHTML=av(c);$('cN').textContent=c.name;setSub();$('infoB').hidden=c.id==='me';
 var h=cur==='me'?supCard():'';
 msgs.forEach(function(m,k){if(m.c!==cur)return;m.rd=1;if(m.sys){h+='<div class="sys">'+esc(m.x)+'</div>';return}var mine=m.f==='Eu';
  h+='<div class="b '+(mine?'o':'')+'">'+(!mine&&c.g?'<small class="sn">'+esc(m.f)+'</small>':'')+(m.loc?'<div class="lc" data-k="'+k+'"><span>'+(m.loc.pt?'🚩':'📍')+'</span><div><b>'+(m.loc.pt?'Ponto de encontro':'Localização')+'</b><small>'+m.loc.lat.toFixed(4)+', '+m.loc.lon.toFixed(4)+'</small></div></div>':'')+(m.a?'<div class="vb"><button data-v="'+k+'" aria-label="Reproduzir">▶</button><span>0:'+('0'+m.a).slice(-2)+(m.u||m.sim?'':' (indisponível)')+'</span></div>':'')+(m.x?'<div>'+esc(m.x)+'</div>':'')+'<small class="mt">'+hhmm(m.t)+(mine?' '+tk(m):'')+'</small></div>'});
 var top=el.scrollTop;el.innerHTML=h;el.scrollTop=bot?el.scrollHeight:top}
function upStats(){var o=nodes.filter(function(n){return route(n)>=0}).length,q=msgs.filter(function(m){return m.f==='Eu'&&m.s==='q'}).length;
 $('stats').innerHTML='<span>● '+o+'/'+nodes.length+' nós</span><span>Alcance '+(range/1000).toFixed(1).replace('.',',')+' km</span><span>Fila '+q+'</span><span>'+(real?'Rádio · '+rst:'Simulado')+'</span>';
 var s=nodes.filter(function(n){return n.st==='sos'})[0];$('alert').hidden=!s;if(s){$('alert').textContent='⚠ SOS de '+s.name+' · toque para ver no mapa';$('alert').dataset.n=s.id}
 $('nl').innerHTML=nodes.map(function(n){var h=route(n),d=Math.round(dist(me,n));return '<div class="nr" data-n="'+n.id+'"><i style="background:'+(n.st==='sos'?'var(--er)':h>=0?'var(--am)':'var(--mu)')+'"></i><span><b>'+esc(n.name)+'</b> <small>'+n.code+'</small></span><small>'+(h>=0?(isFinite(d)?d+' m · ':'')+h+' salto'+(h>1?'s':'')+' · '+sig(n,d):'sem sinal · '+ago(n.seen))+'</small></div>'}).join('')+field.map(function(f){var d=Math.round(dist(me,f));return '<div class="nr" data-f="'+f.id+'"><i style="background:'+(f.hole?'var(--er)':f.miss?'var(--am)':f.cov==='boa'?'var(--gr)':'#6ea0d0')+'"></i><span><b>'+esc(f.road)+'</b> <small>'+(f.hole?'buraco':'sem buraco')+' · '+(f.miss?'faltando no mapa':'no mapa')+'</small></span><small>'+(isFinite(d)?d+' m · ':'')+'LoRa '+f.cov+'</small></div>'}).join('')}
function refresh(){drawList();if(cur)drawConv();upStats()}
function open(id){cur=id;$('att').hidden=true;$('mic').style.visibility='visible';$('attB').style.visibility=id==='me'?'hidden':'visible';drawConv();drawList();pane('pc');$('msgs').scrollTop=$('msgs').scrollHeight}
function hopsFor(c){if(c[0]==='g'){var g=groups.filter(function(x){return x.id===c})[0];return g&&g.members.length?Math.max.apply(null,g.members.map(function(i){return route(nodeBy(i))})):0}return c[0]==='d'?route(nodeBy(c.slice(1))):0}
function deliver(){if(real)return false;var ch=false;msgs.forEach(function(m){if(m.f==='Eu'&&m.s==='q'&&hopsFor(m.c)>=0){m.s='ok';ch=true}});return ch}
function post(x,loc){var m={c:cur,f:'Eu',x:x,loc:loc||null,t:Date.now(),s:cur==='me'?'':'q',rd:1};msgs.push(m);
 if(real&&cur!=='me'){var c=chOf(cur),to=c.g?BC:c.n.num,ch=c.g?(c.g.ch||0):0,w=loc?(loc.pt?'🚩 ':'📍 ')+loc.lat.toFixed(5)+','+loc.lon.toFixed(5)+(x?' '+x:''):x;
  while(te.encode(w).length>200)w=w.slice(0,-1);m.pid=rid();
  var pk=pF(2,to).concat(ch?pV(3,ch):[],pB(4,pV(1,1).concat(pB(2,te.encode(w)))),pF(6,m.pid),pV(9,3),pV(10,1));
  try{sendRaw(pB(1,pk)).catch(function(){m.s='err';refresh()})}catch(e){m.s='err'}}
 deliver();save();refresh();var e=$('msgs');e.scrollTop=e.scrollHeight}
$('snd').onclick=function(){var v=$('inp').value.trim();if(!v)return;$('inp').value='';post(v)};
$('inp').onkeydown=function(e){if(e.key==='Enter')$('snd').click()};
$('attB').onclick=function(){$('att').hidden=!$('att').hidden};
var AT={ok:'Estou bem.',help:'Preciso de ajuda, pode me ligar?',sos:'SOS! Preciso de ajuda agora.'};
$('att').onclick=function(e){var a=e.target.dataset.a;if(!a)return;$('att').hidden=true;
 if(a==='loc')post('',{lat:me.lat,lon:me.lon});else if(a==='pt')post('Ponto de encontro marcado.',{lat:me.lat,lon:me.lon,pt:1});else post(AT[a],a==='ok'?null:{lat:me.lat,lon:me.lon})};
$('rows').onclick=function(e){var r=e.target.closest('.row');if(r)open(r.dataset.c)};
$('rows').onkeydown=function(e){if(e.key==='Enter'){var r=e.target.closest('.row');if(r)open(r.dataset.c)}};
$('back').onclick=function(){pane('pl')};
$('msgs').onclick=function(e){var t=e.target;if(t.dataset.v!==undefined){play(+t.dataset.v);return}
 if(t.dataset.i!==undefined){sup[t.dataset.i]=t.checked;save();return}
 var l=t.closest('.lc');if(l){var m=msgs[+l.dataset.k];focus(m.loc.lat,m.loc.lon)}};
$('infoB').onclick=function(){var c=chOf(cur);if(c.g)showInfo(c.g);else if(c.n){sel=c.n.id;focus(c.n.lat,c.n.lon)}};
$('alert').onclick=function(){var n=nodeBy($('alert').dataset.n);if(n)focus(n.lat,n.lon)};
$('nl').onclick=function(e){var r=e.target.closest('.nr');if(!r)return;if(r.dataset.n){var n=nodeBy(r.dataset.n);sel=n.id;focus(n.lat,n.lon);return}if(r.dataset.f){var f=field.filter(function(x){return x.id===r.dataset.f})[0];if(f)focus(f.lat,f.lon)}};
// mapa (Leaflet)
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
var map=null,nm={},fm={},links=null,flags=null,rangeC=null,meM=null,osm=null,heatEl=null,dropPt=null;
function resize(){if(map)map.invalidateSize()}
if(window.L){
 map=L.map('mapw',{zoomControl:false,attributionControl:true,minZoom:5,maxZoom:19}).setView([me.lat,me.lon],14);map.attributionControl.setPrefix('Leaflet');
 var Grid=L.GridLayer.extend({createTile:function(){var t=document.createElement('canvas'),s=this.getTileSize(),x=t.getContext('2d');t.width=s.x;t.height=s.y;x.fillStyle=css('--bg');x.fillRect(0,0,s.x,s.y);x.strokeStyle=css('--ln');x.lineWidth=1;x.strokeRect(.5,.5,s.x-1,s.y-1);x.globalAlpha=.45;x.beginPath();x.moveTo(s.x/2,0);x.lineTo(s.x/2,s.y);x.moveTo(0,s.y/2);x.lineTo(s.x,s.y/2);x.stroke();return t}});
 new Grid({maxZoom:19}).addTo(map);
 osm=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 osm.on('tileerror',function(){$('lg').textContent='Ruas indisponíveis aqui; usando a grade offline.'});
 links=L.layerGroup().addTo(map);flags=L.layerGroup().addTo(map);
 rangeC=L.circle([me.lat,me.lon],{radius:range,color:css('--gr'),weight:2,dashArray:'6 5',fill:false,interactive:false}).addTo(map);
 meM=L.marker([me.lat,me.lon],{icon:L.divIcon({className:'nd me',html:'<i></i><span>VOCÊ</span>',iconSize:[0,0]}),keyboard:false}).addTo(map).bindPopup('<b>Você</b><br>Nó '+me.code);
 map.createPane('heat');map.getPane('heat').style.zIndex=350;map.getPane('heat').style.pointerEvents='none';
 heatEl=L.DomUtil.create('canvas','',map.getContainer());heatEl.style.cssText='position:absolute;left:0;top:0;pointer-events:none;z-index:350';
 map.on('zoomend moveend resize',function(){drawHeat(true);upField()});
 map.on('zoomend',function(){$('lg').textContent='Leaflet · zoom '+map.getZoom()+' · '+Math.round(156543*Math.cos(me.lat*Math.PI/180)/Math.pow(2,map.getZoom()))+' m/px'});map.fire('zoomend');
 map.on('contextmenu',function(e){L.DomEvent.preventDefault(e);dropPt=e.latlng;showNote(e.latlng.lat,e.latlng.lng)});
 try{new ResizeObserver(resize).observe($('mapw'))}catch(e){}
}else $('lg').textContent='Leaflet não carregou. Verifique a conexão.';
var heatSrc=[];
function prepHeat(){heatSrc=[me].concat(nodes.filter(function(n){return n.lat!=null&&route(n)>=0}))}
function reachM(q){return 1400+q*5600}
function loraQ(lat,lon){var p={lat:lat,lon:lon},q=0;
 heatSrc.forEach(function(n){if(n===me)return;var d=dist(p,n);if(!isFinite(d))return;var v=Math.max(0,1-d/(range*1.15));if(n.snr!=null)v=Math.max(v,Math.min(1,(n.snr+12)/22));q=Math.max(q,v)});
 heatS.forEach(function(s){var d=dist(p,s);if(!isFinite(d)||d>220)return;q=Math.max(q,s.q*Math.max(0,1-d/220))});
 mesh.forEach(function(s){var d=dist(p,s),reach=reachM(s.q);if(!isFinite(d)||d>reach)return;q=Math.max(q,s.q*Math.max(0,1-d/reach))});
 return q}
function covWord(q){return q>=.62?'boa':q>=.32?'média':q>0.04?'fraca':'sem sinal'}
function heatRgb(q){var t,r,g,b;
 if(q<.33){t=q/.33;r=29+(42-29)*t;g=78+(157-78)*t;b=137+(143-137)*t}
 else if(q<.66){t=(q-.33)/.33;r=42+(227-42)*t;g=157+(164-157)*t;b=143+(29-143)*t}
 else{t=(q-.66)/.34;r=227+(224-227)*t;g=164+(81-164)*t;b=29+(58-29)*t}
 return [Math.round(r),Math.round(g),Math.round(b)]}
function heatFill(q){var c=heatRgb(q);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+(.1+q*.48)+')'}
function paintBlob(ctx,lat,lon,q,meters){if(q<0.05||!isFinite(lat)||!isFinite(lon))return;var p=map.latLngToContainerPoint([lat,lon]),edge=map.latLngToContainerPoint([lat,lon+meters/(K*Math.max(cosL,.2))]),px=Math.abs(edge.x-p.x);if(px<2)return;var w=heatEl.width,h=heatEl.height;if(p.x<-px||p.y<-px||p.x>w+px||p.y>h+px)return;var c=heatRgb(q),g=ctx.createRadialGradient(p.x,p.y,px*.12,p.x,p.y,px);g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+','+(0.18+q*0.42)+')');g.addColorStop(1,'rgba('+c[0]+','+c[1]+','+c[2]+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,px,0,Math.PI*2);ctx.fill()}
var heatAt=0;
function drawHeat(force){if(!map||!heatEl)return;if(!$('pm').classList.contains('on')&&window.innerWidth<900)return;var now=Date.now();if(!force&&now-heatAt<2500)return;heatAt=now;prepHeat();var sz=map.getSize();if(sz.x<2||sz.y<2)return;if(heatEl.width!==sz.x||heatEl.height!==sz.y){heatEl.width=sz.x;heatEl.height=sz.y}
 var ctx=heatEl.getContext('2d');ctx.clearRect(0,0,sz.x,sz.y);
 mesh.forEach(function(s){paintBlob(ctx,s.lat,s.lon,s.q,reachM(s.q))});
 heatSrc.forEach(function(n){if(n===me||n.lat==null)return;var v=n.snr!=null?Math.max(0,Math.min(1,(n.snr+12)/22)):.55;paintBlob(ctx,n.lat,n.lon,v,range*v)});
 heatS.forEach(function(s){paintBlob(ctx,s.lat,s.lon,s.q,160+s.q*280)})}
function nearNote(){var best=null,bd=200;field.forEach(function(f){var d=dist(me,f);if(d<bd){bd=d;best=f}});return best}
function upField(){if(!$('mi'))return;prepHeat();var q=loraQ(me.lat,me.lon),w=covWord(q),n=nearNote(),cls=w==='boa'?'ok':w==='média'?'md':'wk',lab=w==='sem sinal'?'sem sinal':w.charAt(0).toUpperCase()+w.slice(1);
 $('mi').innerHTML='<b>Campo · cobertura LoRa</b><div class="barh" title="Frio: cobertura fraca · Quente: cobertura boa"></div><span class="'+cls+'">Aqui: '+lab+(w==='sem sinal'?'':' · '+rssi(Math.min(range,Math.max(40,(1-q)*range)))+' dBm')+'</span>'+(n?'<small>'+esc(n.road)+' · '+(n.hole?'com buraco':'sem buraco')+' · '+(n.miss?'faltando no mapa':'no mapa')+' · LoRa '+n.cov+'</small>':'')+'<small>Frio = fraca · quente = boa</small><small>Mesh Brasil · '+mesh.length+' nós</small>'}
function notePopup(f){return '<b>'+esc(f.road)+'</b><br>'+(f.hole?'Com buraco':'Sem buraco')+' · '+(f.miss?'Faltando no mapa':'Consta no mapa')+'<br>LoRa '+f.cov}
function showNote(la,lo){var q=loraQ(la,lo),w=covWord(q);if(w==='sem sinal')w='fraca';
 modal('<h2>Nota de campo</h2><p class="mu">Melhora o mapa neste ponto: tipo de estrada, buraco e se o trecho falta nas ruas.</p><div class="grid"><label class="f">Tipo de estrada<select id="rdT"><option>asfalto</option><option>terra</option><option>cascalho</option><option>trilha</option><option>ponte</option></select></label><label class="f">Buraco<select id="rdH"><option value="0">Não</option><option value="1">Sim</option></select></label><label class="f">Falta no mapa<select id="rdM"><option value="0">Não</option><option value="1">Sim</option></select></label><label class="f">Cobertura LoRa<select id="rdC"><option value="boa">Boa</option><option value="média">Média</option><option value="fraca">Fraca</option></select></label></div><p class="mu">'+la.toFixed(5)+', '+lo.toFixed(5)+'</p><div class="acts"><button class="btn" data-x>Cancelar</button><button class="btn p" data-act="nok">Salvar nota</button></div>');
 $('rdC').value=w}
function draw(){if(!map)return;var gr=css('--gr');
 rangeC.setLatLng([me.lat,me.lon]).setRadius(range).setStyle({color:gr});meM.setLatLng([me.lat,me.lon]);links.clearLayers();
 nodes.forEach(function(n){if(n.lat==null){if(nm[n.id]){map.removeLayer(nm[n.id]);delete nm[n.id]}return}var h=route(n),d=Math.round(dist(me,n)),cl=n.st==='sos'?' sos':h>=0?' on':'',k=cl+(n.id===sel?' s':'')+n.name+(h>=0?d:'?'),mk=nm[n.id];
  if(d<=range)L.polyline([[me.lat,me.lon],[n.lat,n.lon]],{color:gr,weight:2,interactive:false}).addTo(links);
  if(!mk){mk=nm[n.id]=L.marker([n.lat,n.lon],{keyboard:false,icon:L.divIcon({className:'nd',iconSize:[0,0]})}).addTo(map).bindPopup('');mk.on('click',function(){sel=n.id;draw()})}
  mk.setLatLng([n.lat,n.lon]);mk.setPopupContent('<b>'+esc(n.name)+'</b><br>'+(h>=0?(isFinite(d)?d+' m · ':'')+h+' salto'+(h>1?'s':'')+' · '+sig(n,d):'sem sinal · visto há '+ago(n.seen))+'<br><small>'+n.code+' · '+(n.st==='sos'?'SOS':n.st==='help'?'Precisa de ajuda':'Bem')+'</small>');
  if(mk._k!==k){mk._k=k;mk.setIcon(L.divIcon({className:'nd'+cl+(n.id===sel?' s':''),html:'<i></i><span>'+esc(n.name)+(h>=0?' '+d+' m':' ?')+'</span>',iconSize:[0,0]}))}});
 flags.clearLayers();msgs.forEach(function(m){if(m.loc&&m.loc.pt)L.marker([m.loc.lat,m.loc.lon],{interactive:false,keyboard:false,icon:L.divIcon({className:'nd fl',html:'<b>🚩</b>',iconSize:[0,0]})}).addTo(flags)});
 Object.keys(fm).forEach(function(k){if(!field.filter(function(f){return f.id===k})[0]){map.removeLayer(fm[k]);delete fm[k]}});
 field.forEach(function(f){var mk=fm[f.id],cl='rd'+(f.hole?' hole':'')+(f.miss?' miss':''),lab=f.road+(f.hole?' · buraco':'')+(f.miss?' · falta':'')+' · LoRa '+f.cov;
  if(!mk){mk=fm[f.id]=L.marker([f.lat,f.lon],{keyboard:false,icon:L.divIcon({className:'rd',iconSize:[0,0]})}).addTo(map).bindPopup('');mk.on('click',function(){dropPt=null})}
  mk.setLatLng([f.lat,f.lon]);mk.setPopupContent(notePopup(f));
  if(mk._k!==cl+lab){mk._k=cl+lab;mk.setIcon(L.divIcon({className:cl,html:'<i></i><span>'+esc(lab)+'</span>',iconSize:[0,0]}))}});
 drawHeat();upField()}
function focus(la,lo){pane('pm');if(map){map.invalidateSize();map.setView([la,lo],Math.max(map.getZoom(),15))}}
$('zi').onclick=function(){if(map)map.zoomIn()};$('zo').onclick=function(){if(map)map.zoomOut()};
$('gps').onclick=function(){if(!navigator.geolocation)return;
 navigator.geolocation.getCurrentPosition(function(p){var dl=p.coords.latitude-me.lat,dn=p.coords.longitude-me.lon;me.lat=p.coords.latitude;me.lon=p.coords.longitude;if(!real){nodes.forEach(function(n){n.lat+=dl;n.lon+=dn});msgs.forEach(function(m){if(m.loc){m.loc.lat+=dl;m.loc.lon+=dn}})}cosL=Math.cos(me.lat*Math.PI/180);heatS.push({lat:me.lat,lon:me.lon,q:loraQ(me.lat,me.lon),t:Date.now()});save();if(map)map.setView([me.lat,me.lon],Math.max(map.getZoom(),15));draw()},function(){},{enableHighAccuracy:true,timeout:10000})};
$('osm').onclick=function(){if(!map)return;
 if(map.hasLayer(osm)){map.removeLayer(osm);this.classList.remove('p')}else{osm.addTo(map);this.classList.add('p');$('lg').textContent='Ruas © OpenStreetMap'}};
if($('nota'))$('nota').onclick=function(){dropPt={lat:me.lat,lng:me.lon};showNote(me.lat,me.lon)};
window.addEventListener('resize',resize);
// voz (segure o 🎙 para falar com a conversa ou o grupo aberto)
var AC=null,rec=null,chunks=[],t0=0,stream=null,held=false;
function beep(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();[0,.18,.36].forEach(function(d,i){var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=440+i*110;g.gain.value=.08;o.connect(g);g.connect(AC.destination);o.start(AC.currentTime+d);o.stop(AC.currentTime+d+.14)})}catch(e){}}
function play(k){var m=msgs[k];if(!m)return;if(m.sim){beep();return}if(m.u){new Audio(m.u).play().catch(function(){})}}
function startRec(){if(rec)return;if(!navigator.mediaDevices||!window.MediaRecorder){$('cS').textContent='Microfone indisponível neste navegador.';return}
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){if(!held){s.getTracks().forEach(function(t){t.stop()});return}stream=s;chunks=[];rec=new MediaRecorder(s);rec.ondataavailable=function(e){chunks.push(e.data)};rec.start();t0=Date.now()}).catch(function(){$('cS').textContent='Permita o uso do microfone para gravar.'})}
function stopRec(){if(!rec)return;var r=rec;rec=null;r.onstop=function(){stream.getTracks().forEach(function(t){t.stop()});var d=Math.max(1,Math.min(60,Math.round((Date.now()-t0)/1000)));msgs.push({c:cur,f:'Eu',x:'',a:d,u:URL.createObjectURL(new Blob(chunks,{type:r.mimeType||'audio/webm'})),t:Date.now(),s:cur==='me'?'':'q',rd:1});deliver();save();refresh();var e=$('msgs');e.scrollTop=e.scrollHeight};try{r.stop()}catch(e){}}
var mic=$('mic');
mic.onpointerdown=function(e){e.preventDefault();try{mic.setPointerCapture(e.pointerId)}catch(x){}held=true;mic.classList.add('rec');$('cS').textContent='● transmitindo…';startRec()};
function up(){if(!held)return;held=false;mic.classList.remove('rec');stopRec();setSub()}
mic.onpointerup=up;mic.onpointercancel=up;mic.oncontextmenu=function(e){e.preventDefault()};
// modais, grupos e membros
function modal(h){$('mbox').innerHTML=h;$('mod').hidden=false}
function closeM(){$('mod').hidden=true}
function newGroup(name,ids){var g={id:'g'+(++gid),name:name,code:rnd(6,AL),members:ids};groups.push(g);sys(g.id,'Grupo criado. Código de convite: '+g.code);save();return g}
$('newG').onclick=function(){modal('<h2>Novo grupo</h2><label class="f">Nome do grupo<input type="text" id="gn" maxlength="24" placeholder="Ex.: Equipe da ponte"></label><b>Membros</b>'+(nodes.map(function(n){return '<label class="chip"><input type="checkbox" data-n="'+n.id+'" checked><span>'+esc(n.name)+'</span><small class="mono">'+n.code+'</small></label>'}).join('')||'<p class="mu">Nenhum contato ainda. Crie o grupo e adicione membros por código.</p>')+'<div class="acts"><button class="btn" data-x>Cancelar</button><button class="btn p" data-act="gok">Criar grupo</button></div>')};
$('joinG').onclick=function(){modal('<h2>Entrar com código</h2><p class="mu">Digite o código de convite do grupo que alguém da rede passou para você.</p><label class="f">Código<input type="text" id="jc" maxlength="8" placeholder="EX.: K7M2QX" autocomplete="off"></label><p class="mu" id="jm"></p><div class="acts"><button class="btn" data-x>Cancelar</button><button class="btn p" data-act="jok">Entrar</button></div>')};
function showInfo(g){mg=g;var out=nodes.filter(function(n){return g.members.indexOf(n.id)<0});
 modal('<h2>'+esc(g.name)+'</h2><p class="mu">Código de convite (passe para quem vai entrar)</p><div class="code mono">'+g.code+'</div><div class="acts"><button class="btn" data-act="copy">Copiar código</button></div><b>Membros ('+g.members.length+')</b>'+(g.members.filter(function(i){return nodeBy(i)}).map(function(i){var n=nodeBy(i);return '<div class="chip"><span>'+esc(n.name)+' <small class="mono">'+n.code+'</small></span><button class="sb" data-act="rm" data-n="'+n.id+'">Remover</button></div>'}).join('')||'<p class="mu">Nenhum membro.</p>')+(out.length?'<b>Adicionar contato</b>'+out.map(function(n){return '<div class="chip"><span>'+esc(n.name)+'</span><button class="sb p" data-act="add" data-n="'+n.id+'">Adicionar</button></div>'}).join(''):'')+'<b>Adicionar novo membro por código do nó</b><div class="grid"><label class="f">Nome<input type="text" id="nnN" maxlength="14"></label><label class="f">Código do nó<input type="text" id="nnC" maxlength="10" placeholder="!a1b2c3d4"></label></div><div class="acts"><button class="btn p" data-act="nn">Adicionar membro</button><button class="btn" data-x>Fechar</button></div>')}
$('mod').onclick=function(e){var t=e.target;if(t.id==='mod'||t.dataset.x!==undefined){closeM();return}var a=t.dataset.act;if(!a)return;
 if(a==='gok'){var ids=[].map.call(document.querySelectorAll('#mbox [data-n]:checked'),function(x){return x.dataset.n}),g=newGroup($('gn').value.trim()||'Grupo '+(gid+1),ids);closeM();refresh();open(g.id)}
 else if(a==='jok'){var c=$('jc').value.toUpperCase().replace(/[^A-Z0-9]/g,'');if(c.length<4){$('jm').textContent='O código tem pelo menos 4 caracteres.';return}
  var g2=groups.filter(function(x){return x.code===c})[0];
  if(!g2){var pick=nodes.filter(function(){return Math.random()<.5}).map(function(n){return n.id});g2={id:'g'+(++gid),name:'Grupo '+c,code:c,members:pick};groups.push(g2);sys(g2.id,'Você entrou pelo código '+c+'. Os membros aparecem conforme a rede os encontra.');save()}
  closeM();refresh();open(g2.id)}
 else if(a==='copy'){try{navigator.clipboard.writeText(mg.code)}catch(x){}t.textContent='Copiado'}
 else if(a==='add'){mg.members.push(t.dataset.n);sys(mg.id,nodeBy(t.dataset.n).name+' entrou no grupo.');save();refresh();showInfo(mg)}
 else if(a==='rm'){mg.members=mg.members.filter(function(i){return i!==t.dataset.n});sys(mg.id,nodeBy(t.dataset.n).name+' saiu do grupo.');save();refresh();showInfo(mg)}
 else if(a==='nn'){var nm=$('nnN').value.trim();if(!nm)return;var n=mkNode(nm,rr(4000),rr(4000),$('nnC').value.trim()||undefined);nodes.push(n);mg.members.push(n.id);sys(mg.id,nm+' foi adicionado ao grupo.');save();refresh();showInfo(mg)}
 else if(a==='nok'){var la=dropPt?dropPt.lat:me.lat,lo=dropPt?dropPt.lng||dropPt.lon:me.lon,note={id:'f'+(++fid),lat:la,lon:lo,road:$('rdT').value,hole:+$('rdH').value,miss:+$('rdM').value,cov:$('rdC').value,t:Date.now()};
  field.push(note);heatS.push({lat:la,lon:lo,q:note.cov==='boa'?.9:note.cov==='média'?.5:.18,t:note.t});dropPt=null;save();closeM();refresh();draw()}};
function showSet(){modal('<h2>Configurações do rádio</h2><div class="grid"><label class="f">Frequência<select id="fq"><option>915 MHz</option><option>433 MHz</option><option>868 MHz</option></select></label><label class="f">Fator SF<select id="sf">'+[7,8,9,10,11,12].map(function(s){return '<option>SF'+s+'</option>'}).join('')+'</select></label><label class="f">Banda<select id="bw"><option>125 kHz</option><option>250 kHz</option><option>500 kHz</option></select></label></div><p class="mu" id="rng"></p><p>Código do seu nó: <b class="mono">'+me.code+'</b></p><b>Conectar rádio</b><p class="mu">Conecte um rádio com firmware Meshtastic por USB ou Bluetooth. Ao conectar, nós, mensagens e posições passam a vir da rede LoRa real e a simulação é desligada. Enquanto o rádio estiver conectado, nada é salvo no navegador.</p><div class="acts"><button class="btn p" id="ble">Bluetooth</button><button class="btn" id="usb">USB</button></div><p class="mu" id="hw"></p><div class="acts"><button class="btn" data-x>Fechar</button></div>');
 $('sf').value=sfv;$('sf').onchange=function(){sfv=$('sf').value;upRange()};upRange();
 function hw(t){$('hw').textContent=t}
 function go2(fn){hw('Conectando…');fn().then(function(){hw('Conectado. Sincronizando nós e mensagens…')}).catch(function(e){hw('Não foi possível conectar: '+(e&&e.message||e))})}
 $('ble').onclick=function(){go2(connectBle)};$('usb').onclick=function(){go2(connectUsb)}}
function upRange(){range=Math.round(1200*Math.pow(1.4,+sfv.slice(2)-7));if($('rng'))$('rng').textContent='Alcance estimado em campo aberto: '+(range/1000).toFixed(1).replace('.',',')+' km. SF maior alcança mais longe e envia mais devagar.';upStats();draw()}
$('setB').onclick=showSet;
// rádio LoRa real (Meshtastic por USB serial ou Bluetooth)
var real=false,myNum=0,BC=4294967295,rst='',radio={},te=new TextEncoder(),td=new TextDecoder();
function vint(n){var b=[];while(n>127){b.push((n%128)|128);n=Math.floor(n/128)}b.push(n);return b}
function tg(f,w){return vint(f*8+w)}
function pV(f,v){return tg(f,0).concat(vint(v))}
function pB(f,a){a=Array.prototype.slice.call(a);return tg(f,2).concat(vint(a.length),a)}
function pF(f,v){return tg(f,5).concat([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255])}
function rv(u,st){var v=0,m=1,b,i=st;do{b=u[i++];v+=(b&127)*m;m*=128}while((b&128)&&i<u.length);return[v,i]}
function pd(u){var o=[],i=0;while(i<u.length){var r=rv(u,i),f=Math.floor(r[0]/8),w=r[0]%8,v;i=r[1];
 if(w===0){r=rv(u,i);v=r[0];i=r[1]}
 else if(w===2){r=rv(u,i);v=u.subarray(r[1],r[1]+r[0]);i=r[1]+r[0]}
 else if(w===5){v=(u[i]|u[i+1]<<8|u[i+2]<<16|u[i+3]<<24)>>>0;i+=4}
 else if(w===1){v=0;i+=8}else break;
 o.push({f:f,v:v})}return o}
function gt(a,f){for(var i=0;i<a.length;i++)if(a[i].f===f)return a[i].v}
function fl(x){var d=new DataView(new ArrayBuffer(4));d.setUint32(0,x);return d.getFloat32(0)}
function hx(n){return '!'+n.toString(16).padStart(8,'0')}
function rid(){return Math.floor(Math.random()*4294967294)+1}
function sig(n,d){return real&&n.snr!=null?n.snr.toFixed(1)+' dB SNR':isFinite(d)?rssi(d)+' dBm':'—'}
function setSt(t){rst=t;var h=$('hw');if(h)h.textContent=t;upStats()}
function nodeByNum(num){return nodes.filter(function(n){return n.num===num})[0]}
function upNode(num,o){var n=nodeByNum(num);if(!n){n={id:'n'+num,num:num,name:hx(num),code:hx(num),lat:null,lon:null,st:'ok',seen:0};nodes.push(n);if(groups[0])groups[0].members.push(n.id)}
 for(var k in o)if(o[k]!=null)n[k]=o[k];return n}
function setPos(o,pp){var la=gt(pp,1),lo=gt(pp,2);if(la!=null&&lo!=null&&((la|0)||(lo|0))){o.lat=(la|0)/1e7;o.lon=(lo|0)/1e7}}
function onFrom(u){var m=pd(u),pk=gt(m,2),mi=gt(m,3),ni=gt(m,4),cc=gt(m,7);
 if(mi){myNum=gt(pd(mi),1)||0;me.code=hx(myNum);setSt('meu nó '+me.code)}
 if(ni){var a=pd(ni),num=gt(a,1),us=gt(a,2),ps=gt(a,3),lh=gt(a,5),hp=gt(a,9),sn=gt(a,4),o={};
  if(us){var uu=pd(us);o.name=td.decode(gt(uu,2)||gt(uu,3)||new Uint8Array(0))||null}
  if(ps)setPos(o,pd(ps));
  if(lh)o.seen=lh*1000;if(hp!=null)o.hops=hp;if(sn!=null)o.snr=fl(sn);
  if(num&&num===myNum){if(o.lat!=null){me.lat=o.lat;me.lon=o.lon;cosL=Math.cos(me.lat*Math.PI/180);if(map)map.setView([me.lat,me.lon])}}else if(num)upNode(num,o)}
 if(pk)onPacket(pd(pk));
 if(cc!=null)setSt('sincronizado · '+nodes.length+' nós');
 refresh();draw()}
function onPacket(a){var fr=gt(a,1),to=gt(a,2),ch=gt(a,3)||0,dc=gt(a,4),sn=gt(a,8),hl=gt(a,9),hs=gt(a,15);if(!dc)return;
 var d=pd(dc),port=gt(d,1),pl=gt(d,2)||new Uint8Array(0);
 if(port===5){var rq=gt(d,6),er=gt(pd(pl),3)||0;msgs.forEach(function(m){if(m.pid&&m.pid===rq)m.s=er?'err':'ok'});refresh();return}
 if(fr===myNum||!fr)return;
 var o={seen:Date.now()};if(sn!=null)o.snr=fl(sn);if(hs&&hl!=null)o.hops=Math.max(0,hs-hl);
 var n=upNode(fr,o);
 if(port===3){var q={};setPos(q,pd(pl));if(q.lat!=null){n.lat=q.lat;n.lon=q.lon}}
 else if(port===4){var nn=td.decode(gt(pd(pl),2)||new Uint8Array(0));if(nn)n.name=nn}
 else if(port===1)inText(n,to,ch,td.decode(pl));
 refresh();draw()}
function inText(n,to,ch,text){var c;
 if(to===BC){var g=groups.filter(function(x){return(x.ch||0)===ch})[0];if(!g){g={id:'g'+(++gid),name:'Canal '+ch,code:rnd(6,AL),ch:ch,members:[]};groups.push(g)}if(g.members.indexOf(n.id)<0)g.members.push(n.id);c=g.id}
 else if(to===myNum)c='d'+n.id;else return;
 var loc=null,x=text,mm=/^([📍🚩]) (-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\s*(.*)$/u.exec(text);
 if(mm){loc={lat:+mm[2],lon:+mm[3]};if(mm[1]==='🚩')loc.pt=1;x=mm[4];if(!loc.pt){n.lat=loc.lat;n.lon=loc.lon}}
 if(/^SOS/i.test(x)){n.st='sos';if(!loc&&n.lat!=null)loc={lat:n.lat,lon:n.lon}}else if(/precis[ao] de ajuda/i.test(x))n.st='help';else if(/^estou bem/i.test(x))n.st='ok';
 msgs.push({c:c,f:n.name,x:x,loc:loc,t:Date.now(),rd:cur===c?1:0})}
function sendRaw(b){var u=new Uint8Array(b);
 if(radio.kind==='usb'){var f=new Uint8Array(4+u.length);f[0]=0x94;f[1]=0xC3;f[2]=u.length>>8;f[3]=u.length&255;f.set(u,4);return radio.wr.write(f)}
 if(radio.kind==='ble')return radio.to.writeValue(u);
 return Promise.reject(new Error('sem rádio'))}
function goReal(){real=true;myNum=0;nodes=[];sel=null;groups.forEach(function(g){g.members=[]});
 if(map){Object.keys(nm).forEach(function(k){map.removeLayer(nm[k])});nm={};links.clearLayers()}
 $('mic').hidden=true;setSt('conectado, sincronizando…');refresh();draw()}
function drop(){real=false;radio={};$('mic').hidden=false;setSt('desconectado');refresh()}
function connectUsb(){if(!navigator.serial)return Promise.reject(new Error('USB serial indisponível neste navegador (use Chrome ou Edge no computador).'));
 return navigator.serial.requestPort().then(function(p){return p.open({baudRate:115200}).then(function(){
  radio={kind:'usb',port:p,wr:p.writable.getWriter()};goReal();
  var rd=p.readable.getReader(),buf=[];
  radio.wr.write(new Uint8Array(32).fill(0xC3)).then(function(){return sendRaw(pV(3,rid()))});
  (function loop(){rd.read().then(function(r){if(r.done){drop();return}
   for(var i=0;i<r.value.length;i++)buf.push(r.value[i]);
   while(buf.length>=4){var st=buf.indexOf(0x94);if(st<0){buf=[];break}if(st>0)buf.splice(0,st);if(buf.length<4)break;if(buf[1]!==0xC3){buf.shift();continue}var l=buf[2]*256+buf[3];if(l>512){buf.shift();continue}if(buf.length<4+l)break;onFrom(new Uint8Array(buf.slice(4,4+l)));buf.splice(0,4+l)}
   loop()}).catch(drop)})()})})}
function connectBle(){if(!navigator.bluetooth)return Promise.reject(new Error('Bluetooth indisponível. Use o Chrome.'));
 var S='6ba1b218-15a8-461f-9fa8-5dcae273eafd',dev;
 return navigator.bluetooth.requestDevice({filters:[{services:[S]}]}).then(function(d){dev=d;d.addEventListener('gattserverdisconnected',drop);return d.gatt.connect()})
 .then(function(g){return g.getPrimaryService(S)})
 .then(function(sv){return Promise.all([sv.getCharacteristic('f75c76d2-129e-4dad-a1dd-7866124401e7'),sv.getCharacteristic('2c55e69e-4993-11ed-b878-0242ac120002'),sv.getCharacteristic('ed9da18c-a800-4f66-a670-aa7547e34453')])})
 .then(function(c){radio={kind:'ble',dev:dev,to:c[0],from:c[1],num:c[2]};goReal();
  function drain(){return radio.from.readValue().then(function(v){var u=new Uint8Array(v.buffer,v.byteOffset,v.byteLength);if(u.length){onFrom(u);return drain()}})}
  var busy=false,again=false;function pump(){if(busy){again=true;return}busy=true;drain().catch(function(){}).then(function(){busy=false;if(again){again=false;pump()}})}
  radio.num.addEventListener('characteristicvaluechanged',pump);
  return radio.num.startNotifications().then(function(){return sendRaw(pV(3,rid()))}).then(pump)})}
// simulação da rede
var talk=['Cheguei em casa.','Estou indo para o ponto de encontro.','Bateria do rádio em 60%.','Temos água e comida para hoje.','Sinal fraco, falo daqui a pouco.','Alguém precisa de algo?'];
setInterval(function(){if(!real)nodes.forEach(function(n){if(n.lat==null||n.vx==null)return;n.lat+=n.vy/K;n.lon+=n.vx/(K*cosL);if(Math.random()<.1){n.vx=rr(4);n.vy=rr(4)}if(route(n)>=0)n.seen=Date.now()});
 prepHeat();var last=heatS[heatS.length-1];if(!last||dist(me,last)>70)heatS.push({lat:me.lat,lon:me.lon,q:loraQ(me.lat,me.lon),t:Date.now()});
 var ch=deliver();if(ch)save();upStats();draw();if(cur){setSub();if(ch)drawConv()}if(ch)drawList()},2000);
setInterval(function(){if(real||!nodes.length)return;var n=nodes[Math.floor(Math.random()*nodes.length)];if(route(n)<0)return;
 var gs=groups.filter(function(g){return g.members.indexOf(n.id)>=0}),c=gs.length&&Math.random()<.5?gs[Math.floor(Math.random()*gs.length)].id:'d'+n.id,
  r=Math.random(),x,loc=null,v=false;
 if(r<.04){x=AT.sos;n.st='sos';loc={lat:n.lat,lon:n.lon}}else if(r<.12){x=AT.help;n.st='help';loc={lat:n.lat,lon:n.lon}}
 else if(n.st!=='ok'&&r<.6){x='Já está tudo bem por aqui.';n.st='ok'}
 else{x=talk[Math.floor(Math.random()*talk.length)];if(Math.random()<.12)loc={lat:n.lat,lon:n.lon};else v=n.st==='ok'&&Math.random()<.12}
 msgs.push({c:c,f:n.name,x:v?'':loc&&!/SOS|ajuda/.test(x)?'':x,loc:loc,a:v?4:0,sim:v?1:0,t:Date.now(),rd:cur===c?1:0});save();refresh()},11000);
function meshScore(n){var neigh=n.neighbours||[],sn=[],i,avg=-10,s,c,o,q,u,days,age;
 for(i=0;i<neigh.length;i++)if(neigh[i]&&typeof neigh[i].snr==='number')sn.push(neigh[i].snr);
 if(sn.length){avg=0;for(i=0;i<sn.length;i++)avg+=sn[i];avg/=sn.length}
 s=Math.max(0,Math.min(1,(avg+16)/26));c=Math.min(1,neigh.length/5);o=Math.min(1,(n.num_online_local_nodes||0)/4);
 q=Math.max(0.12,Math.min(0.98,0.22+0.76*Math.max(s,c,o)));u=n.position_updated_at||n.updated_at;
 if(u){days=(Date.now()-Date.parse(u))/86400000;age=days<=10?1:days<=40?.7:days<=120?.42:.22;q=Math.max(0.06,Math.min(0.98,q*age))}
 return q}
function pullMesh(){fetch('https://mapa.meshbrasil.com/api/v1/nodes').then(function(r){return r.json()}).then(function(d){var out=[];(d.nodes||[]).forEach(function(n){var la=n.latitude,lo=n.longitude;if(la==null||lo==null)return;if(Math.abs(la)>90)la/=1e7;if(Math.abs(lo)>180)lo/=1e7;if(la<-35||la>6||lo<-75||lo>-30)return;out.push({lat:la,lon:lo,q:meshScore(n)})});if(out.length>20){mesh=out;drawHeat(true);draw()}}).catch(function(){})}
upRange();refresh();pullMesh();setTimeout(resize,50);
})();
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){})