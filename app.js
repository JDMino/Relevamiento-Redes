/* Relevamiento Redes de Datos - Poder Judicial Corrientes
 * Índice: 1) utilidades y motor (rutas, paquetes)  2) escenas A, L, B, C, D, E
 *         3) interfaz (pestañas, controles, panel)  4) interacción (arrastre, editor, tooltip)
 *         5) dibujo (íconos, enlaces, efectos)      6) bucle principal
 */
const $=q=>document.querySelector(q),mq=matchMedia('(min-width:1000px)'),cv=$('#cv'),cx=cv.getContext('2d');
let W=0,H=0,s,paused=false,acc=0;
const N=(id,x,y,l,o={})=>({id,x,y,l,up:true,...o}),L=(a,b,o={})=>({a,b,up:true,en:true,loss:0,...o});
const pick=a=>a[Math.floor(Math.random()*a.length)];
function size(){const r=cv.parentElement.getBoundingClientRect(),d=devicePixelRatio||1;W=r.width;H=mq.matches?Math.round(Math.max(480,Math.min(720,innerHeight-380))):Math.round(Math.min(560,Math.max(420,W*.85)));cv.width=W*d;cv.height=H*d;cv.style.height=H+'px';cx.setTransform(d,0,0,d,0,0)}
const lk=(a,b)=>s.links.find(l=>(l.a===a&&l.b===b)||(l.a===b&&l.b===a));
function route(a,b){const nd=s.nodes;if(!nd[a].up)return null;const d={[a]:0},pv={},q=new Set([a]),dn=new Set();
 while(q.size){let u=null;q.forEach(k=>{if(u===null||d[k]<d[u])u=k});q.delete(u);dn.add(u);if(u===b)break;
  for(const l of s.links){if(!l.en||!l.up)continue;const v=l.a===u?l.b:l.b===u?l.a:null;if(!v||dn.has(v)||!nd[v].up||nd[v].en===false)continue;const c=d[u]+(l.cost||1);if(d[v]===undefined||c<d[v]){d[v]=c;pv[v]=u;q.add(v)}}}
 if(d[b]===undefined)return null;const p=[b];while(p[0]!==a)p.unshift(pv[p[0]]);return p}
function launch(path,col,o={}){if(path)s.pk.push({path,i:0,t:0,col,d:undefined,...o})}
const fx=(x,y,k)=>{s.fx.push({x,y,k,t:0});if(k==='--bad'){s.sp=s.sp||[];for(let i=0;i<8;i++){const a=Math.random()*6.28,v=40+Math.random()*80;s.sp.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,l:1})}}};

/* ---------- Escenas ---------- */
const LOC=['Goya','Virasoro','Curuzú Cuatiá','Esquina','Paso de los Libres','Mercedes','Santo Tomé','Ituzaingó'];
function sceneA(){const nodes={cap:N('cap',.1,.5,'Data center',{r:20}),mp:N('mp',.47,.3,'MPLS Telecom',{kind:'cloud',lab:'in'}),tl:N('tl',.47,.72,'Telco (op. 2)',{kind:'cloud',lab:'in',en:false})},links=[L('cap','mp',{n:'troncal',cap:10}),L('cap','tl',{en:false,cost:2})];
 LOC.forEach((n,i)=>{const id='l'+i;nodes[id]=N(id,.9,.07+i*.86/7,n,{lab:'l',p:0});links.push(L('mp',id),L('tl',id,{en:false,cost:2}))});
 return{id:'A',click(n){if(/^l\d/.test(n.id)&&!s.v.cut){LOC_I=+n.id.slice(1);go('L',1)}else if(n.kind!=='cloud')n.up=!n.up},nodes,links,hint:'Toca una localidad para ver el detalle de sus edificios y enlaces. Cada localidad llega al data center por la MPLS. Toca un enlace para simular un corte de fibra o un nodo para simular un corte de luz. Activa el segundo operador y repite el corte.',
 v:{rate:4,spd:1},
 ctl:[{t:'range',id:'rate',l:'Paquetes por segundo',min:1,max:30,val:4},{t:'range',id:'spd',l:'Velocidad de propagación',min:.4,max:3,step:.1,val:1},{t:'range',l:'Capacidad de la troncal',min:3,max:25,val:10,on:v=>lk('cap','mp').cap=v},
  {t:'check',id:'cut',l:'Modo corte: tocar una localidad le corta la luz',val:false},{t:'check',l:'Segundo operador (proyecto 2027)',on:v=>{s.nodes.tl.en=v;s.links.forEach(l=>{if(l.a==='tl'||l.b==='tl')l.en=v})}},
  {t:'btn',l:'Cortar un enlace al azar',on:()=>{const c=s.links.filter(l=>l.en&&l.up);if(c.length)pick(c).up=false}}],
 spawn(){const o=Object.values(s.nodes).filter(n=>n.id[0]==='l'&&!n.off);if(o.length)launch(route(pick(o).id,'cap'),'--pk')},
 after(){for(let i=0;i<8;i++)s.nodes['l'+i].off=!route('l'+i,'cap')},
 status(){const o=LOC.filter((n,i)=>s.nodes['l'+i].off);return o.length?['Alarma: sin servicio en '+o.join(', '),1]:['Todas las localidades operativas',0]},
 stats(){const o=LOC.filter((n,i)=>s.nodes['l'+i].off).length;return[['Localidades online',8-o+' / 8']]}}}
function sceneB(){const nodes={fw:N('fw',.12,.5,'Cluster FortiGate',{r:20}),net:N('net',.9,.5,'Internet',{kind:'cloud',lab:'in'})},links=[];
 for(let i=0;i<4;i++){nodes['i'+i]=N('i'+i,.52,.14+i*.24,'Operador '+(i+1),{lab:'in',kind:'cloud'});links.push(L('fw','i'+i,{cap:6}),L('i'+i,'net'))}
 const ctl=[{t:'range',id:'rate',l:'Paquetes por segundo',min:1,max:40,val:6},{t:'range',id:'thr',l:'Umbral de pérdida para desviar',min:2,max:40,val:10,f:v=>v+' %'}];
 for(let i=0;i<4;i++)ctl.push({t:'range',id:'p'+i,l:'Pérdida en operador '+(i+1),min:0,max:60,val:0,f:v=>v+' %',on:v=>lk('fw','i'+i).loss=+v});
 ctl.push({t:'check',id:'zoom',l:'Política: Zoom sale por el operador 2',val:true},{t:'range',l:'Capacidad por operador',min:2,max:14,val:6,on:v=>{for(let i=0;i<4;i++)lk('fw','i'+i).cap=v}},{t:'check',id:'qos',l:'QoS: voz protegida bajo congestión',val:true});
 return{id:'B',nodes,links,hint:'Cuatro salidas a Internet gestionadas como un solo recurso. Sube la pérdida de un operador: al pasar el umbral, el tráfico se desvía solo.',v:{spd:1,thr:10,zoom:true,qos:true},ctl,
 spawn(){const ok=[0,1,2,3].filter(i=>s.nodes['i'+i].up&&lk('fw','i'+i).up),h=ok.filter(i=>lk('fw','i'+i).loss<=s.v.thr),use=h.length?h:ok;if(!use.length)return;
  const z=s.v.zoom&&Math.random()<.35,k=z&&use.includes(1)?1:pick(use);const vz=!z&&Math.random()<.25;launch(['fw','i'+k,'net'],vz?'--ok':z?'--ac':'--pk',{voz:vz})},
 after(){},
 status(){const d=[0,1,2,3].filter(i=>lk('fw','i'+i).loss>s.v.thr).map(i=>i+1);return d.length?['Desviado: operador '+d.join(', ')+' sobre el umbral',1]:['Las 4 salidas dentro del umbral',0]},
 stats(){return[['Uso por operador',[0,1,2,3].map(i=>Math.round((lk('fw','i'+i).u||0)*100)+'%').join(' · ')],['Verde / azul / naranja','voz / Zoom / datos']]}}}
function sceneC(){const nodes={ca:N('ca',.5,.1,'Red de calle',{kind:'cloud',lab:'in'}),c1:N('c1',.28,.4,'Core 1',{r:16,tg:1}),c2:N('c2',.72,.4,'Core 2',{r:16,tg:1}),a1:N('a1',.16,.8,'Acceso 1 · 24 puestos',{r:13,p:24}),a2:N('a2',.5,.8,'Acceso 2 · 24 puestos',{r:13,p:24}),a3:N('a3',.84,.8,'Acceso 3 · 24 puestos',{r:13,p:24})},
 links=[L('ca','c1',{n:'fibra A',cap:9}),L('ca','c2',{n:'fibra B',cap:9}),L('c1','c2',{n:'stack'})];['a1','a2','a3'].forEach(a=>links.push(L(a,'c1'),L(a,'c2')));
 return{id:'C',nodes,links,hint:'Centro de cableado tipo: dos fibras por caminos distintos, core apilado y switches de acceso conectados a ambos. Corta la fibra A, luego el Core 1 y compara con un switch de acceso.',v:{rate:5,spd:1},
 ctl:[{t:'range',id:'rate',l:'Paquetes por segundo',min:1,max:30,val:5},{t:'range',id:'spd',l:'Velocidad',min:.4,max:3,step:.1,val:1},{t:'btn',l:'Cortar un componente al azar',on:()=>{const c=[...Object.values(s.nodes).filter(n=>n.tg||n.p),...s.links.filter(l=>l.n==='fibra A'||l.n==='fibra B')];const e=pick(c);e.up=false}}],
 spawn(){const o=['a1','a2','a3'].filter(a=>!s.nodes[a].off);if(o.length)launch(route(pick(o),'ca'),'--pk')},
 after(){['a1','a2','a3'].forEach(a=>s.nodes[a].off=!route(a,'ca'))},
 status(){const o=['a1','a2','a3'].filter(a=>s.nodes[a].off).length;return o===0?['Edificio con servicio completo',0]:o===3?['Edificio aislado: sin conectividad',1]:['Puestos afectados: '+o*24,1]},
 stats(){const p=['a1','a2','a3'].reduce((t,a)=>t+(s.nodes[a].off?0:24),0);return[['Puestos con servicio',p+' / 72']]}}}
