// ── Analytics ─────────────────────────────────────────────────────────────────
function renderAnalytics() {
  const sessions=Storage.getSessions();
  const totals=Storage.getSubjectTotals();
  const totalMins=Object.values(totals).reduce((a,b)=>a+b,0);
  const last14=Storage.getLast14();
  const hm=Storage.getHeatmap(6);
  const streak=Storage.getStreak();

  document.getElementById('page-analytics').innerHTML=
  '<div style="display:flex;flex-direction:column;gap:20px">'+
  '<div class="grid-4">'+
  '<div class="card card-sm"><div class="card-title">'+t('ana_total_time')+'</div><div class="stat-row"><span class="stat-main">'+Math.floor(totalMins/60)+'</span><span class="stat-unit">h '+totalMins%60+'m</span></div></div>'+
  '<div class="card card-sm"><div class="card-title">'+t('ana_sessions')+'</div><div class="stat-row"><span class="stat-main">'+sessions.length+'</span><span class="stat-unit"> '+t('dash_sessions_lbl').trim()+'</span></div></div>'+
  '<div class="card card-sm"><div class="card-title">'+t('ana_best_streak')+'</div><div class="stat-row"><span class="stat-main">'+streak.longest+'</span><span class="stat-unit">'+t('dash_days')+'</span></div></div>'+
  '<div class="card card-sm"><div class="card-title">'+t('ana_most_studied')+'</div><div style="font-size:15px;font-weight:600;margin-top:4px">'+getMostStudied(totals)+'</div></div>'+
  '</div>'+
  '<div class="card"><div class="section-header"><span class="section-title">'+t('ana_14days')+'</span></div><div style="position:relative;height:220px"><canvas id="chart-14days"></canvas></div></div>'+
  '<div class="grid-2">'+
  '<div class="card"><div class="section-header"><span class="section-title">'+t('ana_per_sub')+'</span></div>'+(Object.keys(totals).length===0?'<div class="empty-state"><div class="empty-icon">📊</div><p>'+t('ana_no_data')+'</p></div>':'<canvas id="chart-subjects" height="200"></canvas>')+'</div>'+
  '<div class="card"><div class="section-header"><span class="section-title">'+t('ana_phase_prog')+'</span></div>'+
  STUDY_PHASES.map(function(p){const ps=new Date(p.start),pe=new Date(p.end),now=new Date();let pct=0;if(now>=pe)pct=100;else if(now>ps)pct=Math.round((now-ps)/(pe-ps)*100);const act=today()>=p.start&&today()<=p.end;return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:13px;font-weight:'+(act?700:400)+'">'+p.name+(act?' '+t('ana_now'):'')+'</span><span style="font-size:12px;color:var(--muted)">'+pct+'%</span></div><div class="progress-bar progress-bar-lg"><div class="progress-fill" style="width:'+pct+'%;background:'+p.color+'"></div></div><div style="font-size:11px;color:var(--muted);margin-top:3px">'+fmtDate(p.start)+' → '+fmtDate(p.end)+'</div></div>';}).join('')+
  '</div>'+
  '</div>'+
  '<div class="card"><div class="section-header"><span class="section-title">'+t('ana_heatmap')+'</span></div>'+renderHeatmap(hm)+'</div>'+
  renderScoreTrackerCard()+
  '<div class="card"><div class="section-header"><span class="section-title">'+t('ana_all_sessions')+'</span><span style="font-size:13px;color:var(--muted)">'+sessions.length+' '+t('ana_total')+'</span></div>'+
  '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">'+
  '<input class="input" id="sf-search" placeholder="'+t('sess_filter_search')+'" value="'+escHtml(sessionFilter.search)+'" oninput="applySessionFilter()" style="max-width:220px">'+
  '<select class="input" id="sf-subject" onchange="applySessionFilter()" style="max-width:180px;width:auto"><option value="">'+t('dash_choose')+'</option>'+DEFAULT_SUBJECTS.map(function(s){return '<option value="'+s.id+'"'+(sessionFilter.subject===s.id?' selected':'')+'>'+s.icon+' '+s.shortName+'</option>';}).join('')+'</select>'+
  '<input type="date" class="input" id="sf-from" value="'+sessionFilter.dateFrom+'" onchange="applySessionFilter()" title="'+t('sess_filter_from')+'" style="max-width:150px">'+
  '<input type="date" class="input" id="sf-to" value="'+sessionFilter.dateTo+'" onchange="applySessionFilter()" title="'+t('sess_filter_to')+'" style="max-width:150px">'+
  '<button class="btn btn-ghost btn-sm" onclick="sessionFilter={subject:\'\',search:\'\',dateFrom:\'\',dateTo:\'\'};renderAnalytics()">'+t('sess_reset')+'</button>'+
  '</div>'+
  '<div id="session-table-wrap">'+renderSessionTable()+'</div>'+
  '</div></div>';

  var scores=Storage.getScores().slice().sort(function(a,b){return a.date.localeCompare(b.date);});
  setTimeout(function(){ renderBarChart(last14); if(Object.keys(totals).length>0)renderSubjectChart(totals); if(scores.length>0)renderScoreChart(scores); }, 50);
}
function renderSessionTable() {
  var all=Storage.getSessions();
  if(all.length===0)return '<div class="empty-state"><div class="empty-icon">📋</div><p>'+t('ana_no_sessions')+'</p></div>';
  var f=sessionFilter;
  var filtered=all.filter(function(s){
    if(f.subject&&s.subjectId!==f.subject)return false;
    if(f.search){var q=f.search.toLowerCase(),sub=getSubject(s.subjectId);if(!(s.topic||'').toLowerCase().includes(q)&&!(s.notes||'').toLowerCase().includes(q)&&!(sub?sub.shortName:'').toLowerCase().includes(q))return false;}
    if(f.dateFrom&&s.date<f.dateFrom)return false;
    if(f.dateTo&&s.date>f.dateTo)return false;
    return true;
  });
  if(filtered.length===0)return '<div class="empty-state"><p>'+t('sess_no_match')+'</p></div>';
  var shown=filtered.slice(0,100);
  return '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">'+t('sess_showing')+' '+shown.length+' '+t('sess_of')+' '+filtered.length+'</div>'+
    '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--muted);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:8px 10px">'+t('ana_col_date')+'</th><th style="text-align:left;padding:8px 10px">'+t('ana_col_subject')+'</th><th style="text-align:left;padding:8px 10px">'+t('ana_col_topic')+'</th><th style="text-align:left;padding:8px 10px">'+t('ana_col_duration')+'</th><th style="text-align:left;padding:8px 10px">'+t('ana_col_notes')+'</th><th style="padding:8px 10px"></th></tr></thead><tbody>'+
    shown.map(function(s){var sub=getSubject(s.subjectId);var notesHtml=s.notes?renderNotes(s.notes):'—';return '<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 10px">'+fmtDate(s.date)+'</td><td style="padding:8px 10px"><span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:'+(sub?sub.color:'#666')+';display:inline-block"></span>'+(sub?sub.shortName:s.subjectId)+'</span></td><td style="padding:8px 10px;color:var(--muted)">'+(s.topic||'—')+'</td><td style="padding:8px 10px;font-weight:600;color:var(--cyan)">'+fmtMins(s.duration)+'</td><td style="padding:8px 10px;max-width:220px"><div class="notes-rendered">'+notesHtml+'</div></td><td style="padding:8px 10px"><button class="btn btn-ghost btn-xs" onclick="deleteSessionUI(\''+s.id+'\')">✕</button></td></tr>';}).join('')+
    '</tbody></table></div>';
}
function applySessionFilter() {
  sessionFilter.subject=(document.getElementById('sf-subject')||{value:''}).value;
  sessionFilter.search=(document.getElementById('sf-search')||{value:''}).value;
  sessionFilter.dateFrom=(document.getElementById('sf-from')||{value:''}).value;
  sessionFilter.dateTo=(document.getElementById('sf-to')||{value:''}).value;
  var wrap=document.getElementById('session-table-wrap'); if(wrap)wrap.innerHTML=renderSessionTable();
}
function getMostStudied(t) { if(!Object.keys(t).length)return '—'; const id=Object.keys(t).reduce((a,b)=>t[a]>t[b]?a:b); return getSubject(id)?getSubject(id).shortName:id; }
function renderHeatmap(data) {
  const entries=Object.entries(data).sort(([a],[b])=>a.localeCompare(b));
  if(!entries.length)return '<div class="empty-state"><p>'+t('heatmap_empty')+'</p></div>';
  const maxV=Math.max.apply(null,entries.map(function(e){return e[1];}).concat([1]));
  function gc(v){if(!v)return'var(--bg3)';const i=v/maxV;return i<.25?'#4c1d95':i<.5?'#6d28d9':i<.75?'#7c3aed':'#a78bfa';}
  const cells=[];
  const fd=new Date(entries[0][0]+'T00:00:00');
  const dow=(fd.getDay()+6)%7;
  for(let i=0;i<dow;i++)cells.push({date:null,mins:0});
  entries.forEach(function(e){cells.push({date:e[0],mins:e[1]});});
  while(cells.length%7!==0)cells.push({date:null,mins:0});
  const weeks=[];for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
  var lang=Storage.getSettings().lang||'en';
  var dl=(STRINGS[lang]&&STRINGS[lang].heatmap_days)||STRINGS.en.heatmap_days;
  return '<div style="overflow-x:auto"><div style="display:flex;gap:6px"><div style="display:flex;flex-direction:column;gap:2px;padding-top:18px">'+dl.map(d=>'<span style="font-size:10px;color:var(--muted);height:14px;line-height:14px;width:28px">'+d+'</span>').join('')+'</div><div><div style="display:flex;gap:2px;margin-bottom:4px">'+weeks.map(function(w,wi){const fr=w.find(c=>c.date);let lb='';if(fr&&(wi===0||new Date(fr.date).getDate()<=7))lb=new Date(fr.date+'T00:00:00').toLocaleDateString('en',{month:'short'});return '<div style="width:14px;font-size:10px;color:var(--muted);text-align:center">'+lb+'</div>';}).join('')+'</div><div style="display:flex;gap:2px">'+weeks.map(function(w){return '<div style="display:flex;flex-direction:column;gap:2px">'+w.map(function(c){return c.date?'<div class="heatmap-cell" style="background:'+gc(c.mins)+'" title="'+c.date+': '+fmtMins(c.mins)+'"></div>':'<div style="width:14px;height:14px"></div>';}).join('')+'</div>';}).join('')+'</div></div></div><div style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:11px;color:var(--muted)"><span>'+t('heatmap_less')+'</span>'+['var(--bg3)','#4c1d95','#6d28d9','#7c3aed','#a78bfa'].map(c=>'<div style="width:12px;height:12px;border-radius:2px;background:'+c+'"></div>').join('')+'<span>'+t('heatmap_more')+'</span></div></div>';
}
function renderBarChart(last14) {
  const c=document.getElementById('chart-14days'); if(!c||!window.Chart)return;
  const e=Chart.getChart(c); if(e)e.destroy();
  var _cs=getComputedStyle(document.documentElement);var _pc=(_cs.getPropertyValue('--primary')||'#7c3aed').trim();var _pl=(_cs.getPropertyValue('--primary-l')||'#a78bfa').trim();var _mt=(_cs.getPropertyValue('--muted')||'#64748b').trim();
  new Chart(c,{type:'bar',data:{labels:last14.map(function(d){return new Date(d.date+'T00:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'});}),datasets:[{label:'Minutes',data:last14.map(d=>d.minutes),backgroundColor:_pc+'80',borderColor:_pc,borderWidth:1,borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{ticks:{color:_mt,callback:function(v){return fmtMins(v);}},grid:{color:'rgba(255,255,255,.05)'}},x:{ticks:{color:_mt,maxRotation:45},grid:{display:false}}}}});
}
function renderSubjectChart(totals) {
  const c=document.getElementById('chart-subjects'); if(!c||!window.Chart)return;
  const e=Chart.getChart(c); if(e)e.destroy();
  const ss=Object.entries(totals).map(function(x){return {s:getSubject(x[0]),m:x[1]};}).filter(x=>x.s);
  new Chart(c,{type:'doughnut',data:{labels:ss.map(x=>x.s.shortName),datasets:[{data:ss.map(x=>x.m),backgroundColor:ss.map(x=>x.s.color),borderWidth:2,borderColor:'var(--bg2)'}]},options:{responsive:true,plugins:{legend:{position:'right',labels:{color:(getComputedStyle(document.documentElement).getPropertyValue('--text')||'#e2e8f0').trim(),font:{size:12},padding:12}},tooltip:{callbacks:{label:function(ctx){return ' '+fmtMins(ctx.raw);}}}}}});
}

// ── Exam Score Tracker ────────────────────────────────────────────────────────
function renderScoreTrackerCard() {
  var scores = Storage.getScores().slice().sort(function(a,b){return a.date.localeCompare(b.date);});
  var html = '<div class="card"><div class="section-header"><span class="section-title">📊 '+t('score_title')+'</span><button class="btn btn-primary btn-sm" onclick="openAddScoreModal()">'+t('score_add')+'</button></div>';
  if (scores.length === 0) {
    html += '<div class="empty-state" style="padding:16px 0"><p>'+t('score_no_scores')+'</p></div>';
  } else {
    html += '<div style="position:relative;height:180px;margin-bottom:16px"><canvas id="chart-scores"></canvas></div>';
    html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:var(--muted);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:8px 10px">'+t('score_date')+'</th><th style="text-align:left;padding:8px 10px">'+t('score_test_name')+'</th><th style="text-align:left;padding:8px 10px">'+t('score_subject')+'</th><th style="text-align:right;padding:8px 10px">'+t('score_score')+'</th><th style="padding:8px 10px"></th></tr></thead><tbody>';
    scores.slice().reverse().forEach(function(s){
      var sub=s.subjectId?getSubject(s.subjectId):null;
      var col=s.score>=70?'var(--green,#22c55e)':s.score>=50?'var(--yellow,#eab308)':'var(--red,#ef4444)';
      html+='<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 10px">'+fmtDate(s.date)+'</td><td style="padding:8px 10px;font-weight:500">'+escHtml(s.testName)+'</td><td style="padding:8px 10px">'+(sub?'<span style="color:'+sub.color+'">'+sub.icon+' '+sub.shortName+'</span>':'—')+'</td><td style="padding:8px 10px;text-align:right;font-weight:700;color:'+col+'">'+s.score+'%</td><td style="padding:8px 10px"><button class="btn btn-ghost btn-xs" onclick="deleteScoreUI(\''+s.id+'\')">✕</button></td></tr>';
    });
    html += '</tbody></table></div>';
  }
  return html+'</div>';
}
function renderScoreChart(scores) {
  var c=document.getElementById('chart-scores'); if(!c||!window.Chart)return;
  var e=Chart.getChart(c); if(e)e.destroy();
  var bySubject={};
  scores.forEach(function(s){var k=s.subjectId||'__none__';if(!bySubject[k])bySubject[k]=[];bySubject[k].push(s);});
  var allLabels=[...new Set(scores.map(function(s){return s.date;}))].sort();
  var datasets=Object.keys(bySubject).map(function(k){
    var sub=k!=='__none__'?getSubject(k):null;
    var col=sub?sub.color:'#a78bfa';
    var map={};bySubject[k].forEach(function(s){map[s.date]=s.score;});
    return {label:sub?(sub.icon+' '+sub.shortName):'Other',data:allLabels.map(function(d){return map[d]!==undefined?map[d]:null;}),borderColor:col,backgroundColor:col+'33',tension:0.3,pointRadius:4,spanGaps:true,fill:false};
  });
  new Chart(c,{type:'line',data:{labels:allLabels.map(function(d){return new Date(d+'T00:00:00').toLocaleDateString('en',{month:'short',day:'numeric'});}),datasets:datasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:(getComputedStyle(document.documentElement).getPropertyValue('--text')||'#e2e8f0').trim(),font:{size:11}}}},scales:{y:{min:0,max:100,ticks:{color:'#64748b',callback:function(v){return v+'%';}},grid:{color:'rgba(255,255,255,.05)'}},x:{ticks:{color:'#64748b',maxRotation:30},grid:{display:false}}}}});
}
function openAddScoreModal() {
  var o=document.createElement('div'); o.className='modal-overlay fade-in'; o.id='add-score-modal';
  o.innerHTML='<div class="modal-box">'+
    '<div class="modal-title">'+t('score_modal_title')+'</div>'+
    '<div class="form-group"><label class="label">'+t('score_test_name')+'</label><input class="input" id="score-name" placeholder="'+t('score_test_ph')+'"></div>'+
    '<div class="grid-2" style="gap:10px">'+
    '<div class="form-group"><label class="label">'+t('score_subject')+'</label><select class="input" id="score-subj"><option value="">— '+t('modal_none')+' —</option>'+DEFAULT_SUBJECTS.map(function(s){return '<option value="'+s.id+'">'+s.icon+' '+s.shortName+'</option>';}).join('')+'</select></div>'+
    '<div class="form-group"><label class="label">'+t('score_date')+'</label><input type="date" class="input" id="score-date" value="'+today()+'"></div>'+
    '</div>'+
    '<div class="form-group"><label class="label">'+t('score_score')+' (0–100)</label><input type="number" class="input" id="score-val" min="0" max="100" placeholder="85"></div>'+
    '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModal(\'add-score-modal\')">'+t('btn_cancel')+'</button><button class="btn btn-primary" onclick="submitAddScore()">'+t('score_save')+'</button></div>'+
  '</div>';
  o.addEventListener('click',function(e){if(e.target===o)closeModal('add-score-modal');});
  document.body.appendChild(o);
}
function submitAddScore() {
  var name=(document.getElementById('score-name')||{}).value||'';
  var val=parseFloat((document.getElementById('score-val')||{}).value);
  if(!name.trim()){toast(t('score_enter_name'),'warning');return;}
  if(isNaN(val)||val<0||val>100){toast(t('score_enter_valid'),'warning');return;}
  Storage.addScore({id:uid(),testName:name.trim(),subjectId:document.getElementById('score-subj').value||'',score:Math.round(val),date:document.getElementById('score-date').value||today(),ts:Date.now()});
  closeModal('add-score-modal'); toast(t('score_saved'),'success'); renderAnalytics();
}
function deleteScoreUI(id) { Storage.deleteScore(id); toast(t('score_deleted'),'info'); renderAnalytics(); }

