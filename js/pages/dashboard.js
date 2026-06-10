// ── Dashboard section visibility ──────────────────────────────────────────────
var DASH_SEC_LABELS = {
  stats:        '📊 Stats',
  exams:        '⏳ Countdowns',
  sub_exams:    '📅 Subjects',
  weekly:       '📈 Weekly',
  schedule:     '📅 Schedule',
  sr_due:       '⏰ Due',
  quick_log:    '⚡ Log',
  recent:       '🕐 Recent',
  progress:     '📊 Progress',
  achievements: '🏆 Badges',
};

function getDashHidden() { return Storage.get('mt_dash_hidden', {}); }

function toggleDashSection(id) {
  var h = getDashHidden();
  var el = document.getElementById('ds-' + id);
  var isDetective = document.body.classList.contains('detective-active');
  var stringSections = { exams:1, sub_exams:1 }; // sections with string connections
  if (h[id]) {
    // SHOW: slide in from right
    delete h[id];
    Storage.set('mt_dash_hidden', h);
    if (el) {
      el.style.display = '';
      el.style.transition = 'none';
      el.classList.add('dash-shelving');
      el.offsetHeight;
      el.style.transition = '';
      requestAnimationFrame(function() { el.classList.remove('dash-shelving'); });
    }
    if (isDetective && stringSections[id]) _animateStringReconnect();
  } else {
    // HIDE: slide out to right
    h[id] = true;
    Storage.set('mt_dash_hidden', h);
    if (isDetective && stringSections[id]) _animateStringTear(id);
    if (el) {
      el.classList.add('dash-shelving');
      setTimeout(function() {
        el.style.display = 'none';
        el.classList.remove('dash-shelving');
      }, 420);
    }
  }
  updateDashShelfBar();
}

function updateDashShelfBar() {
  var h = getDashHidden();
  var bar = document.getElementById('dash-shelf-bar');
  if (!bar) return;
  var ids = Object.keys(h);
  if (!ids.length) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = ids.map(function(id) {
    var lbl = DASH_SEC_LABELS[id] || id;
    return '<div class="dash-shelf-tab" onclick="toggleDashSection(\'' + id + '\')" title="Show ' + lbl + '">'+
      '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">'+
        '<span class="tab-arrow">←</span>'+
        '<span class="tab-label">' + lbl + '</span>'+
      '</div>'+
    '</div>';
  }).join('') +
  '<button id="dash-reset-btn" onclick="resetDashLayout()" title="Show all">↺ all</button>';
}

function applyDashShelfState() {
  var h = getDashHidden();
  Object.keys(DASH_SEC_LABELS).forEach(function(id) {
    var el = document.getElementById('ds-' + id);
    if (!el) return;
    el.style.display = h[id] ? 'none' : '';
    el.classList.remove('dash-shelving');
  });
  updateDashShelfBar();
}