const ZN=[['usr','Usuarios'],['wifi','Wi-Fi'],['adm','Administración'],['pre','Preproducción'],['lab','Laboratorio'],['pri','Servidores privados'],['dmz','Servidores públicos'],['net','Internet']];
function sceneD(){const nodes={fw:N('fw',.5,.5,'Firewall',{r:24,lab:'in',nt:1})},links=[];
 ZN.forEach(([id,n],i)=>{const a=i/8*Math.PI*2-Math.PI/2;nodes[id]=N(id,.5+.37*Math.cos(a),.5+.38*Math.sin(a),n,{r:12,z:1});links.push(L('fw',id))});
 const rule=(a,b)=>{const v=s.v;
  if(a==='usr')return!v.ad?[0,'Equipo fuera del dominio o usuario inválido: sin política que lo habilite']:['pri','dmz','net'].includes(b)?[1,'Equipo en Active Directory con usuario válido']:[0,'Sin regla que permita ese destino'];
  if(a==='wifi')return b==='pri'?(v.vpn?[1,'VPN activa: acceso a recursos internos']:[0,'La red Wi-Fi no accede a servidores privados sin VPN']):b==='dmz'?[0,'La red Wi-Fi no accede a servidores públicos']:b==='net'?[1,'Salida a Internet (supuesto de la simulación)']:[0,'Sin regla que permita ese destino'];
  if(a==='net')return b==='dmz'?[1,'Servicio publicado en la DMZ']:[0,'Desde Internet solo se alcanza la DMZ'];
  if(a==='adm')return['pri','dmz','pre','lab'].includes(b)?[1,'Administración accede a consolas de infraestructura']:[0,'Sin regla que permita ese destino'];
  if(a==='pre'||a==='lab')return[0,(a==='pre'?'Preproducción':'Laboratorio')+' no accede a producción'];
  return[0,'Los servidores no tienen reglas de salida descritas']};
 const send=(a,b)=>{const[ok,why]=rule(a,b);s.msg=[(ok?'Permitido: ':'Bloqueado: ')+nodes[a].l+' → '+nodes[b].l+'. '+why,!ok];for(let k=0;k<3;k++)setTimeout(()=>launch(ok?[a,'fw',b]:[a,'fw'],ok?'--ok':'--bad',{blocked:!ok}),k*220)};
 return{id:'D',nodes,links,hint:'Toca una zona de origen y luego una de destino: el firewall central decide con las reglas de la Tabla 3. Prueba el Wi-Fi hacia los servidores privados con y sin VPN.',v:{rate:1,spd:1,ad:true,vpn:false,auto:false},msg:['Elige una zona de origen',0],
 ctl:[{t:'check',id:'ad',l:'Equipo en Active Directory con usuario válido',val:true},{t:'check',id:'vpn',l:'VPN activa en el Wi-Fi'},{t:'check',id:'auto',l:'Tráfico aleatorio entre zonas'},{t:'range',id:'rate',l:'Tráfico aleatorio por segundo',min:.5,max:6,step:.5,val:1}],
 spawn(){if(!s.v.auto)return;const a=pick(ZN.map(z=>z[0])),b=pick(ZN.map(z=>z[0]).filter(x=>x!==a));send(a,b)},
 click(n){if(!n.z)return;if(!s.sel){s.sel=n.id;s.msg=['Origen: '+n.l+'. Ahora elige el destino',0]}else if(s.sel===n.id){s.sel=null;s.msg=['Elige una zona de origen',0]}else{send(s.sel,n.id);s.sel=null}},
 after(){},status(){return s.msg},stats(){return[['Tráfico permitido',s.done],['Tráfico bloqueado',s.lost]]}}}
function sceneE(){const nodes={sol:N('sol',.1,.1,'Paneles',{r:14,nofail:1}),red:N('red',.1,.37,'Red eléctrica',{r:14}),g1:N('g1',.1,.63,'Grupo 1',{r:14}),g2:N('g2',.1,.9,'Grupo 2',{r:14}),tr:N('tr',.4,.5,'Tablero',{r:13,nofail:1}),u1:N('u1',.64,.3,'UPS 1',{r:14}),u2:N('u2',.64,.7,'UPS 2',{r:14}),dc:N('dc',.9,.5,'Racks',{r:22,nofail:1}),a1:N('a1',.9,.1,'Aire 1',{r:13}),a2:N('a2',.9,.9,'Aire 2',{r:13})},
 links=[['sol','tr'],['red','tr'],['g1','tr'],['g2','tr'],['tr','u1'],['tr','u2'],['u1','dc'],['u2','dc'],['a1','dc'],['a2','dc']].map(x=>L(...x));
 return{id:'E',nodes,links,bat:100,T:22,out:0,sun:0,sup:1,gen:null,hint:'Energía y climatización del data center: los paneles aportan según la hora, la red cubre la diferencia, el UPS sostiene el corte y el grupo arranca a los pocos segundos. Si ambos aires fallan, la sala se calienta.',v:{rate:6,spd:1,hour:12,load:60},
 ctl:[{t:'range',id:'rate',l:'Flujo de partículas',min:1,max:15,val:6},{t:'range',id:'hour',l:'Hora del día',min:0,max:24,val:12,f:v=>v+' h'},{t:'range',id:'load',l:'Carga de la sala',min:10,max:100,val:60,f:v=>v+' %'}],
 tick(dt){const v=s.v,n=s.nodes,sun=Math.max(0,Math.sin((v.hour-6)/12*Math.PI));s.sun=sun;n.sol.l='Paneles '+Math.round(sun*80)+' %';
  s.out=n.red.up?0:s.out+dt;s.gen=!n.red.up&&s.out>5?(n.g1.up?'g1':n.g2.up?'g2':null):null;s.sup=n.red.up||s.gen?1:sun*.8;
  s.bat=Math.max(0,Math.min(100,s.bat+(s.sup>=1?3*dt:-(1-s.sup)*v.load/100*5*dt)));
  s.cool=s.sup>=1?(n.a1.up?1:0)+(n.a2.up?1:0):0;s.T=Math.max(22,Math.min(60,s.T+(v.load/100*1.2-s.cool*.7)*dt));
  n.dc.up=(s.sup>=1||s.bat>0)&&s.T<35&&(n.u1.up||n.u2.up)},
 spawn(){const n=s.nodes,w=[['sol',s.sun*.8,'--warn'],['red',n.red.up?1-s.sun*.8:0,'--pk'],['g1',s.gen==='g1'?1:0,'--ok'],['g2',s.gen==='g2'?1:0,'--ok']],t=w.reduce((a,x)=>a+x[1],0);
  if(t>0){let r=Math.random()*t;const k=w.find(x=>(r-=x[1])<=0)||w[0];launch(route(k[0],'dc'),k[2])}else if(s.bat>0){const u=['u1','u2'].filter(x=>n[x].up);if(u.length)launch([pick(u),'dc'],'--bad')}
  const a=['a1','a2'].filter(x=>n[x].up);if(s.cool&&a.length&&Math.random()<.6)launch([pick(a),'dc'],'--ac')},
 after(){},status(){const n=s.nodes;return!n.dc.up?['Racks sin servicio: '+(s.T>=35?'apagado térmico':'sin energía'),1]:n.red.up?['Red eléctrica normal',0]:s.gen?['Grupo '+s.gen.slice(1)+' en carga',0]:s.out<=5?['Corte de red: el UPS sostiene, grupo arrancando',1]:['Sin grupos: solo UPS y paneles',1]},
 stats(){return[['Batería UPS',Math.round(s.bat)+' %'],['Temperatura sala',s.T.toFixed(1)+' °C']]}}}
const SCN={A:[['tormenta en el interior',()=>s.links.filter(l=>l.a==='mp'&&l.b[0]==='l').sort(()=>Math.random()-.5).slice(0,3).forEach(l=>l.up=false)],['robo de cable en la troncal',()=>lk('cap','mp').up=false],['falla total del operador 1',()=>s.nodes.mp.up=false]],
 B:[['caen operadores 1 y 2',()=>{s.nodes.i0.up=s.nodes.i1.up=false}],['solo queda el operador 4',()=>{s.nodes.i0.up=s.nodes.i1.up=s.nodes.i2.up=false}]],
 C:[['corte de fibra A y falla del Core 2',()=>{lk('ca','c1').up=false;s.nodes.c2.up=false}],['falla de un acceso',()=>s.nodes.a2.up=false]],
 E:[['apagón de la red',()=>s.nodes.red.up=false],['apagón y falla del grupo 1',()=>{s.nodes.red.up=false;s.nodes.g1.up=false}],['apagón sin grupos',()=>{s.nodes.red.up=s.nodes.g1.up=s.nodes.g2.up=false}],['falla de ambos aires',()=>s.nodes.a1.up=s.nodes.a2.up=false]]};
