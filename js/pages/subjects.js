// ── Subjects ──────────────────────────────────────────────────────────────────
function renderSubjectsPage() {
  const totals=Storage.getSubjectTotals();
  document.getElementById('page-subjects').innerHTML='<div style="display:flex;flex-direction:column;gap:16px"><div class="section-header"><span class="section-title">'+t('subj_all')+'</span><span style="font-size:13px;color:var(--muted)">'+DEFAULT_SUBJECTS.length+' '+t('subj_topics_lbl')+'</span></div><div style="display:flex;flex-direction:column;gap:12px">'+DEFAULT_SUBJECTS.map(function(s){return renderSubjectCard(s,totals[s.id]||0,openSubjectId===s.id);}).join('')+'</div></div>';
}
function renderSubjectCard(s, loggedMins, expanded) {
  const td=s.topics.filter(t=>Storage.isTopicDone(t.id)).length;
  const pct=Math.min(100,Math.round(loggedMins/(s.targetHours*60)*100));
  const tp=Math.round(td/s.topics.length*100);
  const dl=daysUntil(s.examDate);
  const behind=isSubjectBehind(s.id,loggedMins);
  let html='<div class="card" style="border-left:3px solid '+(behind?'var(--red,#ef4444)':s.color)+'"><div style="display:flex;align-items:center;gap:12px;cursor:pointer" onclick="toggleSubjectExpand(\''+s.id+'\')"><span style="font-size:28px">'+s.icon+'</span><div style="flex:1"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:15px;font-weight:600">'+s.name+'</span>'+priorityBadge(s.priority)+(behind?'<span class="badge" style="background:var(--red,#ef4444)22;color:var(--red,#ef4444);font-size:11px;cursor:pointer;user-select:none" onclick="event.stopPropagation();showBehindSchedulePopup(event,\''+s.id+'\')">⚠️ '+t('subj_behind')+'</span>':'')+'<span class="badge badge-cyan">📅 '+(dl>=0?dl+t('subj_d_left'):t('subj_passed'))+'</span>'+(isSubjectInactive(s.id)?'<span class="badge" style="background:var(--bg3);color:var(--muted);font-size:11px">💤 '+t('subj_paused')+'</span>':'')+'</div><div style="font-size:12px;color:var(--muted);margin-top:2px">'+fmtMins(loggedMins)+' '+t('subj_logged')+' · '+t('subj_target')+' '+s.targetHours+'h · '+td+'/'+s.topics.length+' '+t('subj_topics_lbl')+'</div></div><div style="text-align:right;min-width:80px"><div style="font-size:20px;font-weight:700;color:'+s.color+'">'+pct+'%</div><div style="font-size:11px;color:var(--muted)">'+t('subj_hours_unit')+'</div></div><span style="font-size:18px;color:var(--muted);margin-left:4px">'+(expanded?'▲':'▼')+'</span></div>';
  html+='<div style="margin-top:10px"><div style="font-size:12px;color:var(--muted);margin-bottom:6px">'+t('subj_hours_topics',{h:pct,tp:tp})+'</div><div class="grid-2" style="gap:8px"><div><div style="font-size:11px;color:var(--muted);margin-bottom:3px">'+t('subj_hrs')+'</div><div class="progress-bar" style="display:flex;overflow:hidden">'+hoursBarSegments(s,loggedMins)+'</div>'+hoursLegend(s)+'</div><div><div style="font-size:11px;color:var(--muted);margin-bottom:3px">'+t('subj_topic_done')+'</div><div class="progress-bar"><div class="progress-fill" style="width:'+tp+'%;background:var(--green)"></div></div></div></div></div>';
  if(expanded){
    var disabledWarn=isBehindDisabled(s.id);
    var rv=Storage.getReview(); var todayStr=today();
    var topicNotes=Storage.getTopicNotes();
    var weeklyTargets=Storage.getWeeklyTargets();
    var weekMins=Storage.getWeekMinsForSubject(s.id);
    var wTarget=weeklyTargets[s.id]||0;
    var wPct=wTarget>0?Math.min(100,Math.round(weekMins/60/wTarget*100)):0;
    var subMistakes=Storage.getMistakes().filter(function(m){return m.subjectId===s.id;});
    html+='<div class="divider"></div>';
    if(disabledWarn)html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 12px;font-size:12px;color:var(--muted)"><span>⚠ '+t('behind_disabled_notice')+'</span><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();enableBehindBadge(\''+s.id+'\')" style="font-size:11px">'+t('behind_enable')+'</button></div>';
    // Weekly target row
    html+='<div style="display:flex;align-items:center;gap:10px;padding:8px 0;flex-wrap:wrap"><span style="font-size:12px;font-weight:600;color:var(--muted);white-space:nowrap">'+t('week_this_week')+':</span><span style="font-size:13px;font-weight:600;color:var(--primary-l)">'+(weekMins/60).toFixed(1)+'h</span><span style="font-size:12px;color:var(--muted)">/</span><input type="number" min="0" max="40" step="0.5" value="'+(wTarget||'')+'" placeholder="'+t('week_set_target')+'" style="width:60px;font-size:12px;padding:3px 6px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text)" onclick="event.stopPropagation()" onchange="event.stopPropagation();Storage.setWeeklyTarget(\''+s.id+'\',this.value)" title="Weekly target hours"><span style="font-size:11px;color:var(--muted)">h/week</span>'+(wTarget>0?'<div class="progress-bar" style="flex:1;min-width:60px"><div class="progress-fill" style="width:'+wPct+'%;background:'+s.color+'"></div></div><span style="font-size:11px;color:var(--muted)">'+wPct+'%</span>':'')+'</div>';
    // Active in study plan toggle
    html+='<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:12px;flex-wrap:wrap"><span style="font-weight:600;color:var(--muted)">📅 '+t('subj_in_plan')+'</span><button class="btn '+(isSubjectInactive(s.id)?'btn-outline':'btn-primary')+' btn-xs" style="margin-left:auto" onclick="event.stopPropagation();setSubjectActive(\''+s.id+'\','+isSubjectInactive(s.id)+')">'+(isSubjectInactive(s.id)?'💤 '+t('subj_paused'):'✓ '+t('subj_in_plan'))+'</button></div>';
    // Prior (pre-tracking) hours + bulk topic completion
    html+='<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:12px;flex-wrap:wrap"><span style="font-weight:600;color:var(--muted)">📚 '+t('subj_prior')+'</span><input type="number" min="0" step="0.5" value="'+(Storage.get('mt_prior_hours_'+s.id,0)||'')+'" placeholder="0" style="width:64px;font-size:12px;padding:3px 6px;border-radius:6px;border:1px solid var(--border);background:var(--bg3);color:var(--text)" onclick="event.stopPropagation()" onchange="event.stopPropagation();setPriorHoursUI(\''+s.id+'\',this.value)"><span style="font-size:11px;color:var(--muted)">h</span><button class="btn btn-outline btn-xs" style="margin-left:auto" onclick="event.stopPropagation();markAllTopicsUI(\''+s.id+'\',true)">✓ '+t('subj_mark_all')+'</button><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();markAllTopicsUI(\''+s.id+'\',false)" title="'+t('subj_undo_all')+'">↩</button></div>';
    // Topics
    html+='<div><div style="font-size:13px;font-weight:600;margin-bottom:8px">'+t('subj_topics')+'</div><div class="topic-list">'+s.topics.map(function(tp2){const done=Storage.isTopicDone(tp2.id);var rst=topicReviewState(tp2.id);var tmins=getTopicMins(s.id,tp2.name);var revBadge='';var revBtn=rst?'<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();removeFromReview(\''+tp2.id+'\')" title="'+t('review_remove')+'">'+(rst==='reviewed'?'<span style="color:var(--green)">✓</span>':'<span class="cog-spin">⚙️</span>')+'</button>':'<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();sendToReview(\''+tp2.id+'\')" title="'+t('review_send')+'" style="color:var(--muted)">🔄</button>';var hasNote=!!topicNotes[tp2.id];return '<div class="topic-row" onclick="toggleTopicUI(\''+tp2.id+'\',\''+s.id+'\')"><div class="topic-check '+(done?'done':'')+'">'+( done?'✓':'')+'</div><span class="topic-name '+(done?'done':'')+'" style="flex:1">'+tTopic(tp2.id,tp2.name)+'</span>'+(tmins>0?'<span style="font-size:11px;color:var(--muted);white-space:nowrap;margin-right:2px">⏱ '+fmtMins(tmins)+'</span>':'')+revBadge+revBtn+'<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();openTopicNoteModal(\''+tp2.id+'\',\''+tp2.name.replace(/'/g,"\\'")+'\')" title="'+t('note_title')+'" style="color:'+(hasNote?'var(--primary-l)':'var(--muted)')+'">📝</button><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();startTimerForTopic(\''+s.id+'\',\''+tp2.name+'\')" title="Study this">▶</button></div>';}).join('')+'</div></div>';
    var _rv=s.topics.filter(function(tp3){return topicReviewState(tp3.id);});
    if(_rv.length){
      html+='<div class="divider"></div><div style="font-size:13px;font-weight:600;margin-bottom:8px">🔄 '+t('review_list')+'</div><div style="display:flex;flex-direction:column;gap:6px">';
      _rv.forEach(function(tp3){var st=topicReviewState(tp3.id);var ic=st==='reviewed'?'<span style="color:var(--green);font-size:16px">✓</span>':'<span class="cog-spin" style="font-size:15px">⚙️</span>';html+='<div style="display:flex;align-items:center;gap:8px;padding:3px 0"><span style="width:18px;text-align:center">'+ic+'</span><span style="flex:1;font-size:13px'+(st==='reviewed'?';color:var(--muted);text-decoration:line-through':'')+'">'+tTopic(tp3.id,tp3.name)+'</span>'+(getTopicMins(s.id,tp3.name)>0?'<span style="font-size:11px;color:var(--muted);margin-right:4px">⏱ '+fmtMins(getTopicMins(s.id,tp3.name))+'</span>':'')+(st==='reviewed'?'<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();reopenReview(\''+tp3.id+'\')" title="'+t('review_reopen')+'">↩</button>':'<button class="btn btn-outline btn-xs" onclick="event.stopPropagation();markTopicReviewed(\''+tp3.id+'\')">✓ '+t('review_done')+'</button>')+'<button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();removeFromReview(\''+tp3.id+'\')" title="'+t('review_remove')+'">✕</button></div>';});
      html+='</div>';
    }
    // Mistake log
    html+='<div class="divider"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:13px;font-weight:600">'+t('mistake_section')+'</span><button class="btn btn-outline btn-xs" onclick="event.stopPropagation();openMistakeModal(\''+s.id+'\')">+ '+t('mistake_log_btn')+'</button></div>';
    if(subMistakes.length===0){html+='<div style="font-size:12px;color:var(--muted);padding:4px 0">'+t('mistake_none')+'</div>';}
    else{html+=subMistakes.slice(0,5).map(function(m){return '<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-size:12px">'+escHtml(m.note)+'</div>'+(m.topic?'<div style="font-size:11px;color:var(--muted)">'+escHtml(m.topic)+'</div>':'')+'<div style="font-size:10px;color:var(--muted)">'+m.date+'</div></div><button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();deleteMistakeUI(\''+m.id+'\',\''+s.id+'\')">✕</button></div>';}).join('');}
  }
  html+='</div>';
  return html;
}
function toggleSubjectExpand(id) { openSubjectId=(openSubjectId===id)?null:id; renderSubjectsPage(); }
function toggleTopicUI(tid, sid) { const done=Storage.toggleTopic(tid); toast(t(done?'toast_topic_done':'toast_topic_undone'),done?'success':'info'); checkAchievements(); renderSubjectsPage(); }
function startTimerForTopic(sid, topic) { timerState.selectedSubjectId=sid; timerState.selectedTopic=topic; navigate('timer'); }
function markTopicForReview(tid) { Storage.markReview(tid,1); toast('📌 '+t('sr_mark_review'),'info'); renderSubjectsPage(); }
function topicReviewed(tid) {
  var rv=Storage.getReview(); var cur=rv[tid]||{interval:1};
  var INTERVALS=[1,3,7,14,30];
  var next=INTERVALS.find(function(i){return i>cur.interval;})||0;
  if(next>0)Storage.markReview(tid,next); else Storage.unmarkReview(tid);
  toast('✅ '+t('sr_due_today'),'success'); renderSubjectsPage();
}
function unmarkTopicReview(tid) { Storage.unmarkReview(tid); renderSubjectsPage(); }
function getDueCount() { return Storage.getDueTopics().length; }
// ── Review board (manual refocus list; replaces the old spaced-rep 📌) ──
function getReviewMap(){ return Storage.get('mt_review_state', {}); }
// Total tracked minutes on a specific topic (sessions tagged with that topic name).
function getTopicMins(sid, topicName){ return Storage.getSessions().reduce(function(a,x){ return (x.subjectId===sid && x.topic===topicName)?a+x.duration:a; }, 0); }
// Two-segment hours bar: striped "head start" portion + solid tracked portion.
function hoursBarSegments(s, loggedMins){
  var tgt=s.targetHours*60;
  var hsMins=Storage.get('mt_prior_hours_'+s.id,0)*60;
  var hsPct=tgt>0?Math.min(100, hsMins/tgt*100):0;
  var trPct=tgt>0?Math.min(100-hsPct, Math.max(0,loggedMins-hsMins)/tgt*100):0;
  var stripe='repeating-linear-gradient(45deg,'+s.color+'66 0,'+s.color+'66 5px,'+s.color+'22 5px,'+s.color+'22 10px)';
  var hs=hsPct>0?'<div title="'+t('subj_prior')+'" style="width:'+hsPct+'%;height:100%;background:'+stripe+'"></div>':'';
  return hs+'<div style="width:'+trPct+'%;height:100%;background:'+s.color+'"></div>';
}
function hoursLegend(s){
  var hsH=Storage.get('mt_prior_hours_'+s.id,0);
  if(!hsH) return '';
  var stripe='repeating-linear-gradient(45deg,'+s.color+'66 0,'+s.color+'66 3px,'+s.color+'22 3px,'+s.color+'22 6px)';
  return '<div style="font-size:10px;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:5px"><span style="display:inline-block;width:12px;height:8px;border-radius:2px;background:'+stripe+'"></span>'+t('subj_prior')+' '+hsH+'h</div>';
}
function topicReviewState(tid){ return getReviewMap()[tid] || null; }
function _setReview(tid, state){ var m=getReviewMap(); if(state)m[tid]=state; else delete m[tid]; Storage.set('mt_review_state', m); if(currentPage==='subjects')renderSubjectsPage(); else if(currentPage==='dashboard')renderDashboard(); }
function sendToReview(tid){ _setReview(tid,'reviewing'); toast('🔄 '+t('review_added'),'info'); }
function markTopicReviewed(tid){ _setReview(tid,'reviewed'); toast('✓ '+t('review_done'),'success'); }
function reopenReview(tid){ _setReview(tid,'reviewing'); }
function removeFromReview(tid){ _setReview(tid,null); }
function renderReviewWidget(){
  var m=getReviewMap(); var items=[];
  DEFAULT_SUBJECTS.forEach(function(s){ s.topics.forEach(function(tp){ if(m[tp.id]) items.push({s:s,tp:tp,st:m[tp.id]}); }); });
  if(items.length===0) return '';
  var reviewing=items.filter(function(i){return i.st==='reviewing';}).length;
  var h='<div class="card" style="border-color:var(--primary)"><div class="section-header"><span class="section-title">🔄 '+t('dash_review_title')+'</span><span style="font-size:13px;color:var(--muted)">'+reviewing+' '+t('dash_reviewing')+'</span></div><div style="display:flex;flex-direction:column;gap:6px">';
  items.forEach(function(i){ var ic=i.st==='reviewed'?'<span style="color:var(--green);font-size:16px">✓</span>':'<span class="cog-spin" style="font-size:15px">⚙️</span>'; h+='<div style="display:flex;align-items:center;gap:8px;padding:3px 0"><span style="width:18px;text-align:center">'+ic+'</span><span style="width:8px;height:8px;border-radius:50%;background:'+i.s.color+';flex-shrink:0"></span><div style="flex:1"><div style="font-size:13px'+(i.st==='reviewed'?';color:var(--muted);text-decoration:line-through':'')+'">'+tTopic(i.tp.id,i.tp.name)+'</div><div style="font-size:11px;color:var(--muted)">'+i.s.shortName+(getTopicMins(i.s.id,i.tp.name)>0?' · ⏱ '+fmtMins(getTopicMins(i.s.id,i.tp.name)):'')+'</div></div>'+(i.st==='reviewed'?'<button class="btn btn-ghost btn-xs" onclick="reopenReview(\''+i.tp.id+'\')" title="'+t('review_reopen')+'">↩</button>':'<button class="btn btn-outline btn-xs" onclick="markTopicReviewed(\''+i.tp.id+'\')">✓ '+t('review_done')+'</button>')+'<button class="btn btn-ghost btn-xs" onclick="removeFromReview(\''+i.tp.id+'\')" title="'+t('review_remove')+'">✕</button></div>'; });
  h+='</div></div>';
  return h;
}