function resetDashLayout() {
  Storage.set('mt_dash_hidden', {});
  applyDashShelfState();
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const streak   = Storage.getStreak();
  const settings = getSettings();
  const todayMins= Storage.getTodayMins();
  const goalMins = settings.dailyGoalMinutes;
  const goalPct  = Math.min(100, Math.round(todayMins/goalMins*100));
  const sessions = Storage.getSessions().slice(0,5);
  const totals   = Storage.getSubjectTotals();
  const phase    = getCurrentPhase();
  const totalH   = Math.floor(Object.values(totals).reduce((a,b)=>a+b,0)/60);

  // Wrap a section with its stable ID and injected 👁 hide button
  function sec(id, html) {
    var hideBtn = '<button class="dash-hide-btn" onclick="event.stopPropagation();toggleDashSection(\''+id+'\')" title="Hide section">👁</button>';
    // Inject after first section-title span
    var injected = html.replace(/(<span class="section-title">)([\s\S]*?)(<\/span>)/, '$1$2$3'+hideBtn);
    if (injected === html) {
      // No section-header found (grid-4 stats block) — wrap with one
      injected = '<div class="section-header" style="margin-bottom:12px">'+
        '<span class="section-title" style="font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);font-weight:600">Overview</span>'+
        hideBtn+
      '</div>'+html;
    }
    return '<div id="ds-'+id+'" class="dash-sec">'+injected+'</div>';
  }

  // ── Section HTML ────────────────────────────────────────────────────────
  var statsHtml =
    '<div class="grid-4">'+
      '<div class="card card-sm"><div class="card-title">'+t('dash_todays_study')+'</div><div class="stat-row"><span class="stat-main">'+fmtMins(todayMins)+'</span><span class="stat-unit"> / '+fmtMins(goalMins)+'</span></div><div style="margin-top:8px"><div class="progress-bar"><div class="progress-fill" style="width:'+goalPct+'%;background:var(--primary-l)"></div></div></div><div style="font-size:11px;color:var(--muted);margin-top:4px">'+goalPct+t('dash_pct_goal')+'</div></div>'+
      '<div class="card card-sm"><div class="card-title">🔥 '+t('dash_streak')+'</div><div class="stat-row"><span class="stat-main">'+streak.current+'</span><span class="stat-unit">'+t('dash_days')+'</span></div><div class="card-sub">'+t('dash_best')+streak.longest+t('dash_days')+'</div></div>'+
      '<div class="card card-sm"><div class="card-title">📚 '+t('dash_total_hours')+'</div><div class="stat-row"><span class="stat-main">'+totalH+'</span><span class="stat-unit">'+t('dash_h_logged')+'</span></div><div class="card-sub">'+Storage.getSessions().length+t('dash_sessions_lbl')+'</div></div>'+
      '<div class="card card-sm"><div class="card-title">📅 '+t('dash_phase')+'</div><div style="font-size:14px;font-weight:600;margin-top:4px">'+(phase?phase.name:'—')+'</div><div class="card-sub">'+(phase?phase.description:'')+'</div></div>'+
    '</div>';

  var examsHtml =
    '<div><div class="section-header"><span class="section-title">'+t('dash_exam_countdown')+'</span></div>'+
      '<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:4px">'+
        getExamDates().filter(function(e){return daysUntil(e.date)>=0;}).map(function(e){var d=daysUntil(e.date);return '<div class="countdown-card" style="min-width:155px;max-width:200px;border-color:'+e.color+'22" title="'+e.label+' — '+fmtDate(e.date)+'"><div class="countdown-days" style="color:'+(d<=30?'var(--red)':e.color)+'">'+d+'</div><div class="countdown-label">'+t('dash_days_left')+'</div><div class="countdown-name">'+e.label+'</div><div class="countdown-label">'+fmtDate(e.date)+'</div></div>';}).join('')+
      '</div>'+
    '</div>';

  var subExamsHtml =
    '<div><div class="section-header"><span class="section-title">'+t('dash_sub_exams')+'</span></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        getSubjects().filter(function(s){return s.examDate;}).sort(function(a,b){return daysUntil(a.examDate)-daysUntil(b.examDate);}).map(function(s){var dl=daysUntil(s.examDate);var col=dl<=7?'var(--red,#ef4444)':dl<=21?'var(--yellow,#f59e0b)':'var(--green,#22c55e)';return '<div class="sub-exam-badge" style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:var(--bg2);border:1px solid var(--border);border-left:3px solid '+col+';border-radius:8px;font-size:12px"><span>'+s.icon+'</span><span style="font-weight:500">'+s.shortName+'</span><span style="color:'+col+';font-weight:700">'+dl+'d</span></div>';}).join('')+
      '</div>'+
    '</div>';

  var dueHtml = renderReviewWidget();

  var quickLogHtml =
    '<div class="card"><div class="section-header"><span class="section-title">'+t('dash_quick_log')+'</span></div>'+renderQuickLogForm()+'</div>';

  var recentHtml =
    '<div class="card"><div class="section-header"><span class="section-title">'+t('dash_recent')+'</span><button class="btn btn-ghost btn-sm" onclick="navigate(\'analytics\')">'+t('dash_view_all')+'</button></div>'+
      '<div style="display:flex;flex-direction:column;gap:6px">'+
        (sessions.length===0
          ? '<div class="empty-state"><div class="empty-icon">📝</div><p>'+t('dash_no_sessions')+'</p></div>'
          : sessions.map(function(s){var sub=getSubject(s.subjectId);return '<div class="session-item"><div class="session-dot" style="background:'+(sub?sub.color:'#666')+'"></div><div class="session-info"><div style="font-weight:500">'+(sub?sub.shortName:s.subjectId)+'</div><div style="color:var(--muted);font-size:11px">'+(s.topic?s.topic+' · ':'')+fmtDate(s.date)+'</div></div><div class="session-dur">'+fmtMins(s.duration)+'</div><button class="btn btn-ghost btn-xs" onclick="deleteSessionUI(\''+s.id+'\')">✕</button></div>';}).join(''))+
      '</div>'+
    '</div>';

  var progressHtml =
    '<div><div class="section-header"><span class="section-title">'+t('dash_subject_progress')+'</span><button class="btn btn-outline btn-sm" onclick="navigate(\'subjects\')">'+t('dash_all_subjects')+'</button></div>'+
      '<div class="grid-auto">'+getSubjects().slice(0,6).map(function(s){return renderSubjectMiniCard(s,totals[s.id]||0);}).join('')+'</div>'+
    '</div>';

  var cfSessions = Storage.getSessions();
  var cfFirst = cfSessions.length > 0 ? cfSessions[cfSessions.length-1].date : today();
  var cfDays  = Math.max(1, Math.ceil((new Date(today()+'T00:00:00') - new Date(cfFirst+'T00:00:00')) / 86400000));
  var cfHash  = (settings.userName||'Student').split('').reduce(function(h,c){return(h*31+c.charCodeAt(0))>>>0;},0);
  var cfNum   = String(cfHash).slice(-5).padStart(5,'0');
  var caseFileHtml =
    '<div id="detective-casefile">'+
      '<div class="casefile-title">CASE FILE #'+cfNum+'</div>'+
      '<div class="casefile-row">SUBJECT: '+(settings.userName||'Student').toUpperCase()+'</div>'+
      '<div class="casefile-row">DAY '+cfDays+' OF INVESTIGATION</div>'+
      '<div class="casefile-row">STATUS: ACTIVE — OPERATION TCAS ENTRY</div>'+
      '<div class="casefile-stamp">CONFIDENTIAL</div>'+
    '</div>';

  document.getElementById('page-dashboard').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:20px;overflow-x:hidden">'+
      caseFileHtml+
      sec('stats',        statsHtml)+
      sec('exams',        examsHtml)+
      sec('sub_exams',    subExamsHtml)+
      sec('weekly',       renderWeeklySummary())+
      sec('schedule',     renderScheduleCard())+
      (dueHtml ? sec('sr_due', dueHtml) : '')+
      '<div class="grid-2" style="align-items:start">'+
        sec('quick_log',  quickLogHtml)+
        sec('recent',     recentHtml)+
      '</div>'+
      sec('progress',     progressHtml)+
      sec('achievements', renderAchievementsStrip())+
    '</div>';

  applyDashShelfState();
}

function renderQuickLogForm() {
  return '<div style="display:flex;flex-direction:column;gap:10px"><div class="form-group" style="margin:0"><label class="label">'+t('dash_subject')+'</label><select class="input" id="ql-subject" onchange="updateQLTopics()"><option value="">'+t('dash_choose')+'</option>'+getSubjects().map(s=>'<option value="'+s.id+'">'+s.icon+' '+s.shortName+'</option>').join('')+'</select></div><div class="form-group" style="margin:0"><label class="label">'+t('dash_topic_opt')+'</label><select class="input" id="ql-topic"><option value="">'+t('dash_any')+'</option></select></div><div class="grid-2" style="gap:8px"><div><label class="label">'+t('dash_duration_min')+'</label><input type="number" class="input" id="ql-duration" value="60" min="1" max="480"></div><div><label class="label">'+t('dash_date_lbl')+'</label><input type="date" class="input" id="ql-date" value="'+today()+'"></div></div><input type="text" class="input" id="ql-notes" placeholder="'+t('dash_notes_opt')+'"><button class="btn btn-primary" onclick="logQuickSession()">'+t('dash_log_btn')+'</button></div>';
}
function updateQLTopics() {
  const sid=document.getElementById('ql-subject').value;
  const sub=getSubject(sid);
  const sel=document.getElementById('ql-topic');
  if(!sel)return;
  sel.innerHTML='<option value="">'+t('dash_any')+'</option>'+(sub?sub.topics.map(function(tp){return '<option value="'+tp.name+'">'+tTopic(tp.id,tp.name)+'</option>';}).join(''):'');
}
function logQuickSession() {
  const sid=document.getElementById('ql-subject').value;
  const topic=document.getElementById('ql-topic').value||'';
  const dur=parseInt(document.getElementById('ql-duration').value||'60');
  const date=document.getElementById('ql-date').value||today();
  const notes=document.getElementById('ql-notes').value||'';
  if(!sid){toast(t('toast_select_subject'),'warning');return;}
  if(isNaN(dur)||dur<1){toast(t('toast_invalid_duration'),'warning');return;}
  Storage.addSession({id:uid(),subjectId:sid,topic,duration:dur,date,notes,type:'manual',timestamp:Date.now()});
  toast(t('toast_logged',{dur:fmtMins(dur),sub:getSubject(sid).shortName}),'success');
  checkAchievements();
  renderDashboard();
}
function deleteSessionUI(id) { Storage.deleteSession(id); toast(t('toast_session_deleted'),'info'); renderPage(currentPage); }
function isSubjectBehind(sid, loggedMins) {
  if(isSubjectInactive(sid)) return false;
  if(Storage.get('mt_behind_disabled_'+sid, false)) return false;
  var s=getSubject(sid); if(!s||!s.examDate)return false;
  var remaining=Math.max(0,s.targetHours-(loggedMins||0)/60);
  if(remaining<=0)return false;
  var cutoff=new Date(); cutoff.setDate(cutoff.getDate()-14);
  var avgDayH=Storage.getSessions().filter(function(x){return x.subjectId===sid&&new Date(x.date+'T00:00:00')>=cutoff;}).reduce(function(a,x){return a+x.duration;},0)/60/14;
  if(avgDayH<=0.01)return daysUntil(s.examDate)<remaining*2;
  var eta=new Date(Date.now()+Math.ceil(remaining/avgDayH)*86400000).toISOString().split('T')[0];
  return eta>s.examDate;
}
function isBehindDisabled(sid) { return !!Storage.get('mt_behind_disabled_'+sid, false); }
function disableBehindBadge(sid) { Storage.set('mt_behind_disabled_'+sid, true); closeModal('behind-popup-modal'); renderDashboard(); if(currentPage==='subjects')renderSubjectsPage(); }
function enableBehindBadge(sid) { Storage.set('mt_behind_disabled_'+sid, false); renderDashboard(); if(currentPage==='subjects')renderSubjectsPage(); }
// ── Active / paused subjects: paused subjects are left out of Today's Plan & behind warnings ──
function isSubjectInactive(sid) { return !!Storage.get('mt_subject_inactive_'+sid, false); }
function setSubjectActive(sid, active) {
  Storage.set('mt_subject_inactive_'+sid, !active);
  if(!active){ // pausing — drop it from today's already-generated plan too
    var d=today(); var sl=Storage.getSchedule(d);
    if(sl){ Storage.saveSchedule(d, sl.filter(function(x){return x.subjectId!==sid;})); }
  }
  renderSubjectsPage();
}
// ── Prior (pre-tracking) hours + bulk topic completion ──
function setPriorHoursUI(sid, val) {
  var h=parseFloat(val);
  Storage.set('mt_prior_hours_'+sid, (isNaN(h)||h<0)?0:h);
  if(currentPage==='subjects')renderSubjectsPage();
}
function markAllTopicsUI(sid, done) {
  var s=getSubject(sid); if(!s)return;
  var d=Storage.getTopicDone();
  s.topics.forEach(function(tp){ d[tp.id]=!!done; });
  Storage.set('mt_topic_done', d);
  toast(done?(s.shortName+' — all topics done ✓'):(s.shortName+' — topics reset'), done?'success':'info');
  if(typeof checkAchievements==='function')checkAchievements();
  renderSubjectsPage();
}
function showBehindSchedulePopup(event, sid) {
  var s=getSubject(sid); if(!s)return;
  var totals=Storage.getSubjectTotals();
  var loggedMins=totals[sid]||0;
  var remaining=Math.max(0,s.targetHours-loggedMins/60);
  var dl=daysUntil(s.examDate);
  var cutoff=new Date(); cutoff.setDate(cutoff.getDate()-14);
  var avgDayH=Storage.getSessions().filter(function(x){return x.subjectId===sid&&new Date(x.date+'T00:00:00')>=cutoff;}).reduce(function(a,x){return a+x.duration;},0)/60/14;
  var neededPace=dl>0?remaining/dl:remaining;
  var extra=Math.max(0,neededPace-avgDayH);
  var statRow=function(label,val){return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:13px;color:var(--muted)">'+label+'</span><span style="font-size:14px;font-weight:600">'+val+'</span></div>';};
  var o=document.createElement('div'); o.className='modal-overlay fade-in'; o.id='behind-popup-modal';
  o.innerHTML='<div class="modal-box" style="max-width:400px">'+
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'+
      '<span style="font-size:22px">⚠️</span>'+
      '<div><div style="font-size:16px;font-weight:700;color:var(--red,#ef4444)">'+t('behind_popup_title')+'</div>'+
      '<div style="font-size:11px;color:var(--muted)">'+s.icon+' '+s.name+'</div></div>'+
    '</div>'+
    '<p style="font-size:13px;color:var(--muted);margin:0 0 16px;line-height:1.6">'+t('behind_popup_exp')+'</p>'+
    '<div style="margin-bottom:20px">'+
      statRow(t('behind_popup_remaining'), remaining.toFixed(1)+'h')+
      statRow(t('behind_popup_days'), dl>=0?dl+' days':'Passed')+
      statRow(t('behind_popup_cur_pace'), avgDayH.toFixed(2)+' h/day')+
      statRow(t('behind_popup_need_pace'), neededPace.toFixed(2)+' h/day')+
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span style="font-size:13px;color:var(--muted)">'+t('behind_popup_extra')+'</span><span style="font-size:14px;font-weight:700;color:var(--red,#ef4444)">+'+extra.toFixed(2)+' h/day</span></div>'+
    '</div>'+
    '<div style="display:flex;gap:8px">'+
      '<button class="btn btn-outline" style="flex:1;font-size:12px;color:var(--muted)" onclick="disableBehindBadge(\''+sid+'\')">'+t('behind_popup_disable')+'</button>'+
      '<button class="btn btn-primary" style="flex:1" onclick="closeModal(\'behind-popup-modal\')">'+t('behind_popup_close')+'</button>'+
    '</div>'+
  '</div>';
  o.addEventListener('click',function(e){if(e.target===o)closeModal('behind-popup-modal');});
  document.body.appendChild(o);
}
function renderSubjectMiniCard(s, loggedMins) {
  const pct=Math.min(100,Math.round(loggedMins/(s.targetHours*60)*100));
  const td=s.topics.filter(tp=>Storage.isTopicDone(tp.id)).length;
  const behind=isSubjectBehind(s.id,loggedMins);
  return '<div class="subject-card" onclick="navigate(\'subjects\');openSubjectId=\''+s.id+'\';renderSubjectsPage();" style="cursor:pointer'+(behind?';border-color:var(--red,#ef4444)':'')+'">'+(behind?'<div style="font-size:10px;color:var(--red,#ef4444);font-weight:600;margin-bottom:4px;cursor:pointer;user-select:none" onclick="event.stopPropagation();showBehindSchedulePopup(event,\''+s.id+'\')">⚠ '+t('subj_behind')+'</div>':'')+'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:22px">'+s.icon+'</span><div><div class="subject-name">'+s.shortName+'</div><div class="subject-meta">'+fmtMins(loggedMins)+' / '+s.targetHours+t('subj_h_target')+'</div></div>'+priorityBadge(s.priority)+'</div><div class="progress-bar" style="margin-bottom:4px"><div class="progress-fill" style="width:'+pct+'%;background:'+s.color+'"></div></div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted)"><span>'+pct+t('subj_pct_hours')+'</span><span>'+td+'/'+s.topics.length+' '+t('subj_topics_lbl')+'</span></div></div>';
}