function sceneV(){const FY=f=>.9-f*.14,nodes={fw:N('fw',.62,.035,'Data center',{r:14}),mp:N('mp',.62,.17,'MPLS Telecom',{kind:'cloud',lab:'in'}),k1:N('k1',.26,.35,'Core 1',{r:12}),k2:N('k2',.4,.35,'Core 2',{r:12}),sm:N('sm',.72,.84,'Switch',{r:12})},
 links=[L('fw','mp',{n:'WAN',cap:12}),L('mp','k1',{tr:1,cap:8}),L('mp','k2',{tr:1,cap:8}),L('k1','k2',{n:'stack'}),L('k1','p3',{tr:1,cap:8}),L('k2','p3',{tr:1,cap:8}),L('mp','sm',{tr:1,cap:5})],HS=[];
 for(let f=0;f<4;f++){nodes['p'+f]=N('p'+f,.51,FY(f),'',{r:11});if(f)links.push(L('p'+(f-1),'p'+f,{tr:1,wall:1,cap:8}))}
 [[0,.14,90],[0,.32,70],[1,.23,100],[2,.14,85],[2,.32,75],[3,.23,80]].forEach(([f,x,u],j)=>{const id='h'+j;nodes[id]=N(id,x,FY(f),'',{r:9,pc:1,u});HS.push({id,big:1,f,j});links.push(L(id,'p'+f,{cap:5}))});
 [[.78,10],[.86,8],[.93,7]].forEach(([x,u],j)=>{const id='s'+j;nodes[id]=N(id,x,.9,'',{r:9,pc:1,u});HS.push({id,big:0});links.push(L(id,'sm',{cap:5}))});
 const note=(t,b,d)=>{s.note=[t,b,s.time+d]},H=id=>nodes[id];
 return{id:'V',nodes,links,v:{rate:4,spd:1,jz:false},
 hint:'A la izquierda, el edificio grande (San Juan y 9 de Julio, ~500 personas): cada piso con el borde de su VLAN, o cada juzgado con la suya. Los paquetes suben y bajan por el montante de la pared y salen a Internet por el techo. A la derecha, el edificio de un solo piso con una única VLAN. Aro blanco = etiqueta 802.1Q en los trunks. Toca un grupo de equipos para filtrar su VLAN. IDs y subredes ilustrativos: el informe no los informa.',
 zones(){const jz=s.v.jz,g=a=>col(a),top=f=>FY(f)-.07;cx.save();cx.font='bold 10px "JetBrains Mono",ui-monospace,monospace';cx.textAlign='left';cx.textBaseline='middle';
  const R=(x,y,w,h,c,lw,d)=>{cx.beginPath();cx.roundRect(x*W,y*H,w*W,h*H,6);cx.strokeStyle=c;cx.lineWidth=lw;cx.setLineDash(d||[]);cx.stroke();cx.setLineDash([])};
  R(.02,.26,.54,.71,g('--mut'),2);cx.fillStyle=g('--mut');cx.fillText('EDIFICIO GRANDE · ~500 PERSONAS',.04*W,.26*H+11);
  cx.globalAlpha=.25;cx.fillStyle=g('--ln');cx.fillRect(.485*W,.41*H,.05*W,.56*H);cx.globalAlpha=1;
  for(let f=0;f<4;f++){const c=jz?g('--ln'):g('--v'+(f+1));R(.03,top(f),.52,.135,c,jz?1.5:3,jz?[4,4]:null);cx.fillStyle=jz?g('--mut'):c;cx.fillText('PISO '+(f+1)+(jz?'':' · VLAN '+(11+f)),.045*W,top(f)*H+10)}
  if(jz)HS.forEach(h=>{if(h.big){const n=nodes[h.id];R(n.x-.075,top(h.f)+.03,.15,.1,g(n.vc||'--ac'),2.5)}});
  cx.strokeStyle=g('--v7');cx.lineWidth=2.5;cx.beginPath();cx.moveTo(.67*W,.77*H);cx.lineTo(.83*W,.69*H);cx.lineTo(.99*W,.77*H);cx.stroke();R(.68,.76,.3,.21,g('--v7'),3);cx.fillStyle=g('--v7');cx.fillText('PEQUEÑO · VLAN 5',.7*W,.76*H+12);cx.restore()},
 ctl:[{t:'range',id:'rate',l:'Paquetes por segundo',min:1,max:30,val:4},{t:'check',id:'jz',l:'Edificio grande: una VLAN por juzgado (en vez de por piso)'},
  {t:'btn',l:'Enviar tráfico entre VLAN',on:()=>{const b=HS.filter(h=>h.big),a=pick(b),c=pick(b.filter(h=>H(h.id).vid!==H(a.id).vid)),A=H(a.id),k=H('k1').up?'k1':'k2',pa=route(a.id,k),pc=route(c.id,k),sc=s;if(!pa||!pc)return;const p=[...pa,...pc.reverse().slice(1)];for(let i=0;i<4;i++)setTimeout(()=>{if(s===sc)launch([...p],A.vc)},i*260);note('VLAN '+A.vid+' → VLAN '+H(c.id).vid+': el tráfico sube hasta el core, que lo enruta, y vuelve a bajar',0,7)}},
  {t:'btn',l:'Broadcast en una VLAN',on:()=>{const a=pick(HS),A=H(a.id),m=HS.filter(h=>H(h.id).vid===A.vid&&h.id!==a.id);m.forEach(h=>launch(route(a.id,h.id),A.vc));A.act=1;s.dom=(m.length+1)+' de '+HS.length;note('Broadcast en la VLAN '+A.vid+': solo llega a '+(m.length+1)+' de '+HS.length+' grupos de equipos',0,7)}},
  {t:'btn',l:'Conectar equipo ajeno a un puerto libre',on:()=>{if(nodes.x)return;const ac=pick(['p0','p1','p2','p3','sm']),A=nodes[ac],sc=s,go=(d,f)=>setTimeout(()=>{if(s===sc&&nodes.x)f()},d);nodes.x=N('x',ac==='sm'?.9:.42,ac==='sm'?.8:A.y,'Ajeno',{r:9,pc:1,vc:'--warn',nofail:1});links.push(L(ac,'x',{cap:4,vc:'--warn'}));
   note('Equipo ajeno en un puerto libre: pide IP por DHCP',1,8);go(0,()=>launch(route('x','fw'),'--warn'));
   go(1800,()=>{const p=route('x','fw');if(p)launch([...p].reverse(),'--warn');note('Recibe IP por DHCP, pero no está autenticado en el dominio',1,6)});
   go(3600,()=>{launch(route('x','fw'),'--bad',{blocked:true});note('Su tráfico hacia los servicios es bloqueado por el firewall',1,6)});
   go(7500,()=>{delete nodes.x;for(let i=links.length-1;i>=0;i--)if(links[i].a==='x'||links[i].b==='x')links.splice(i,1)})}}],
 click(n){if(n.pc&&n.vid){s.hl=s.hl===n.vid?null:n.vid;note(s.hl?'Mostrando solo el tráfico de la VLAN '+n.vid:'Mostrando todas las VLAN',0,3)}else if(n.kind!=='cloud')n.up=!n.up},
 tick(){const jz=s.v.jz;HS.forEach(h=>{const n=nodes[h.id];n.vid=h.big?(jz?21+h.j:11+h.f):5;n.vc='--v'+((h.big?(jz?h.j:h.f):6)+1);n.l='V'+n.vid;lk(h.id,h.big?'p'+h.f:'sm').vc=n.vc;if(s.hl===n.vid)n.act=Math.max(n.act||0,.8)})},
 spawn(){const o=HS.map(h=>nodes[h.id]).filter(n=>!n.off&&(!s.hl||n.vid===s.hl));if(o.length){const n=pick(o);launch(route(n.id,'fw'),n.vc)}},
 after(){HS.forEach(h=>nodes[h.id].off=!route(h.id,'fw'))},
 status(){if(s.note&&s.time<s.note[2])return[s.note[0],s.note[1]];const o=HS.filter(h=>nodes[h.id].off).length;return o?['Alarma: '+o+' grupo(s) de equipos sin salida',1]:['Todas las VLAN con salida hacia el data center',0]},
 stats(){return[['Edificio grande',s.v.jz?'6 VLAN (juzgado)':'4 VLAN (piso)'],['Edificio de un piso','1 VLAN'],['Último broadcast',s.dom||'—']]},
 tip(n){if(n.pc&&n.vid)return'<br>VLAN '+n.vid+' · '+(n.id[0]==='h'?(s.v.jz?'10.2.'+(n.vid-20):'10.1.'+(n.vid-10)):'10.9.0')+'.0/24 (ilustrativo)<br>~'+n.u+' usuarios'+(n.off?' · sin salida':'')+'<br>Filtrar: toca el grupo';if(n.id==='x')return'<br>Sin política en el firewall: no accede a servicios';if(n.id[0]==='p')return'<br>Switch del piso · montante por la pared hacia el core del techo';if(n.id[0]==='k')return'<br>Core en el techo: enruta entre VLAN';if(n.id==='sm')return'<br>Switch del edificio de un piso: una sola VLAN';return''}}}
