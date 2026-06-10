// ── Diagrams ──────────────────────────────────────────────────────────────────
function renderDiagrams() {
  stopDiagramFloat();
  const diagrams=Storage.getDiagrams();
  document.getElementById('page-diagrams').innerHTML=
  '<div style="display:flex;flex-direction:column;gap:14px;height:100%">'+
  '<div class="section-header"><span class="section-title">'+t('diag_title')+'</span><div style="display:flex;gap:8px"><input class="input" id="diagram-name" value="'+diagramState.name+'" style="width:200px;font-size:13px"><button class="btn btn-primary btn-sm" onclick="saveDiagram()">'+t('diag_save')+'</button><button class="btn btn-outline btn-sm" onclick="newDiagram()">'+t('diag_new')+'</button></div></div>'+
  '<div class="diagram-toolbar">'+
  '<button class="tool-btn '+(diagramState.tool==='node'?'active':'')+'" onclick="setDiagramTool(\'node\')">'+t('diag_tool_node')+'</button>'+
  '<button class="tool-btn '+(diagramState.tool==='select'?'active':'')+'" onclick="setDiagramTool(\'select\')">'+t('diag_tool_select')+'</button>'+
  '<button class="tool-btn '+(diagramState.tool==='connect'?'active':'')+'" onclick="setDiagramTool(\'connect\')">'+t('diag_tool_connect')+'</button>'+
  '<button class="tool-btn '+(diagramState.tool==='text'?'active':'')+'" onclick="setDiagramTool(\'text\')">'+t('diag_tool_text')+'</button>'+
  '<button class="tool-btn '+(diagramState.tool==='delete'?'active':'')+'" onclick="setDiagramTool(\'delete\')">'+t('diag_tool_delete')+'</button>'+
  '<div style="width:1px;background:var(--border);margin:0 4px"></div>'+
  '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)">'+t('diag_color_node')+'<input type="color" value="'+diagramState.nodeColor+'" onchange="diagramState.nodeColor=this.value" style="width:28px;height:28px;border:none;cursor:pointer;background:none"> '+t('diag_color_text')+'<input type="color" value="'+diagramState.textColor+'" onchange="diagramState.textColor=this.value" style="width:28px;height:28px;border:none;cursor:pointer;background:none"> '+t('diag_color_line')+'<input type="color" value="'+diagramState.connColor+'" onchange="diagramState.connColor=this.value" style="width:28px;height:28px;border:none;cursor:pointer;background:none"></div>'+
  '<div style="width:1px;background:var(--border);margin:0 4px"></div>'+
  '<div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--muted)">'+t('diag_texture_lbl')+
  '<button class="tool-btn '+(diagramState.nodeTexture==='solid'?'active':'')+'" onclick="setDiagramTexture(\'solid\')" title="Solid">▪</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='stripe'?'active':'')+'" onclick="setDiagramTexture(\'stripe\')" title="Stripes">╱</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='dots'?'active':'')+'" onclick="setDiagramTexture(\'dots\')" title="Dots">∷</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='grid'?'active':'')+'" onclick="setDiagramTexture(\'grid\')" title="Grid">⊞</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='gradient'?'active':'')+'" onclick="setDiagramTexture(\'gradient\')" title="Gradient">◑</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='wood'?'active':'')+'" onclick="setDiagramTexture(\'wood\')" title="Wood">🪵</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='glass'?'active':'')+'" onclick="setDiagramTexture(\'glass\')" title="Glass">💎</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='marble'?'active':'')+'" onclick="setDiagramTexture(\'marble\')" title="Marble">◈</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='neon'?'active':'')+'" onclick="setDiagramTexture(\'neon\')" title="Neon glow">✦</button>'+
  '<button class="tool-btn '+(diagramState.nodeTexture==='paper'?'active':'')+'" onclick="setDiagramTexture(\'paper\')" title="Parchment paper">📜</button>'+
  '</div>'+
  '<div style="width:1px;background:var(--border);margin:0 4px"></div>'+
  '<div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--muted)">'+t('diag_arrow_lbl')+
  '<button class="tool-btn '+(diagramState.connStyle==='straight'?'active':'')+'" onclick="setDiagramConnStyle(\'straight\')" title="Straight">→</button>'+
  '<button class="tool-btn '+(diagramState.connStyle==='curved'?'active':'')+'" onclick="setDiagramConnStyle(\'curved\')" title="Curved">↪</button>'+
  '<button class="tool-btn '+(diagramState.connStyle==='dashed'?'active':'')+'" onclick="setDiagramConnStyle(\'dashed\')" title="Dashed">⇢</button>'+
  '<button class="tool-btn '+(diagramState.connStyle==='dotted'?'active':'')+'" onclick="setDiagramConnStyle(\'dotted\')" title="Dotted">⋯</button>'+
  '<button class="tool-btn '+(diagramState.connStyle==='double'?'active':'')+'" onclick="setDiagramConnStyle(\'double\')" title="Double line">⇒</button>'+
  '<button class="tool-btn '+(diagramState.connStyle==='wave'?'active':'')+'" onclick="setDiagramConnStyle(\'wave\')" title="Wave">〰</button>'+
  '<button class="tool-btn '+(diagramState.connStyle==='thunder'?'active':'')+'" onclick="setDiagramConnStyle(\'thunder\')" title="Lightning">⚡</button>'+
  '</div>'+
  '<div style="width:1px;background:var(--border);margin:0 4px"></div>'+
  '<button class="tool-btn '+(diagramState.floating?'active':'')+'" onclick="toggleDiagramFloat()" title="Toggle floating animation" style="gap:4px">🌊 '+(diagramState.floating?t('diag_float_on'):t('diag_float_off'))+'</button>'+
  '<div style="margin-left:auto"><button class="tool-btn" onclick="clearDiagram()">'+t('diag_clear')+'</button></div>'+
  '</div>'+
  '<div style="display:flex;gap:14px;flex:1;min-height:0">'+
  '<div style="flex:1;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--bg2);position:relative"><canvas id="diagram-canvas" style="display:block;width:100%;height:100%"></canvas><div style="position:absolute;bottom:10px;left:10px;font-size:11px;color:var(--muted);pointer-events:none">'+(diagramState.tool==='node'?t('diag_hint_node'):diagramState.tool==='connect'?t('diag_hint_connect'):diagramState.tool==='select'?t('diag_hint_select'):diagramState.tool==='delete'?t('diag_hint_delete'):t('diag_hint_text'))+'</div></div>'+
  '<div style="width:200px;display:flex;flex-direction:column;gap:8px"><div style="font-size:13px;font-weight:600;color:var(--muted)">'+t('diag_saved')+'</div>'+
  (diagrams.length===0?'<div style="font-size:12px;color:var(--muted);text-align:center;padding:20px 0">'+t('diag_no_saved')+'</div>':diagrams.map(function(d){return '<div style="padding:10px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer" onclick="loadDiagram(\''+d.id+'\')"><div style="font-weight:500;margin-bottom:2px">'+d.name+'</div><div style="font-size:11px;color:var(--muted)">'+(d.nodes?d.nodes.length:0)+' '+t('diag_nodes')+'</div><button class="btn btn-danger btn-xs" style="margin-top:6px" onclick="event.stopPropagation();deleteDiagramUI(\''+d.id+'\')">'+t('diag_del_btn')+'</button></div>';}).join(''))+
  '</div></div></div>';

  requestAnimationFrame(initDiagramCanvas);
}
function initDiagramCanvas() {
  dCanvas=document.getElementById('diagram-canvas'); if(!dCanvas)return;
  const ct=dCanvas.parentElement; dCanvas.width=ct.clientWidth; dCanvas.height=ct.clientHeight;
  dCtx=dCanvas.getContext('2d');
  dCanvas.addEventListener('click',onDiagramClick);
  dCanvas.addEventListener('mousedown',onDiagramDown);
  dCanvas.addEventListener('mousemove',onDiagramMove);
  dCanvas.addEventListener('mouseup',function(){diagramState.dragging=null;});
  dCanvas.addEventListener('dblclick',onDiagramDbl);
  if(diagramState.floating){startDiagramFloat();}else{drawDiagram();}
}
function dXY(e){const r=dCanvas.getBoundingClientRect();return{x:(e.clientX-r.left)*(dCanvas.width/r.width),y:(e.clientY-r.top)*(dCanvas.height/r.height)};}
function findNodeAt(x,y){for(let i=diagramState.nodes.length-1;i>=0;i--){const n=diagramState.nodes[i];if(x>=n.x-n.w/2&&x<=n.x+n.w/2&&y>=n.y-n.h/2&&y<=n.y+n.h/2)return i;}return -1;}
function findConnAt(x,y){for(let i=0;i<diagramState.connections.length;i++){const c=diagramState.connections[i];const f=diagramState.nodes.find(n=>n.id===c.from),t=diagramState.nodes.find(n=>n.id===c.to);if(!f||!t)continue;const dx=t.x-f.x,dy=t.y-f.y,len=Math.sqrt(dx*dx+dy*dy);if(!len)continue;const s=((x-f.x)*dx+(y-f.y)*dy)/(len*len);if(s<0||s>1)continue;if(Math.sqrt((x-(f.x+s*dx))**2+(y-(f.y+s*dy))**2)<10)return i;}return -1;}
function onDiagramClick(e){
  const{x,y}=dXY(e);
  if(diagramState.tool==='node'){diagramState.nodes.push({id:uid(),x,y,w:120,h:44,text:t('diag_node_default'),color:diagramState.nodeColor,textColor:diagramState.textColor,texture:diagramState.nodeTexture});drawDiagram();}
  else if(diagramState.tool==='delete'){const ni=findNodeAt(x,y);if(ni>=0){const nid=diagramState.nodes[ni].id;diagramState.nodes.splice(ni,1);diagramState.connections=diagramState.connections.filter(c=>c.from!==nid&&c.to!==nid);}else{const ci=findConnAt(x,y);if(ci>=0)diagramState.connections.splice(ci,1);}drawDiagram();}
  else if(diagramState.tool==='connect'){const ni=findNodeAt(x,y);if(ni>=0){const nid=diagramState.nodes[ni].id;if(!diagramState.connecting){diagramState.connecting=nid;diagramState.nodes[ni]._h=true;drawDiagram();}else if(diagramState.connecting!==nid){diagramState.connections.push({id:uid(),from:diagramState.connecting,to:nid,color:diagramState.connColor,style:diagramState.connStyle});diagramState.nodes.forEach(n=>delete n._h);diagramState.connecting=null;drawDiagram();}}}
  else if(diagramState.tool==='select'){const ni=findNodeAt(x,y);diagramState.nodes.forEach(n=>n._s=false);if(ni>=0)diagramState.nodes[ni]._s=true;drawDiagram();}
}
function onDiagramDown(e){if(diagramState.tool!=='select')return;const{x,y}=dXY(e);const ni=findNodeAt(x,y);if(ni>=0){diagramState.dragging=ni;diagramState.dragOffset={x:x-diagramState.nodes[ni].x,y:y-diagramState.nodes[ni].y};}}
function onDiagramMove(e){var pos=dXY(e);diagramState._mousePos=pos;if(diagramState.dragging!==null){diagramState.nodes[diagramState.dragging].x=pos.x-diagramState.dragOffset.x;diagramState.nodes[diagramState.dragging].y=pos.y-diagramState.dragOffset.y;}if(!diagramState.floating)drawDiagram();}
function onDiagramDbl(e){if(diagramState.tool!=='select'&&diagramState.tool!=='text')return;const{x,y}=dXY(e);const ni=findNodeAt(x,y);if(ni<0)return;var val=prompt(t('diag_edit_node'),diagramState.nodes[ni].text);if(val!==null){diagramState.nodes[ni].text=val;drawDiagram();}}
function getDiagramTheme(){var cl=document.body.classList;if(cl.contains('theme-parchment'))return'parchment';if(cl.contains('theme-neon'))return'neon';if(cl.contains('theme-cyber'))return'cyber';if(cl.contains('theme-academia'))return'academia';if(cl.contains('theme-enchant'))return'enchant';if(cl.contains('theme-minimal'))return'minimal';if(cl.contains('theme-oled'))return'oled';return'default';}
function getFloatY(idx){if(!diagramState.floating||!diagramState.floatTime)return 0;return Math.sin(diagramState.floatTime*0.001*1.15+idx*0.97)*4.5;}
function getCachedDiagramBg(w,h,theme){
  if(_diagBgCache&&_diagBgCache.theme===theme&&_diagBgCache.w===w&&_diagBgCache.h===h)return _diagBgCache.canvas;
  var bc=document.createElement('canvas');bc.width=w;bc.height=h;
  var bx=bc.getContext('2d');renderDiagramBg(bx,w,h,theme);
  _diagBgCache={canvas:bc,theme:theme,w:w,h:h};return bc;
}
function renderDiagramBg(bx,w,h,theme){
  if(theme==='parchment'){
    bx.fillStyle='#f0e3c4';bx.fillRect(0,0,w,h);
    for(var pi=0;pi<w*h/100;pi++){var gx=Math.random()*w,gy=Math.random()*h;bx.fillStyle='rgba('+(110+Math.random()*50|0)+','+(70+Math.random()*30|0)+','+(15+Math.random()*20|0)+','+(Math.random()*0.1)+')';bx.fillRect(gx,gy,1+Math.random()*1.5,1);}
    bx.strokeStyle='rgba(140,90,30,0.07)';bx.lineWidth=1;
    for(var pfy=0;pfy<h;pfy+=4){bx.beginPath();bx.moveTo(0,pfy+Math.random()*1.5-0.75);bx.lineTo(w,pfy+Math.random()*1.5-0.75);bx.stroke();}
    var pvg=bx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.22,w/2,h/2,Math.min(w,h)*0.82);
    pvg.addColorStop(0,'rgba(0,0,0,0)');pvg.addColorStop(1,'rgba(80,38,0,0.24)');
    bx.fillStyle=pvg;bx.fillRect(0,0,w,h);
    var fr=18;bx.strokeStyle='rgba(90,50,15,0.40)';bx.lineWidth=fr;bx.strokeRect(fr/2,fr/2,w-fr,h-fr);
    bx.strokeStyle='rgba(190,140,70,0.22)';bx.lineWidth=2;bx.strokeRect(fr+3,fr+3,w-fr*2-6,h-fr*2-6);
    bx.strokeStyle='rgba(210,165,95,0.12)';bx.lineWidth=1;bx.strokeRect(fr+6,fr+6,w-fr*2-12,h-fr*2-12);
  } else if(theme==='neon'){
    bx.fillStyle='#07071a';bx.fillRect(0,0,w,h);
    bx.strokeStyle='rgba(217,102,255,0.10)';bx.lineWidth=1;
    for(var nx=0;nx<w;nx+=40){bx.beginPath();bx.moveTo(nx,0);bx.lineTo(nx,h);bx.stroke();}
    for(var ny=0;ny<h;ny+=40){bx.beginPath();bx.moveTo(0,ny);bx.lineTo(w,ny);bx.stroke();}
    var ng=bx.createRadialGradient(w*0.2,h*0.2,0,w*0.2,h*0.2,w*0.6);ng.addColorStop(0,'rgba(217,102,255,0.07)');ng.addColorStop(1,'transparent');bx.fillStyle=ng;bx.fillRect(0,0,w,h);
  } else if(theme==='cyber'){
    bx.fillStyle='#010b16';bx.fillRect(0,0,w,h);
    bx.strokeStyle='rgba(56,189,248,0.09)';bx.lineWidth=1;
    for(var ccx=0;ccx<w;ccx+=36){bx.beginPath();bx.moveTo(ccx,0);bx.lineTo(ccx,h);bx.stroke();}
    for(var ccy=0;ccy<h;ccy+=36){bx.beginPath();bx.moveTo(0,ccy);bx.lineTo(w,ccy);bx.stroke();}
    var cg=bx.createRadialGradient(w,h,0,w,h,w*0.8);cg.addColorStop(0,'rgba(56,189,248,0.09)');cg.addColorStop(1,'transparent');bx.fillStyle=cg;bx.fillRect(0,0,w,h);
  } else if(theme==='academia'){
    bx.fillStyle='#1c1510';bx.fillRect(0,0,w,h);
    bx.fillStyle='rgba(180,140,60,0.07)';
    for(var adx=24;adx<w;adx+=44){for(var ady=24;ady<h;ady+=44){bx.beginPath();bx.arc(adx,ady,1.5,0,Math.PI*2);bx.fill();}}
  } else if(theme==='enchant'){
    bx.fillStyle='#0f0b1c';bx.fillRect(0,0,w,h);
    for(var ei=0;ei<90;ei++){var ex=Math.random()*w,ey=Math.random()*h,er2=0.5+Math.random()*1.8;bx.fillStyle='rgba(192,106,255,'+(0.08+Math.random()*0.35)+')';bx.beginPath();bx.arc(ex,ey,er2,0,Math.PI*2);bx.fill();}
    var eg=bx.createRadialGradient(w*0.3,h*0.35,0,w*0.3,h*0.35,w*0.65);eg.addColorStop(0,'rgba(192,106,255,0.07)');eg.addColorStop(1,'transparent');bx.fillStyle=eg;bx.fillRect(0,0,w,h);
  } else if(theme==='minimal'){
    bx.fillStyle='#f8f9fa';bx.fillRect(0,0,w,h);
    bx.strokeStyle='rgba(0,0,0,0.06)';bx.lineWidth=1;
    for(var mx=0;mx<w;mx+=32){bx.beginPath();bx.moveTo(mx,0);bx.lineTo(mx,h);bx.stroke();}
    for(var my=0;my<h;my+=32){bx.beginPath();bx.moveTo(0,my);bx.lineTo(w,my);bx.stroke();}
  } else if(theme==='oled'){
    bx.fillStyle='#000';bx.fillRect(0,0,w,h);
    bx.strokeStyle='rgba(255,255,255,0.025)';bx.lineWidth=1;
    for(var ox=0;ox<w;ox+=30){bx.beginPath();bx.moveTo(ox,0);bx.lineTo(ox,h);bx.stroke();}
    for(var oy=0;oy<h;oy+=30){bx.beginPath();bx.moveTo(0,oy);bx.lineTo(w,oy);bx.stroke();}
  } else {
    bx.fillStyle='#181820';bx.fillRect(0,0,w,h);
    bx.strokeStyle='rgba(255,255,255,0.04)';bx.lineWidth=1;
    for(var dx=0;dx<w;dx+=30){bx.beginPath();bx.moveTo(dx,0);bx.lineTo(dx,h);bx.stroke();}
    for(var dy=0;dy<h;dy+=30){bx.beginPath();bx.moveTo(0,dy);bx.lineTo(w,dy);bx.stroke();}
  }
}
function drawDiagram(){
  if(!dCtx||!dCanvas)return;
  var w=dCanvas.width,h=dCanvas.height;
  var theme=getDiagramTheme();
  dCtx.drawImage(getCachedDiagramBg(w,h,theme),0,0);
  // Connections
  diagramState.connections.forEach(function(c){
    var f=diagramState.nodes.find(function(n){return n.id===c.from;}),tn=diagramState.nodes.find(function(n){return n.id===c.to;});
    if(!f||!tn)return;
    var fi=diagramState.nodes.indexOf(f),ti=diagramState.nodes.indexOf(tn);
    drawDiagramConnection(c,f.x,f.y+getFloatY(fi),tn.x,tn.y+getFloatY(ti));
  });
  // Rubber-band when connecting
  if(diagramState.connecting&&diagramState._mousePos){
    var src=diagramState.nodes.find(function(n){return n.id===diagramState.connecting;});
    if(src){var si=diagramState.nodes.indexOf(src);dCtx.save();dCtx.setLineDash([6,4]);dCtx.strokeStyle='rgba(167,139,250,0.7)';dCtx.lineWidth=1.5;dCtx.beginPath();dCtx.moveTo(src.x,src.y+getFloatY(si));dCtx.lineTo(diagramState._mousePos.x,diagramState._mousePos.y);dCtx.stroke();dCtx.restore();}
  }
  // Nodes
  var isParch=theme==='parchment',isNeon=theme==='neon',isEnchant=theme==='enchant',isMinimal=theme==='minimal';
  diagramState.nodes.forEach(function(n,i){
    var fy=getFloatY(i),nx=n.x-n.w/2,ny=n.y-n.h/2+fy;
    var bc=n._h?'#a78bfa':(n._s?'#6d28d9':n.color);
    var tx=n.texture||'solid';
    dCtx.save();
    if(isNeon||isEnchant){dCtx.shadowColor=bc;dCtx.shadowBlur=22;}
    else if(isParch){dCtx.shadowColor='rgba(80,38,0,0.5)';dCtx.shadowBlur=10;dCtx.shadowOffsetX=3;dCtx.shadowOffsetY=4;}
    else{dCtx.shadowColor='rgba(0,0,0,0.5)';dCtx.shadowBlur=14;dCtx.shadowOffsetY=6;}
    dCtx.beginPath();dCtx.roundRect(nx,ny,n.w,n.h,10);
    dCtx.fillStyle=getNodeFill(bc,tx,nx,ny,n.w,n.h);dCtx.fill();dCtx.restore();
    if(n._s||n._h){dCtx.beginPath();dCtx.roundRect(nx,ny,n.w,n.h,10);dCtx.strokeStyle=n._h?'#c084fc':'#fff';dCtx.lineWidth=2;dCtx.stroke();}
    var fnt=isParch?'bold 13px Georgia,Times New Roman,serif':'600 13px Inter,system-ui,sans-serif';
    var tc=n.textColor||'#fff';
    if(isParch&&(tx==='paper'||tx==='marble'||tx==='solid'))tc='#2a1206';
    if(isMinimal)tc=n.textColor||'#1a1a1a';
    dCtx.font=fnt;dCtx.textAlign='center';dCtx.textBaseline='middle';dCtx.fillStyle=tc;
    var cy=n.y+fy;
    var wds=n.text.split(' ');
    if(wds.length===1||dCtx.measureText(n.text).width<n.w-16){dCtx.fillText(n.text,n.x,cy);}
    else{var mid=Math.ceil(wds.length/2);dCtx.fillText(wds.slice(0,mid).join(' '),n.x,cy-8);dCtx.fillText(wds.slice(mid).join(' '),n.x,cy+8);}
  });
}
function setDiagramTool(tool){diagramState.tool=tool;diagramState.connecting=null;diagramState._mousePos=null;diagramState.nodes.forEach(function(n){delete n._h;});stopDiagramFloat();renderDiagrams();}
function setDiagramTexture(tx){diagramState.nodeTexture=tx;renderDiagrams();}
function setDiagramConnStyle(style){diagramState.connStyle=style;renderDiagrams();}
function startDiagramFloat(){
  if(diagramState.floatAnimId)return;
  var _diagLastTs=0;
  function tick(ts){
    if(diagramState.floating&&dCanvas&&document.contains(dCanvas)){
      diagramState.floatAnimId=requestAnimationFrame(tick);
      if(!document.hidden&&(_powerMode==='max'||ts-_diagLastTs>=33)){_diagLastTs=ts;diagramState.floatTime=ts;drawDiagram();}
    }else{diagramState.floatAnimId=null;}
  }
  diagramState.floatAnimId=requestAnimationFrame(tick);
}
function stopDiagramFloat(){if(diagramState.floatAnimId){cancelAnimationFrame(diagramState.floatAnimId);diagramState.floatAnimId=null;}}
function toggleDiagramFloat(){diagramState.floating=!diagramState.floating;stopDiagramFloat();renderDiagrams();}
function drawDiagramConnection(c,x1,y1,x2,y2){
  var color=c.color||'#64748b',style=c.style||diagramState.connStyle||'curved';
  dCtx.save();dCtx.strokeStyle=color;dCtx.fillStyle=color;dCtx.lineWidth=2;
  var ang=Math.atan2(y2-y1,x2-x1);
  if(style==='straight'){
    dCtx.beginPath();dCtx.moveTo(x1,y1);dCtx.lineTo(x2,y2);dCtx.stroke();
  } else if(style==='curved'){
    var ddx=x2-x1,ddy=y2-y1,cxq=(x1+x2)/2-ddy*0.32,cyq=(y1+y2)/2+ddx*0.32;
    dCtx.beginPath();dCtx.moveTo(x1,y1);dCtx.quadraticCurveTo(cxq,cyq,x2,y2);dCtx.stroke();
    ang=Math.atan2(y2-cyq,x2-cxq);
  } else if(style==='dashed'){
    dCtx.setLineDash([10,6]);dCtx.beginPath();dCtx.moveTo(x1,y1);dCtx.lineTo(x2,y2);dCtx.stroke();dCtx.setLineDash([]);
  } else if(style==='dotted'){
    dCtx.setLineDash([2,7]);dCtx.lineWidth=2.5;dCtx.beginPath();dCtx.moveTo(x1,y1);dCtx.lineTo(x2,y2);dCtx.stroke();dCtx.setLineDash([]);
  } else if(style==='double'){
    var perp=ang+Math.PI/2,poff=3.5;dCtx.lineWidth=1.5;
    dCtx.beginPath();dCtx.moveTo(x1+Math.cos(perp)*poff,y1+Math.sin(perp)*poff);dCtx.lineTo(x2+Math.cos(perp)*poff,y2+Math.sin(perp)*poff);dCtx.stroke();
    dCtx.beginPath();dCtx.moveTo(x1-Math.cos(perp)*poff,y1-Math.sin(perp)*poff);dCtx.lineTo(x2-Math.cos(perp)*poff,y2-Math.sin(perp)*poff);dCtx.stroke();
  } else if(style==='wave'){
    var wlen=Math.sqrt((x2-x1)**2+(y2-y1)**2);
    dCtx.save();dCtx.translate(x1,y1);dCtx.rotate(ang);dCtx.beginPath();dCtx.moveTo(0,0);
    var wsteps=Math.max(24,Math.floor(wlen/5));
    for(var wi=1;wi<=wsteps;wi++){dCtx.lineTo((wi/wsteps)*wlen,Math.sin((wi/wsteps)*Math.PI*5.5)*6);}
    dCtx.stroke();dCtx.restore();
  } else if(style==='thunder'){
    var tlen=Math.sqrt((x2-x1)**2+(y2-y1)**2);
    dCtx.save();dCtx.translate(x1,y1);dCtx.rotate(ang);dCtx.lineWidth=2.5;dCtx.beginPath();dCtx.moveTo(0,0);
    var tsegs=8;
    for(var ti2=1;ti2<=tsegs;ti2++){dCtx.lineTo((ti2/tsegs)*tlen,ti2===tsegs?0:(ti2%2?11:-11));}
    dCtx.stroke();dCtx.restore();
  }
  // Arrowhead
  var ahx=x2-14*Math.cos(ang),ahy=y2-14*Math.sin(ang);
  dCtx.beginPath();dCtx.moveTo(x2,y2);dCtx.lineTo(ahx-7*Math.sin(ang),ahy+7*Math.cos(ang));dCtx.lineTo(ahx+7*Math.sin(ang),ahy-7*Math.cos(ang));dCtx.closePath();dCtx.fill();
  dCtx.restore();
}
function getNodeFill(color,texture,x,y,w,h){
  if(texture==='gradient'){var g=dCtx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,color);g.addColorStop(1,'rgba(255,255,255,0.25)');return g;}
  if(texture==='glass'){var gg=dCtx.createLinearGradient(x,y,x,y+h);gg.addColorStop(0,'rgba(255,255,255,0.42)');gg.addColorStop(0.48,color);gg.addColorStop(1,'rgba(0,0,0,0.28)');return gg;}
  if(texture==='solid')return color;
  var ps=16,pc=document.createElement('canvas');pc.width=ps;pc.height=ps;
  var p=pc.getContext('2d');p.fillStyle=color;p.fillRect(0,0,ps,ps);
  if(texture==='stripe'){
    p.strokeStyle='rgba(255,255,255,0.28)';p.lineWidth=1.5;
    p.beginPath();p.moveTo(0,ps);p.lineTo(ps,0);p.stroke();
    p.beginPath();p.moveTo(-ps/2,ps);p.lineTo(ps/2,0);p.stroke();
    p.beginPath();p.moveTo(ps/2,ps);p.lineTo(ps+ps/2,0);p.stroke();
  } else if(texture==='dots'){
    p.fillStyle='rgba(255,255,255,0.30)';
    p.beginPath();p.arc(4,4,2,0,Math.PI*2);p.fill();
    p.beginPath();p.arc(12,12,2,0,Math.PI*2);p.fill();
  } else if(texture==='grid'){
    p.strokeStyle='rgba(255,255,255,0.22)';p.lineWidth=1;
    p.beginPath();p.moveTo(8,0);p.lineTo(8,ps);p.stroke();
    p.beginPath();p.moveTo(0,8);p.lineTo(ps,8);p.stroke();
  } else if(texture==='wood'){
    for(var gi=0;gi<ps;gi+=3){
      p.strokeStyle='rgba(0,0,0,'+(0.14+gi/ps*0.22)+')';p.lineWidth=1;
      p.beginPath();p.moveTo(0,gi);p.lineTo(ps,gi+(gi%6<3?1:-1));p.stroke();
    }
    p.strokeStyle='rgba(255,220,130,0.22)';p.lineWidth=2;p.beginPath();p.moveTo(3,0);p.lineTo(3,ps);p.stroke();
  } else if(texture==='marble'){
    p.fillStyle='#e8e3df';p.fillRect(0,0,ps,ps);
    p.strokeStyle='rgba(90,80,100,0.40)';p.lineWidth=1;
    p.beginPath();p.moveTo(0,5);p.bezierCurveTo(5,9,11,3,16,7);p.stroke();
    p.strokeStyle='rgba(130,120,140,0.22)';p.lineWidth=0.7;
    p.beginPath();p.moveTo(0,13);p.bezierCurveTo(6,10,10,15,16,12);p.stroke();
  } else if(texture==='neon'){
    p.fillStyle='rgba(4,4,18,0.92)';p.fillRect(0,0,ps,ps);
    p.strokeStyle=color;p.lineWidth=2;p.strokeRect(1,1,ps-2,ps-2);
    p.strokeStyle=color.replace(/^(#[0-9a-f]{6})/i,'$1')+'44';p.lineWidth=4;p.strokeRect(0,0,ps,ps);
  } else if(texture==='paper'){
    p.fillStyle='#f4e8cc';p.fillRect(0,0,ps,ps);
    p.strokeStyle='rgba(140,90,30,0.13)';p.lineWidth=0.8;
    for(var li=0;li<ps;li+=4){p.beginPath();p.moveTo(0,li);p.lineTo(ps,li);p.stroke();}
  }
  return dCtx.createPattern(pc,'repeat');
}
function saveDiagram(){const name=document.getElementById('diagram-name').value||t('diag_untitled');diagramState.name=name;const d={id:diagramState.currentId||uid(),name,nodes:JSON.parse(JSON.stringify(diagramState.nodes)),connections:JSON.parse(JSON.stringify(diagramState.connections)),updatedAt:Date.now()};diagramState.currentId=d.id;Storage.saveDiagram(d);toast(t('toast_diagram_saved'),'success');checkAchievements();renderDiagrams();}
function loadDiagram(id){const d=Storage.getDiagrams().find(x=>x.id===id);if(!d)return;diagramState.nodes=JSON.parse(JSON.stringify(d.nodes||[]));diagramState.connections=JSON.parse(JSON.stringify(d.connections||[]));diagramState.currentId=d.id;diagramState.name=d.name;toast(t('toast_diagram_loaded',{name:d.name}),'info');renderDiagrams();}
function newDiagram(){diagramState.nodes=[];diagramState.connections=[];diagramState.currentId=null;diagramState.name=t('diag_untitled');renderDiagrams();}
function clearDiagram(){diagramState.nodes=[];diagramState.connections=[];drawDiagram();}
function deleteDiagramUI(id){Storage.deleteDiagram(id);if(diagramState.currentId===id)newDiagram();else renderDiagrams();toast(t('toast_diagram_deleted'),'info');}