SCN.V=[['falla del Core 1',()=>s.nodes.k1.up=false],['corte de una fibra del edificio grande',()=>lk('mp','k2').up=false]];
let SG_I=0;
const SUG=[
{t:'Sitio alterno',pr:'Alta',ef:'Alto',al:'Alarma: sin servicio en toda la provincia',ok:'Servicio operativo',
 h:'Hallazgo: servicios, datos y respaldos están en un único edificio. Riesgo: si cae el data center de la capital, se paraliza la provincia. Propuesta: réplica de servidores y storage críticos en un sitio alterno, con RTO y RPO definidos. Activa la propuesta y provoca la falla.',
 n:[['us',.1,.5,'Provincia',{kind:'cloud',lab:'in'}],['d1',.58,.25,'Data center capital',{r:18,k:'rack'}],['d2',.58,.75,'Sitio alterno',{r:18,k:'rack'}]],
 l:[['us','d1',{n:'WAN',cap:12}],['us','d2',{pp:1,cost:2}],['d1','d2',{pp:1,n:'replicación'}]],p:['d2'],pl:[],src:['us'],dst:['d1','d2'],
 c:[{t:'range',id:'rep',l:'Frecuencia de replicación',min:1,max:10,val:5}],
 ev:[['Falla del data center principal',N=>N.d1.up=false],['Restaurar el data center',N=>N.d1.up=true]],
 ex(s,N){if(s.prop&&N.d1.up&&Math.random()<s.v.rep/8)launch(['d1','d2'],'--v2')},
 sx:(s,N)=>[['RPO estimado',s.prop?'~'+Math.round(60/s.v.rep)+' min':'sin réplica'],['Sirve',N.d1.up?'capital':s.prop?'sitio alterno':'nadie']]},
{t:'Firewalls',pr:'Alta',ef:'Medio',al:'Corte: sin firewall activo, usuarios sin servicio',ok:'Servicio operativo',
 h:'Hallazgo: los FortiGate del cluster central pierden soporte el año próximo. Riesgo: errores al migrar políticas. Propuesta: cluster nuevo en paralelo, cambio nocturno y plan de vuelta atrás. Con la propuesta, ejecuta el cambio y luego provoca un error en las políticas.',
 n:[['us',.1,.5,'Usuarios',{kind:'cloud',lab:'in'}],['fo',.45,.25,'FortiGate actual',{r:16,k:'fw'}],['fn',.45,.76,'FortiGate nuevo',{r:16,k:'fw'}],['sv',.88,.5,'Servicios',{r:18,k:'rack'}]],
 l:[['us','fo'],['fo','sv'],['us','fn',{pp:1,cost:3}],['fn','sv',{pp:1,cost:3}]],p:['fn'],src:['us'],dst:['sv'],
 ev:[['Ejecutar el cambio (noche)',(N,s)=>{if(s.prop){lk('us','fn').cost=lk('fn','sv').cost=.4}else{N.fo.up=false;setTimeout(()=>N.fo.up=true,7000)}}],['Error en las políticas nuevas',N=>{N.fn.up=false;setTimeout(()=>N.fn.up=true,7000)}],['Volver al estado inicial',()=>{lk('us','fn').cost=lk('fn','sv').cost=3}]],
 sx:(s,N)=>[['Cluster activo',!N.fo.up&&!N.fn.up?'ninguno':s.prop&&N.fn.up&&lk('us','fn').cost<1?'nuevo':'actual']]},
{t:'Operadores',pr:'Alta',ef:'Alto',al:'Alarma: localidades sin servicio',ok:'Todas las localidades con servicio',
 h:'Hallazgo: cada localidad depende de un único operador. Riesgo: caída de postes o robo de cables dejan sin servicio a la justicia local. Propuesta: segundo proveedor y SD-WAN para el failover. Provoca un corte con y sin la propuesta.',
 n:[['dc',.08,.5,'Data center',{r:18,k:'rack'}],['m1',.42,.28,'Operador 1',{kind:'cloud',lab:'in'}],['m2',.42,.74,'Operador 2',{kind:'cloud',lab:'in'}],['l0',.9,.2,'Goya',{lab:'l',k:'bld'}],['l1',.9,.5,'Curuzú Cuatiá',{lab:'l',k:'bld'}],['l2',.9,.8,'Esquina',{lab:'l',k:'bld'}]],
 l:[['dc','m1',{n:'troncal',cap:10}],['m1','l0'],['m1','l1'],['m1','l2'],['dc','m2',{pp:1,cost:2}],['m2','l0',{pp:1,cost:2}],['m2','l1',{pp:1,cost:2}],['m2','l2',{pp:1,cost:2}]],p:['m2'],src:['l0','l1','l2'],dst:['dc'],
 ev:[['Caída de postes en Goya',()=>lk('m1','l0').up=false],['Robo de cable en la troncal',()=>lk('dc','m1').up=false],['Reparar todo',N=>links3(N)]],
 sx:(s,N)=>[['Localidades con servicio',3-['l0','l1','l2'].filter(i=>N[i].off).length+' / 3']]},
{t:'Switches',pr:'Media',ef:'Medio',al:'Alarma: switch caído',ok:'Todos los switches operativos',
 h:'Hallazgo: conviven equipos 3Com/HP antiguos con la serie actual, sin plan de recambio. Riesgo: una falla sin repuesto obliga a reemplazos urgentes. Propuesta: inventario con modelo y antigüedad y recambio por oportunidad. Observa las fallas con y sin la propuesta.',
 n:[['dc',.5,.07,'Data center',{r:14,k:'rack'}],['cr',.5,.3,'Core',{r:14,k:'sw'}],['w0',.14,.62,'',{k:'sw'}],['w1',.38,.62,'',{k:'sw'}],['w2',.62,.62,'',{k:'sw'}],['w3',.86,.62,'',{k:'sw'}],['sp',.5,.9,'Repuesto',{k:'sw'}]],
 l:[['dc','cr'],['cr','w0'],['cr','w1'],['cr','w2'],['cr','w3']],p:['sp'],src:['w0','w1','w2','w3'],dst:['dc'],
 tick(s,N,dt){const W4=['w0','w1','w2','w3'].map(i=>N[i]);if(W4[0].age==null)[.9,.7,.5,.1].forEach((a,i)=>W4[i].age=a);
  W4.forEach(n=>{if(n.up){if(Math.random()<dt*n.age*.1*(s.prop?.3:1)){n.up=false;n.rt=s.time+(s.prop?2:9);s.fails=(s.fails||0)+1}}else if(s.time>=n.rt)n.up=true;n.l=n.age>.8?'3Com 2008':n.age>.6?'HP 2012':n.age>.4?'HP 2016':'Serie actual'});
  if(s.prop&&s.time>(s.nx||6)){s.nx=s.time+6;const o=[...W4].sort((a,b)=>b.age-a.age)[0];if(o.age>.2)o.age=.1}},
 ev:[['Falla del equipo más antiguo',(N,s)=>{const o=['w0','w1','w2','w3'].map(i=>N[i]).sort((a,b)=>b.age-a.age)[0];o.up=false;o.rt=s.time+(s.prop?2:9);s.fails=(s.fails||0)+1}]],
 sx:s=>[['Fallas acumuladas',s.fails||0],['Recuperación',s.prop?'~2 s (hay repuesto)':'~9 s (sin repuesto)']]},
{t:'Wi-Fi',pr:'Media',ef:'Medio',al:'Alarma: servicio caído',ok:'Wi-Fi operativo',
 h:'Hallazgo: algunos puntos del interior no integran la red administrada por FortiGate. Riesgo: políticas desiguales y equipos sin soporte. Propuesta: sustituirlos por FortiAP. Activa la propuesta y avanza el slider de edificios migrados: el tráfico verde pasa por el firewall; el rojo sale sin política.',
 n:[['fw',.5,.2,'FortiGate',{r:16,k:'fw'}],['net',.88,.2,'Internet',{kind:'cloud',lab:'in'}],...[0,1,2,3,4,5].map(i=>['a'+i,.09+i*.164,.74,'',{k:'rtr',r:11}])],
 l:[['fw','net'],...[0,1,2,3,4,5].flatMap(i=>[['a'+i,'fw'],['a'+i,'net']])],p:[],src:['a0','a1','a2','a3','a4','a5'],dst:['net'],
 c:[{t:'range',id:'mig',l:'Edificios migrados a FortiAP',min:0,max:6,val:3}],ev:[],
 tick(s,N){[0,1,2,3,4,5].forEach(i=>{const m=!!s.prop&&i<s.v.mig,a='a'+i;lk(a,'fw').en=m;lk(a,'net').en=!m;lk(a,'fw').vc='--ok';lk(a,'net').vc='--bad';N[a].l=m?'FortiAP':'AP viejo'})},
 col:p=>p.length>2?'--ok':'--bad',
 sx:(s,N)=>[['Puntos bajo política',[0,1,2,3,4,5].filter(i=>s.prop&&i<s.v.mig).length+' / 6']]},
{t:'Conocimiento',pr:'Media',ef:'Bajo',al:'Alarma: incidentes sin responsable disponible',ok:'Incidentes atendidos',ob:'hub',why:'incidente sin atender: no hay administrador disponible',
 h:'Hallazgo: dos personas administran switches y firewalls de unos 90 edificios. Riesgo: una ausencia prolongada afecta la gestión diaria. Propuesta: manuales, rotación de tareas y capacitación cruzada. Provoca ausencias con y sin la propuesta y mira los incidentes sin atender.',
 n:[...[0,1,2,3,4,5,6,7].map(i=>['b'+i,.08,.08+i*.12,'',{k:'bld',r:9}]),['hub',.36,.5,'Mesa de ayuda',{r:14,k:'sw'}],['ad1',.68,.25,'Admin 1',{r:12,k:'pc',vc:'--v2'}],['ad2',.68,.5,'Admin 2',{r:12,k:'pc',vc:'--v2'}],['re',.68,.8,'Reemplazo',{r:12,k:'pc',vc:'--v5'}]],
 l:[...[0,1,2,3,4,5,6,7].map(i=>['b'+i,'hub']),['hub','ad1'],['hub','ad2'],['hub','re',{pp:1}]],p:['re'],src:[0,1,2,3,4,5,6,7].map(i=>'b'+i),dst:['ad1','ad2','re'],
 ev:[['Ausencia de un administrador',N=>N.ad1.up=false],['Ausencia de los dos',N=>{N.ad1.up=false;N.ad2.up=false}],['Todos presentes',N=>{N.ad1.up=true;N.ad2.up=true}]],
 sx:(s,N)=>[['Incidentes sin atender',s.lost],['Responsables activos',['ad1','ad2','re'].filter(i=>N[i].up&&N[i].en!==false).length]]},
{t:'Energía interior',pr:'Media',ef:'Medio',
 h:'Hallazgo: en el interior un corte de luz tira los dos enlaces del edificio y no se informaron UPS. Riesgo: sin energía el edificio queda aislado aunque fibra y switches estén bien. Propuesta: UPS en el centro de cableado y en el router, con autonomía definida y alerta por SNMP en NagVis.',
 n:[['rd',.1,.5,'Red eléctrica',{r:14,k:'pole'}],['u',.31,.5,'UPS',{r:14,k:'ups'}],['cc',.54,.5,'Cableado',{r:14,k:'sw'}],['rt',.6,.22,'Router ISP',{r:13,k:'rtr'}],['mp',.88,.22,'MPLS',{kind:'cloud',lab:'in'}],['us',.54,.84,'Puestos',{r:12,k:'pc',vc:'--v1'}]],
 l:[['us','cc'],['cc','rt'],['rt','mp'],['rd','cc',{n:'energía',vc:'--warn'}],['rd','u',{pp:1,vc:'--warn'}],['u','cc',{pp:1,vc:'--warn'}]],p:['u'],src:['us'],dst:['mp'],
 c:[{t:'range',id:'aut',l:'Autonomía del UPS (s)',min:10,max:120,val:40}],
 tick(s,N,dt){if(s.bat==null)s.bat=100;N.cc.up=N.rt.up=N.rd.up||(!!s.prop&&s.bat>0);s.bat=!N.rd.up&&s.prop?Math.max(0,s.bat-dt*100/s.v.aut):Math.min(100,s.bat+dt*10)},
 st:(s,N)=>!N.rd.up?(s.prop?(s.bat>0?['Corte de luz: el UPS sostiene · batería '+Math.round(s.bat)+' %'+(s.bat<30?' · alerta SNMP en NagVis':''),s.bat<30]:['UPS agotado: edificio sin servicio',1]):['Corte de luz: sin UPS, el edificio queda sin servicio',1]):['Energía normal',0],
 ev:[['Corte de luz local',N=>N.rd.up=false],['Restablecer la luz',N=>N.rd.up=true]],
 sx:s=>[['Batería UPS',s.prop?Math.round(s.bat)+' %':'sin UPS']]},
{t:'Wi-Fi invitados',pr:'Baja',ef:'Bajo',al:'',ok:'Red institucional protegida',
 h:'Hallazgo: la Wi-Fi actual es solo institucional y habrá visitantes. Riesgo: cada autorización ad hoc amplía la superficie de ataque. Propuesta: SSID de invitados aislada, con portal cautivo, salida solo a Internet y límite de ancho de banda. Los paquetes rojos que llegan a servidores son accesos indebidos.',
 n:[['st',.1,.28,'Personal',{r:11,k:'pc',vc:'--v1'}],['vi',.1,.74,'Visitante',{r:11,k:'pc',vc:'--v2'}],['ap',.34,.5,'FortiAP',{r:14,k:'rtr'}],['pt',.5,.82,'Portal cautivo',{r:12,k:'sw'}],['fw',.62,.5,'FortiGate',{r:16,k:'fw'}],['sv',.9,.24,'Servidores',{r:16,k:'rack'}],['net',.9,.76,'Internet',{kind:'cloud',lab:'in'}]],
 l:[['st','ap'],['vi','ap'],['ap','fw',{n:'SSID institucional'}],['ap','pt',{pp:1,n:'SSID invitados'}],['pt','fw',{pp:1,cap:6}],['fw','sv'],['fw','net']],p:['pt'],src:[],dst:[],
 c:[{t:'range',id:'lim',l:'Límite de ancho de banda invitados',min:2,max:12,val:6,on:v=>lk('pt','fw').cap=v}],
 ev:[['Ráfaga de invitados',(N,s)=>{for(let i=0;i<14;i++)setTimeout(()=>launch(s.prop?['vi','ap','pt','fw','net']:['vi','ap','fw','net'],'--v2'),i*90)}]],
 sp(s,N,go){if(Math.random()>.55)return go(['st','ap','fw','sv'],'--ok');const sv=Math.random()<.5;if(s.prop)sv?go(['vi','ap','pt','fw'],'--bad',{blocked:1,why:'bloqueado: la red de invitados solo sale a Internet'}):go(['vi','ap','pt','fw','net'],'--v2');else go(sv?['vi','ap','fw','sv']:['vi','ap','fw','net'],sv?'--bad':'--v2')},
 sx:s=>[['Invitados → servidores',s.prop?'bloqueados':'permitidos (riesgo)']]}];
function links3(N){lk('m1','l0').up=lk('dc','m1').up=true}
function sceneSug(){const d=SUG[SG_I],nodes={},links=[];
 d.n.forEach(([id,x,y,l,o])=>nodes[id]=N(id,x,y,l,{r:12,...o}));d.l.forEach(([a,b,o])=>links.push(L(a,b,o)));
 (d.p||[]).forEach(id=>nodes[id].en=false);links.forEach(l=>{if(l.pp)l.en=false});
 const cost=p=>p.slice(1).reduce((t,x,i)=>t+(lk(p[i],x).cost||1),0),
 best=(a,D)=>{const P=D.filter(x=>nodes[x].en!==false).map(x=>route(a,x)).filter(Boolean);if(!P.length)return null;const m=Math.min(...P.map(cost));return pick(P.filter(p=>cost(p)===m))},
 setP=v=>{s.prop=v;(d.p||[]).forEach(id=>nodes[id].en=v);links.forEach(l=>{if(l.pp)l.en=v})};
 return{id:'S',nodes,links,v:{rate:4,spd:1,rep:5,aut:40,mig:3,lim:6},hint:d.h,
 ctl:[{t:'range',id:'rate',l:'Paquetes por segundo',min:1,max:20,val:4},{t:'check',l:'Aplicar la propuesta',on:setP},...(d.c||[]),...d.ev.map(([l,f])=>({t:'btn',l,on:()=>f(nodes,s)}))],
 spawn(){if(d.sp)d.sp(s,nodes,(p,c,o)=>launch(p,c,o));else{const o=d.ob?d.src:d.src.filter(i=>!nodes[i].off);if(o.length){const a=pick(o),p=best(a,d.dst);if(p)launch(p,d.col?d.col(p):'--pk');else if(d.ob)launch(route(a,d.ob),'--bad',{blocked:1,why:d.why})}}d.ex&&d.ex(s,nodes)},
 tick(dt){d.tick&&d.tick(s,nodes,dt)},after(){d.src.forEach(i=>nodes[i].off=!best(i,d.dst))},
 status(){if(d.st)return d.st(s,nodes);const o=d.src.filter(i=>nodes[i].off).length;return o?[d.al,1]:[d.ok,0]},
 stats(){return[['Prioridad',d.pr],['Esfuerzo',d.ef],...(d.sx?d.sx(s,nodes):[])]}}}
SUG.forEach((d,i)=>{const b=document.createElement('button');b.textContent=(i+1)+' · '+d.t;b.onclick=()=>{SG_I=i;go('S',1)};$('#subtabs').appendChild(b)});
let cT=0;function chaos(dt){if(!s.chaos||s.id==='D')return;cT+=dt;if(cT<3.5)return;cT=0;const c=[...s.links.filter(l=>l.en&&l.up&&!l.nofail),...Object.values(s.nodes).filter(n=>n.up&&n.en!==false&&!n.nt&&n.kind!=='cloud'&&n.id!=='cap'&&!n.nofail&&(s.id!=='A'||n.id[0]==='l'))];if(!c.length)return;const e=pick(c);e.up=false;setTimeout(()=>e.up=true,6000)}
const SC={A:['Red provincial',sceneA],B:['SD-WAN',sceneB],C:['Centro de cableado',sceneC],D:['Segmentación',sceneD],E:['Energía y clima',sceneE],V:['VLAN',sceneV],S:['Sugerencias',sceneSug]};

/* ---------- UI ---------- */
function load(k){paused=false;s=SC[k][1]();Object.assign(s,{pk:[],fx:[],done:0,lost:0,sel:null});$('#trace').textContent='Toca un paquete para seguirlo';$('#log').innerHTML='';
 [...$('#tabs').children].forEach(b=>b.setAttribute('aria-selected',b.dataset.k===(k==='L'?'A':k)));$('#subtabs').hidden=k!=='S';[...$('#subtabs').children].forEach((b,i)=>b.setAttribute('aria-selected',i===SG_I));$('#hint').textContent=s.hint;
 const c=$('#ctl');c.innerHTML='';
 const pb=document.createElement('button');pb.className='b';pb.textContent=paused?'Reanudar animación':'Pausar animación';pb.onclick=()=>{paused=!paused;pb.textContent=paused?'Reanudar animación':'Pausar animación'};
 s.ctl.forEach(d=>{const e=document.createElement('div');
  if(d.t==='range'){const f=d.f||(v=>v);e.innerHTML=`<label>${d.l}<span>${f(d.val)}</span><input type="range" min="${d.min}" max="${d.max}" step="${d.step||1}" value="${d.val}"></label>`;
   const i=e.querySelector('input'),o=e.querySelector('span');i.ondblclick=()=>{i.value=d.val;i.oninput()};i.title='Doble clic: valor inicial';i.oninput=()=>{o.textContent=f(i.value);if(d.id)s.v[d.id]=+i.value;d.on&&d.on(+i.value)}}
  else if(d.t==='check'){e.innerHTML=`<label class="ck"><input type="checkbox" ${(d.val||s.v[d.id])?'checked':''}>${d.l}</label>`;const i=e.querySelector('input');i.onchange=()=>{if(d.id)s.v[d.id]=i.checked;d.on&&d.on(i.checked)}}
  else{e.innerHTML=`<button class="b" style="width:100%">${d.l}</button>`;e.firstChild.onclick=d.on}
  c.appendChild(e)});
 const rs=document.createElement('button');rs.className='b';rs.textContent='Restablecer escena';rs.onclick=()=>load(k);(SCN[k]||[]).forEach(([n,f])=>{const b=document.createElement('button');b.className='b';b.textContent='Escenario: '+n;b.onclick=f;c.appendChild(b)});const ch=document.createElement('label');ch.className='ck';ch.innerHTML='<input type="checkbox">Modo caos: fallas y reparaciones al azar';ch.firstChild.onchange=e=>{s.chaos=e.target.checked};const sp=document.createElement('label');sp.innerHTML='Velocidad del tiempo<span>×'+TS+'</span><input type="range" min=".2" max="3" step=".1" value="'+TS+'">';sp.querySelector('input').oninput=e=>{TS=+e.target.value;sp.querySelector('span').textContent='×'+TS};const bm=document.createElement('label');bm.className='ck';bm.innerHTML='<input type="checkbox">Modo ráfaga: tocar un nodo inyecta tráfico';bm.firstChild.onchange=e=>{s.burstMode=e.target.checked};const B2=(t,f)=>{const b=document.createElement('button');b.className='b';b.textContent=t;b.onclick=f;return b},em=document.createElement('label');em.className='ck';em.innerHTML='<input type="checkbox">Modo edición: toca vacío para crear un nodo, dos nodos para unirlos, un enlace propio para borrarlo';em.firstChild.onchange=e=>{s.edit=e.target.checked;s.esel=null};
c.append(sp,ch,bm,em,B2('Eliminar nodo seleccionado',()=>{const id=s.esel;if(id&&s.nodes[id]&&s.nodes[id].cu){delete s.nodes[id];for(let i=s.links.length-1;i>=0;i--)if(s.links[i].a===id||s.links[i].b===id)s.links.splice(i,1);s.esel=null;s.pk=[];s.trace=null}}),B2('Exportar escenario',()=>{const o=$('#io');o.value=ser();o.select();try{navigator.clipboard.writeText(o.value)}catch(e){}}),B2('Importar escenario',impo),pb,rs);regroup()}
function regroup(){const c=$('#ctl'),k=[...c.children];window.IOEL=window.IOEL||$('#io');const G=(t,o)=>{const d=document.createElement('details');d.open=o;d.innerHTML='<summary>'+t+'</summary><div class="gb"></div>';return d},g1=G('Parámetros',1),g2=G('Escenarios de falla',1),g3=G('Herramientas',0),g4=G('Compartir escenario',0),bar=document.createElement('div');bar.className='bar';bar.style.flexWrap='wrap';if(s.back){const bb=document.createElement('button');bb.className='b';bb.style.flexBasis='100%';bb.textContent='← Volver a la red provincial';bb.onclick=()=>go('A',-1);bar.append(bb)}
 k.forEach(e=>{const t=e.textContent;let g;if(e.tagName==='DIV')g=g1;else if(t.startsWith('Escenario:')){e.textContent='⚡ '+t.slice(11).replace(/^./,m=>m.toUpperCase());e.classList.add('dg');g=g2}else if(/Exportar|Importar/.test(t))g=g4;else if(/Pausar|Reanudar|Restablecer/.test(t)){bar.append(e);return}else g=g3;g.lastChild.append(e)});
 const lbl=document.createElement('p');lbl.textContent='Exporta un código, cópialo y pégalo aquí para importarlo.';g4.lastChild.append(lbl,window.IOEL);c.replaceChildren(bar,...[g1,g2,g3,g4].filter(g=>g.lastChild.children.length))}
Object.entries(SC).forEach(([k,[n]])=>{const b=document.createElement('button');b.textContent=({A:'🗺️',B:'🌐',C:'🔌',D:'🛡️',E:'⚡',V:'🏷️',S:'💡'})[k]+' '+n;b.title='Tecla '+(Object.keys(SC).indexOf(k)+1);b.dataset.k=k;b.setAttribute('role','tab');b.onclick=()=>load(k);$('#tabs').appendChild(b)});

/* ---------- Motor ---------- */
const col=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const P=n=>[n.x*W,n.y*H];
function hit(mx,my){for(const n of Object.values(s.nodes)){if(n.en===false)continue;const[x,y]=P(n),r=n.kind==='cloud'?34:(n.r||11)+8;if(Math.hypot((mx-x)/(n.kind==='cloud'?1:1),(my-y)*(n.kind==='cloud'?1.6:1))<r)return{n}}
 for(const l of s.links){if(!l.en||s.id==='D')continue;const[x1,y1]=P(s.nodes[l.a]),[x2,y2]=P(s.nodes[l.b]),dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((mx-x1)*dx+(my-y1)*dy)/(dx*dx+dy*dy))),d=Math.hypot(mx-x1-t*dx,my-y1-t*dy);if(d<9)return{l}}return null}
cv.addEventListener('x-act',e=>{const h=e.detail;if(!h)return;SH=7;
 if(h.n){if(s.click)s.click(h.n);else if(h.n.id!=='cap'&&h.n.kind!=='cloud'&&!h.n.nt)h.n.up=!h.n.up;else if(h.n.id==='cap')h.n.up=!h.n.up}else h.l.up=!h.l.up;});
cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),h=hit(e.clientX-r.left,e.clientY-r.top);cv.style.cursor=h&&!(h.n&&h.n.nt)?'pointer':'default'});

let TS=1,dn=null;const tip=document.createElement('div');tip.style.cssText='position:absolute;pointer-events:none;background:var(--ink);color:var(--bg);padding:6px 9px;border-radius:7px;font:12px/1.4 "JetBrains Mono",ui-monospace,Consolas,monospace;max-width:240px;display:none;z-index:5';cv.parentElement.style.position='relative';cv.parentElement.appendChild(tip);
const xy=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
const info=h=>{if(h.l){const l=h.l,a=s.nodes[l.a],b=s.nodes[l.b];return`<b>${a.l} ↔ ${b.l}</b><br>${l.up?'activo':'cortado'} · uso ${Math.round((l.u||0)*100)} %<br>costo ${l.cost||1} · pérdida ${l.loss} %`}const n=h.n,k=s.links.filter(l=>l.en&&(l.a===n.id||l.b===n.id));return`<b>${n.l}</b><br>${!n.up?'caído':n.off?'sin servicio':'operativo'} · ${k.length} enlaces${s.tip?s.tip(n):''}<br><i>clic: cortar o reparar · arrastrar: mover</i>`};
const tipAt=(x,y)=>{const h=hit(x,y);if(!h){tip.style.display='none';return}tip.innerHTML=info(h);tip.style.display='block';tip.style.left=Math.max(4,Math.min(W-170,x+14))+'px';tip.style.top=Math.max(4,y-10)+'px'};
cv.addEventListener('pointerdown',e=>{const[x,y]=xy(e);dn={h:hit(x,y),x,y,m:0};const pk=s.pk.find(p=>{const a=s.nodes[p.path[p.i]],b=s.nodes[p.path[p.i+1]];return b&&Math.hypot((a.x+(b.x-a.x)*p.t)*W-x,(a.y+(b.y-a.y)*p.t)*H-y)<11});if(pk){s.trace=pk;dn.h=null;dn.m=1}if(dn.h&&dn.h.n)cv.setPointerCapture(e.pointerId);tipAt(x,y)});
cv.addEventListener('pointermove',e=>{const[x,y]=xy(e);if(dn&&dn.h&&dn.h.n&&(dn.m||Math.hypot(x-dn.x,y-dn.y)>6)){dn.m=1;const n=dn.h.n;n.x=Math.max(.05,Math.min(.95,x/W));n.y=Math.max(.05,Math.min(.95,y/H));cv.style.cursor='grabbing';tip.style.display='none'}else tipAt(x,y)});
cv.addEventListener('pointerup',e=>{if(dn&&!dn.m){if(s.edit&&s.id!=='D')editTap(dn);else if(s.burstMode&&dn.h&&dn.h.n&&SINK[s.id])burst(dn.h.n);else cv.dispatchEvent(new CustomEvent('x-act',{detail:dn.h}))}dn=null});
cv.addEventListener('pointerleave',()=>tip.style.display='none');
function kindOf(n){if(n.kind==='cloud')return'cloud';if(n.sat)return'sat';if(s.id==='V')return n.pc?'pc':n.id==='fw'?'rack':'sw';if(s.id==='S')return n.k||'dot';if(n.cu)return'rtr';const E={sol:'sun',red:'pole',g1:'gen',g2:'gen',tr:'sw',u1:'ups',u2:'ups',dc:'rack',a1:'fan',a2:'fan'},G={cap:'rack',fw:'fw',c1:'sw',c2:'sw',a1:'sw',a2:'sw',a3:'sw'};if(s.id==='E')return E[n.id]||'dot';if(s.id==='D')return n.id==='fw'?'fw':'zone';if(s.id==='B')return n.id==='fw'?'fw':'dot';if(/^l\d/.test(n.id))return'bld';return G[n.id]||'dot'}
function icon(n,x,y,t,pn,c){const k=kindOf(n),r=n.r||11,B=(a,b,w,h,q)=>{cx.beginPath();cx.roundRect(x+a,y+b,w,h,q);cx.fill();cx.stroke()},Ln=(a,b,d,e)=>{cx.beginPath();cx.moveTo(x+a,y+b);cx.lineTo(x+d,y+e);cx.stroke()},led=(a,b,i)=>{cx.fillStyle=Math.sin(t*6+i*2.3)>0?c:pn;cx.fillRect(x+a,y+b,3,3)},C=q=>{cx.beginPath();cx.arc(x,y,q,0,7);cx.fill();cx.stroke()},spin=(m,p)=>{for(let i=0;i<m;i++){const a=p+i*6.283/m;Ln(0,0,Math.cos(a)*r*.8,Math.sin(a)*r*.8)}};
 if(k==='cloud'){cx.beginPath();cx.ellipse(x,y,n.lab==='in'?44:34,19,0,0,7);cx.fill();cx.stroke()}
 else if(k==='sw'){B(-r,-r*.6,2*r,r*1.2,3);for(let i=0;i<4;i++)led(-r+4+i*r*.5,-1,i)}
 else if(k==='rack'){B(-r*.7,-r,r*1.4,2*r,3);for(let i=0;i<4;i++){Ln(-r*.7,-r+i*r*.5+r*.45,r*.7,-r+i*r*.5+r*.45);led(r*.3,-r+i*r*.5+r*.12,i)}}
 else if(k==='ups'){B(-r,-r*.65,2*r,r*1.3,3);const q=s.bat!=null?s.bat/100:1;cx.fillStyle=q>.5?col('--ok'):q>.2?col('--warn'):col('--bad');cx.fillRect(x-r+3,y-r*.65+3,(2*r-6)*q,r*1.3-6)}
 else if(k==='gen'||k==='fan'){C(r);cx.lineWidth=2;spin(k==='gen'?3:4,(k==='gen'?s.gen===n.id:n.up&&s.cool)?t*9:0);cx.lineWidth=2.5}
 else if(k==='sun'){C(r*.6);for(let i=0;i<8;i++){const a=i*.785+t*.5,q=r*(.8+.5*s.sun);cx.beginPath();cx.moveTo(x+Math.cos(a)*r*.85,y+Math.sin(a)*r*.85);cx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);cx.stroke()}}
 else if(k==='pole'){Ln(-r*.7,r,0,-r);Ln(r*.7,r,0,-r);Ln(-r*.5,0,r*.5,0);Ln(-r*.8,-r*.4,r*.8,-r*.4);Ln(-r*.4,r*.4,r*.4,r*.4)}
 else if(k==='bld'){B(-r*.7,-r,r*1.4,2*r,2);for(let i=0;i<6;i++)led(-r*.4+(i%2)*r*.5,-r*.7+Math.floor(i/2)*r*.55,i)}
 else if(k==='fw'){B(-r,-r*.8,2*r,r*1.6,3);for(let i=1;i<3;i++)Ln(-r,-r*.8+i*r*.53,r,-r*.8+i*r*.53);Ln(0,-r*.8,0,-r*.27);Ln(-r*.5,-r*.27,-r*.5,r*.27);Ln(r*.5,-r*.27,r*.5,r*.27);Ln(0,r*.27,0,r*.8)}
 else if(k==='rtr'){C(r);[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{Ln(d[0]*r*.2,d[1]*r*.2,d[0]*r*.7,d[1]*r*.7);Ln(d[0]*r*.7,d[1]*r*.7,d[0]*r*.5+d[1]*r*.15,d[1]*r*.5+d[0]*r*.15)})}
 else if(k==='sat'){satIcon(x,y,r,t,c)}
 else if(k==='pc'){B(-r,-r*.8,2*r,r*1.2,2);cx.fillStyle=col(n.vc||'--ac');cx.globalAlpha=.6;cx.fillRect(x-r+2,y-r*.8+2,2*r-4,r*1.2-4);cx.globalAlpha=1;Ln(0,r*.4,0,r*.85);Ln(-r*.5,r*.85,r*.5,r*.85)}
 else if(k==='zone'){B(-r,-r,2*r,2*r,6);cx.fillStyle=c;cx.textAlign='center';cx.fillText(n.l[0],x,y)}
 else C(r)}
const editTap=d=>{const h=d.h;if(!h){const id='x'+(s.nx=(s.nx||0)+1);s.nodes[id]=N(id,d.x/W,d.y/H,'Nodo '+s.nx,{r:11,cu:1});return}
 if(h.l){if(h.l.cu){s.links.splice(s.links.indexOf(h.l),1);s.pk=[];s.trace=null}else h.l.up=!h.l.up;return}
 const n=h.n;if(!s.esel){s.esel=n.id;return}if(s.esel===n.id){s.esel=null;return}if(!lk(s.esel,n.id))s.links.push(L(s.esel,n.id,{cost:1,cap:10,cu:1}));s.esel=null};
const ser=()=>btoa(unescape(encodeURIComponent(JSON.stringify({k:s.id,n:Object.values(s.nodes).map(n=>[n.id,+n.x.toFixed(3),+n.y.toFixed(3),n.up?1:0,n.cu?n.l:0]),l:s.links.map(l=>[l.a,l.b,l.up?1:0,l.cost||1,l.cap||0,l.loss||0,l.cu?1:0])}))));
const impo=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($('#io').value.trim()))));if(!SC[o.k])return;load(o.k);o.n.forEach(a=>{let n=s.nodes[a[0]];if(!n&&a[4]){n=s.nodes[a[0]]=N(a[0],a[1],a[2],a[4],{r:11,cu:1});s.nx=Math.max(s.nx||0,+a[0].slice(1)||0)}if(n){n.x=a[1];n.y=a[2];n.up=!!a[3]}});o.l.forEach(a=>{let l=lk(a[0],a[1]);if(!l&&a[6]&&s.nodes[a[0]]&&s.nodes[a[1]])s.links.push(l=L(a[0],a[1],{cost:a[3],cap:a[4],cu:1}));if(l)l.up=!!a[2]})}catch(e){$('#io').value='Código inválido'}};
let SH=0;const SINK={V:'fw',L:'cap',A:'cap',B:'net',C:'ca',E:'dc'};
const burst=n=>{const p=route(n.id,SINK[s.id]);if(p&&p.length>1){const sc=s;for(let k=0;k<12;k++)setTimeout(()=>{if(s===sc)launch([...p],'--warn')},k*90)}};
function bgd(t){if(SH>.3)cx.translate((Math.random()-.5)*SH,(Math.random()-.5)*SH);SH*=.9;cx.strokeStyle=col('--ln');cx.globalAlpha=.25;cx.lineWidth=1;cx.beginPath();for(let x=0;x<W;x+=32){cx.moveTo(x,0);cx.lineTo(x,H)}for(let y=0;y<H;y+=32){cx.moveTo(0,y);cx.lineTo(W,y)}cx.stroke();
 const sy=(t*40)%(H+60)-30,g=cx.createLinearGradient(0,sy-30,0,sy+30);g.addColorStop(0,'transparent');g.addColorStop(.5,col('--ac'));g.addColorStop(1,'transparent');cx.globalAlpha=.08;cx.fillStyle=g;cx.fillRect(0,sy-30,W,60);cx.globalAlpha=1;
 if(s.id==='E'){const k=s.sun||0;cx.fillStyle='#0a1a40';cx.globalAlpha=.3*(1-k);cx.fillRect(0,0,W,H);cx.fillStyle='#ffd27a';cx.globalAlpha=.1*k;cx.fillRect(0,0,W,H);cx.globalAlpha=1}}
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key===' '){e.preventDefault();paused=!paused}else if(+e.key>=1&&+e.key<=7)load('ABCDEVS'[+e.key-1]);else if(e.key==='r')load(s.id);else if(e.key==='Escape'&&s.back)go('A',-1)});
let LOC_I=0;
function go(k,d){cv.style.transition='opacity .3s ease,transform .3s ease';cv.style.opacity=0;cv.style.transform=d>0?'scale(1.12)':'scale(.9)';setTimeout(()=>{load(k);cv.style.transition='none';cv.style.transform=d>0?'scale(.9)':'scale(1.12)';requestAnimationFrame(()=>requestAnimationFrame(()=>{cv.style.transition='opacity .35s ease,transform .35s ease';cv.style.opacity=1;cv.style.transform='scale(1)'}))},300)}
function sceneL(){const i=LOC_I,nm=LOC[i],n=4+i%2,TY=['starlink','fibra','fibra','radio','fibra'].slice(0,n),DN=['Juzgado de Paz','Fiscalía','Defensoría','Registro Civil','Archivo'],
 nodes={cap:N('cap',.09,.5,'Data center',{r:20}),mp:N('mp',.3,.5,'MPLS Telecom',{kind:'cloud',lab:'in'}),main:N('main',.54,.5,nm,{r:20})},links=[L('cap','mp',{n:'troncal',cap:10}),L('mp','main',{n:'MPLS',cap:8})];
 TY.forEach((ty,j)=>{const id='d'+j;nodes[id]=N(id,.86,n>1?.1+j*.76/(n-1):.5,DN[j],{r:11,dep:1});
  if(ty==='starlink'){nodes.sat=N('sat',.6,.22,'Satélite',{r:10,sat:1,lab:'l'});links.push(L('main','sat',{ty,n:'Starlink',lt:.45,sp:.55,cap:5}),L('sat',id,{ty,sp:.55,cap:5}))}
  else links.push(L('main',id,{lt:.4,ty,n:ty==='radio'?'radioenlace':'fibra',sp:ty==='fibra'?1.5:1,cap:5}))});
 const ED=Object.keys(nodes).filter(k=>k!=='cap'&&k!=='mp'&&k!=='sat');
 return{id:'L',back:1,tick(){nodes.sat.x=.6+.02*Math.cos(s.time*.5);nodes.sat.y=.22+.015*Math.sin(s.time*.5)},nodes,links,hint:'Detalle de '+nm+': el edificio principal se une a la MPLS y a sus dependencias. Fibra (pulsos de luz, la más rápida), radioenlace (ondas, sensible a la lluvia) y Starlink (vía satélite, mayor latencia).',v:{rate:4,spd:1},
 ctl:[{t:'range',id:'rate',l:'Paquetes por segundo',min:1,max:30,val:4},{t:'range',id:'spd',l:'Velocidad de propagación',min:.4,max:3,step:.1,val:1},{t:'range',l:'Lluvia o mal clima',min:0,max:100,val:0,f:v=>v+' %',on:v=>links.forEach(l=>{if(l.ty==='radio')l.loss=v*.5;if(l.ty==='starlink')l.loss=v*.15})},{t:'btn',l:'Cortar un enlace al azar',on:()=>{const c=links.filter(l=>l.up);if(c.length)pick(c).up=false}}],
 spawn(){const o=ED.filter(k=>nodes[k]&&!nodes[k].off);if(o.length)launch(route(pick(o),'cap'),'--pk')},after(){ED.forEach(k=>nodes[k].off=!route(k,'cap'))},
 status(){const o=ED.filter(k=>nodes[k].off).length;return o?['Alarma: '+o+' edificio(s) sin conexión',1]:['Todos los edificios conectados',0]},
 stats(){const c=t=>TY.filter(x=>x===t).length;return[['Fibra',c('fibra')],['Radioenlace',c('radio')],['Starlink',c('starlink')]]}}}
SC.L=['Localidad',sceneL];SCN.L=[['corte de la fibra del edificio principal',()=>lk('mp','main').up=false],['falla del radioenlace',()=>{const l=s.links.find(x=>x.ty==='radio');if(l)l.up=false}],['falla del satélite Starlink',()=>s.nodes.sat.up=false]];
function satIcon(x,y,r,t,c){const u=r*1.1,w0=u,W2=u*3.3,hh=u*.6;cx.save();cx.translate(x-u*.4,y);cx.rotate(Math.sin(t*.5)*.08);
 let g=cx.createLinearGradient(0,-hh,0,hh);g.addColorStop(0,'#16337a');g.addColorStop(1,'#2c64c8');cx.fillStyle=g;cx.fillRect(w0,-hh,W2,hh*2);
 cx.strokeStyle='#8fb8f5';cx.lineWidth=.8;cx.strokeRect(w0,-hh,W2,hh*2);cx.beginPath();for(let i=1;i<7;i++){cx.moveTo(w0+i*W2/7,-hh);cx.lineTo(w0+i*W2/7,hh)}cx.moveTo(w0,0);cx.lineTo(w0+W2,0);cx.stroke();
 const gx=w0+((t*.35)%1.6-.3)*W2;g=cx.createLinearGradient(gx-9,0,gx+9,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');cx.save();cx.beginPath();cx.rect(w0,-hh,W2,hh*2);cx.clip();cx.fillStyle=g;cx.fillRect(gx-9,-hh,18,hh*2);cx.restore();
 cx.strokeStyle='#b8c0c8';cx.lineWidth=2;cx.beginPath();cx.moveTo(u*.55,0);cx.lineTo(w0,0);cx.stroke();
 g=cx.createLinearGradient(0,-u*.5,0,u*.5);g.addColorStop(0,'#eef1f4');g.addColorStop(1,'#a9b2ba');cx.fillStyle=g;cx.strokeStyle=c;cx.lineWidth=1.5;cx.beginPath();cx.roundRect(-u*.4,-u*.5,u*.95,u,2);cx.fill();cx.stroke();
 cx.strokeStyle='#5d6a73';cx.lineWidth=.6;cx.beginPath();for(let i=1;i<4;i++){cx.moveTo(-u*.4+i*u*.95/4,-u*.4);cx.lineTo(-u*.4+i*u*.95/4,u*.4)}for(let j=1;j<4;j++){cx.moveTo(-u*.32,-u*.5+j*u/4);cx.lineTo(u*.47,-u*.5+j*u/4)}cx.stroke();
 cx.fillStyle='#d9dee3';cx.strokeStyle='#5d6a73';cx.beginPath();cx.arc(u*.1,-u*.5,u*.17,Math.PI,0);cx.fill();cx.stroke();
 cx.fillStyle=Math.sin(t*5)>0?'#ff5d5d':'#5a1a1a';cx.fillRect(u*.4,u*.34,2.5,2.5);
 cx.fillStyle='rgba(120,200,255,'+(.5+.3*Math.sin(t*9))+')';cx.beginPath();cx.ellipse(-u*.46,0,u*.1,u*.14,0,0,7);cx.fill();cx.restore()}
function sbeam(l,x1,y1,x2,y2,t){cx.save();cx.strokeStyle='#b9a8ff';cx.lineWidth=1.6;cx.globalAlpha=.85;cx.setLineDash([2,9]);cx.lineDashOffset=-t*45;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();cx.restore()}
function ltype(l,x1,y1,x2,y2,t){const dx=x2-x1,dy=y2-y1,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;cx.save();
 if(l.ty==='fibra'){cx.strokeStyle='#7fe7ff';cx.globalAlpha=.9;cx.lineWidth=1.4;cx.setLineDash([2,16]);cx.lineDashOffset=-t*120;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke()}
 else if(l.ty==='radio'){cx.strokeStyle=col('--pk');cx.lineWidth=1.6;cx.globalAlpha=.9;cx.beginPath();for(let i=0;i<=d;i+=3){const a=Math.sin(i*.35-t*8)*5*Math.sin(Math.PI*i/d),x=x1+ux*i-uy*a,y=y1+uy*i+ux*a;i?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke();const an=Math.atan2(-dy,-dx);for(let k=0;k<3;k++){const r=(t*30+k*10)%30+4;cx.globalAlpha=1-r/36;cx.beginPath();cx.arc(x2,y2,r+8,an-.7,an+.7);cx.stroke()}}
 else{const mx=(x1+x2)/2,my=(y1+y2)/2-34,sx=mx+Math.cos(t*.9)*30,sy=my+Math.sin(t*.9)*6;cx.strokeStyle='#b9a8ff';cx.lineWidth=1;cx.globalAlpha=.6;cx.setLineDash([3,4]);cx.lineDashOffset=-t*30;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(sx,sy);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1;cx.fillStyle='#b9a8ff';cx.fillRect(sx-7,sy-2,14,4);cx.fillRect(sx-1.5,sy-5,3,10)}
 cx.restore()}
$('#gb').onclick=()=>$('#gd').showModal();$('#gx').onclick=()=>$('#gd').close();$('#gd').addEventListener('click',e=>{if(e.target.id==='gd')$('#gd').close()});
let last=0;
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(!paused)step(dt*TS);draw(ts/1000);requestAnimationFrame(frame)}
function step(dt){s.time=(s.time||0)+dt;s.tick&&s.tick(dt);chaos(dt);s.after();if(s.v.rate){acc+=dt*s.v.rate;while(acc>=1){acc--;s.spawn();{const cn=Object.values(s.nodes).filter(n=>n.cu&&n.up),t=SINK[s.id];if(cn.length&&t&&s.nodes[t]&&Math.random()<.6){const p=route(pick(cn).id,t);if(p&&p.length>1)launch(p,'--ok')}}}}
 for(const p of s.pk){const a=s.nodes[p.path[p.i]],b=s.nodes[p.path[p.i+1]],l=lk(a.id,b.id),len=Math.hypot((b.x-a.x)*W,(b.y-a.y)*H)||1;
  if(p.d===undefined){const q=l.cap&&l.c>l.cap&&Math.random()<(p.voz&&s.v.qos?(l.c>l.cap*1.6?.5:0):Math.min(.9,.3+(l.c-l.cap)/l.cap));p.d=q||(l.loss>0&&Math.random()*100<l.loss)?.3+Math.random()*.5:null}
  p.t+=160*(s.v.spd||1)*(l.sp||1)*dt/len;p.age=(p.age||0)+dt;
  if(!l.up||!a.up||!b.up||(p.d!=null&&p.t>=p.d)){const[x,y]=P(a);fx(x+(P(b)[0]-x)*p.t,P(a)[1]+(P(b)[1]-P(a)[1])*p.t,'--bad');s.lost++;p.dead=1;p.res='perdido entre '+a.l+' y '+b.l+(l.cap&&l.c>l.cap?' (congestión)':'');continue}
  if(p.t>=1){b.act=.7;p.i++;p.t=0;p.d=undefined;if(p.i>=p.path.length-1){const[x,y]=P(b);if(p.blocked){s.lost++;fx(x,y,'--bad')}else{s.done++;fx(x,y,'--ok')}b.act=1;s.onArr&&s.onArr(p,b);p.res=p.blocked?(p.why||'bloqueado por el firewall'):'entregado';p.dead=1}}}
 s.links.forEach(l=>{l.c=0});s.pk.forEach(p=>{if(!p.dead){const l=lk(p.path[p.i],p.path[p.i+1]);if(l)l.c++}});s.links.forEach(l=>l.u=(l.u||0)*(1-3*dt)+Math.min(1,l.c/5)*3*dt);s.pk=s.pk.filter(p=>!p.dead);s.fx.forEach(f=>f.t+=dt*1.6);Object.values(s.nodes).forEach(n=>n.act=(n.act||0)*(1-4*dt));(s.sp||[]).forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=120*dt;q.l-=dt*1.4});s.sp=(s.sp||[]).filter(q=>q.l>0);s.h2=(s.h2||0)+dt;if(s.h2>.5){s.h2=0;(s.hist=s.hist||[]).push([s.done-(s.pd||0),s.lost-(s.pl2||0)]);s.pd=s.done;s.pl2=s.lost;if(s.hist.length>60)s.hist.shift()}s.fx=s.fx.filter(f=>f.t<1)}
function draw(t){cx.clearRect(0,0,W,H);cx.save();bgd(t);s.zones&&s.zones();const bad=col('--bad'),warn=col('--warn'),ac=col('--ac'),ln=col('--ln'),pn=col('--pn'),ink=col('--ink'),mut=col('--mut');
 cx.font='11.5px "JetBrains Mono",ui-monospace,Consolas,monospace';cx.textBaseline='middle';
 for(const l of s.links){if(!l.en)continue;const A=s.nodes[l.a],B=s.nodes[l.b],[x1,y1]=P(A),[x2,y2]=P(B),dead=!l.up||!A.up||!B.up,deg=s.v.thr&&l.loss>s.v.thr;
  cx.lineWidth=2+(l.wall?2:0)+4*(l.u||0);cx.strokeStyle=dead?bad:deg||(l.u||0)>.7?warn:l.vc?col(l.vc):ac;cx.globalAlpha=dead?.8:.4+.4*(l.u||0);cx.setLineDash(dead?[2,7]:[7,6]);cx.lineDashOffset=-t*18;
  cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);cx.globalAlpha=1;if(l.ty&&!dead)(l.ty==='starlink'?sbeam:ltype)(l,x1,y1,x2,y2,t);
  const tx=l.n||(s.id==='B'&&l.a==='fw'?l.loss+' %':'');if(tx){cx.fillStyle=dead?bad:deg?warn:mut;cx.textAlign='center';const f=l.lt||.5,mx=x1+(x2-x1)*f,my=y1+(y2-y1)*f;cx.fillStyle=pn;cx.fillRect(mx-cx.measureText(tx).width/2-3,my-8,cx.measureText(tx).width+6,16);cx.fillStyle=dead?bad:deg?warn:mut;cx.fillText(tx,mx,my)}}
 for(const n of Object.values(s.nodes)){if(n.en===false)continue;const[x,y]=P(n),dn=!n.up;
  cx.lineWidth=2.5;cx.fillStyle=pn;cx.strokeStyle=dn?bad:n.off?warn:ac;
  {const g=n.act||0;if(g>.02){const rg=cx.createRadialGradient(x,y,2,x,y,(n.r||11)+16+10*g);rg.addColorStop(0,ac);rg.addColorStop(1,'transparent');cx.globalAlpha=Math.min(.55,g*.6);cx.fillStyle=rg;cx.beginPath();cx.arc(x,y,(n.r||11)+16+10*g,0,7);cx.fill();cx.globalAlpha=1;cx.fillStyle=pn}}icon(n,x,y,t,pn,dn?bad:n.off?warn:ac);
  if(n.off&&!dn){cx.globalAlpha=.5+.5*Math.sin(t*6);cx.strokeStyle=warn;cx.beginPath();cx.arc(x,y,(n.r||11)+6,0,7);cx.stroke();cx.globalAlpha=1}
  if(s.sel===n.id||s.esel===n.id){cx.strokeStyle=col('--pk');cx.lineWidth=3;cx.beginPath();cx.arc(x,y,(n.r||11)+6,0,7);cx.stroke()}
  if(dn){cx.strokeStyle=bad;cx.beginPath();cx.moveTo(x-6,y-6);cx.lineTo(x+6,y+6);cx.moveTo(x+6,y-6);cx.lineTo(x-6,y+6);cx.stroke()}
  cx.fillStyle=ink;const w=cx.measureText(n.l).width;
  if(n.lab==='in'){cx.textAlign='center';cx.fillText(n.l,x,y)}else if(n.lab==='l'){cx.textAlign='right';cx.fillText(n.l,x-(n.r||11)-8,y)}
  else{cx.textAlign='left';cx.fillText(n.l,Math.max(4,Math.min(W-w-4,x-w/2)),y+(n.r||11)+13)}}
 for(const p of s.pk){const a=s.nodes[p.path[p.i]],b=s.nodes[p.path[p.i+1]];if(!b)continue;const c=col(p.col);
  for(let k=4;k>=0;k--){const u=Math.max(0,p.t-k*.035),x=(a.x+(b.x-a.x)*u)*W,y=(a.y+(b.y-a.y)*u)*H;cx.globalAlpha=1-k*.2;cx.fillStyle=c;cx.shadowColor=c;cx.shadowBlur=k?0:12;cx.beginPath();cx.arc(x,y,k?3.2-k*.4:4.5,0,7);cx.fill();if(!k&&lk(a.id,b.id).tr){cx.strokeStyle='#fff';cx.lineWidth=1.5;cx.stroke()}}cx.shadowBlur=0;cx.globalAlpha=1}
 for(const q of s.sp||[]){cx.globalAlpha=q.l;cx.fillStyle=bad;cx.fillRect(q.x,q.y,2.5,2.5)}cx.globalAlpha=1;for(const f of s.fx){cx.globalAlpha=1-f.t;cx.strokeStyle=col(f.k);cx.lineWidth=2;cx.beginPath();cx.arc(f.x,f.y,4+f.t*22,0,7);cx.stroke();cx.globalAlpha=1}
 if(s.trace){const p=s.trace;cx.strokeStyle=col('--pk');cx.lineWidth=3;cx.setLineDash([3,5]);cx.beginPath();p.path.forEach((id,i)=>{const[x,y]=P(s.nodes[id]);i?cx.lineTo(x,y):cx.moveTo(x,y)});cx.stroke();cx.setLineDash([]);
  if(!p.dead){const a=s.nodes[p.path[p.i]],b=s.nodes[p.path[p.i+1]];if(b){cx.beginPath();cx.arc((a.x+(b.x-a.x)*p.t)*W,(a.y+(b.y-a.y)*p.t)*H,10+2*Math.sin(t*8),0,7);cx.stroke()}}
  const tx2=p.path.map(i=>s.nodes[i].l).join(' → ')+' · '+(p.dead?p.res||'finalizado':'en tránsito, salto '+(p.i+1)+'/'+(p.path.length-1))+' · '+(p.age||0).toFixed(1)+' s';if($('#trace').textContent!==tx2)$('#trace').textContent=tx2}
 cx.restore();if(s.edit){cx.fillStyle=col('--pk');cx.textAlign='left';cx.fillText('MODO EDICIÓN',10,14)}{const sc=$('#spk'),sx=sc.getContext('2d'),w2=Math.round(sc.clientWidth*2);if(w2&&sc.width!==w2)sc.width=w2;sx.clearRect(0,0,sc.width,108);const hs=s.hist||[],mx=Math.max(4,...hs.map(h=>h[0]+h[1])),bw=sc.width/60;hs.forEach((h,i)=>{const a=h[0]/mx*100,c2=h[1]/mx*100;sx.fillStyle=col('--ok');sx.fillRect(i*bw,106-a,bw-1,a);sx.fillStyle=bad;sx.fillRect(i*bw,106-a-c2,bw-1,c2)})}
 const[m,b]=s.status();if(m!==s.lm){s.lm=m;(s.log=s.log||[]).unshift(((s.time||0)|0)+' s · '+m);s.log.length=Math.min(s.log.length,6);$('#log').innerHTML='<b>Registro</b><br>'+s.log.join('<br>')}const e=$('#st');if(e.textContent!==m)e.textContent=m;e.className=b?'bad':'';
 const rows=[['Entregados',s.done],['Perdidos',s.lost],...s.stats()],h=rows.map(r=>`<span>${r[0]}</span><b>${r[1]}</b>`).join('');if($('#stats').dataset.h!==h){$('#stats').dataset.h=h;$('#stats').innerHTML=h}}
function layout(){const st=$('.stage'),sd=$('.side'),ids=['#stats','#trace','#log','#spk'].map(q=>$(q));let d=$('#dock');if(!d){d=document.createElement('div');d.id='dock'}
 if(mq.matches){st.append(d);ids.forEach(e=>d.append(e));st.prepend($('#hint'))}else{ids.forEach(e=>sd.append(e));sd.prepend($('#hint'));d.remove()}}
layout();mq.addEventListener('change',()=>{layout();size()});addEventListener('resize',size);size();load('A');requestAnimationFrame(frame);
