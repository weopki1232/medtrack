// ── Timer ─────────────────────────────────────────────────────────────────────
function renderTimerPage() {
  const s=getSettings();
  const circumference=(2*Math.PI*108).toFixed(2);
  document.getElementById('page-timer').innerHTML =
  '<div class="timer-grid">' +
  '<div class="card no-float" style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:32px 20px">' +
  '<div class="pill-tabs"><button class="pill-tab '+(timerState.mode==='pomodoro'?'active':'')+'" onclick="setTimerMode(\'pomodoro\')">'+t('timer_pomodoro')+'</button><button class="pill-tab '+(timerState.mode==='custom'?'active':'')+'" onclick="setTimerMode(\'custom\')">'+t('timer_custom')+'</button></div>' +
  '<div id="timer-ring-container"><svg id="timer-svg" width="240" height="240" viewBox="0 0 240 240"><circle cx="120" cy="120" r="108" fill="none" stroke="var(--bg3)" stroke-width="10"/><circle id="timer-progress-circle" cx="120" cy="120" r="108" fill="none" stroke="var(--primary-l)" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+circumference+'" stroke-dashoffset="'+circumference+'" style="transition:stroke-dashoffset 0.5s ease"/></svg><div id="timer-display"><div id="timer-time">00:00</div><div id="timer-label" style="color:var(--muted);font-size:13px">'+t('timer_ready')+'</div><div id="timer-phase"></div></div></div>' +
  '<div class="pomodoro-dots" id="pomodoro-dots">'+Array.from({length:s.pomodoroCycles},(_,i)=>'<div class="pomodoro-dot" id="pdot-'+i+'"></div>').join('')+'</div>' +
  '<div class="timer-controls"><button class="btn btn-outline btn-icon" onclick="resetTimer()" title="Reset">&#8634;</button><button class="btn btn-primary" id="timer-main-btn" onclick="toggleTimer()" style="width:130px;font-size:16px;padding:14px 0;border-radius:50px;justify-content:center">'+t('timer_btn_start')+'</button><button class="btn btn-outline btn-icon" id="timer-pause-btn" onclick="pauseTimer()" title="Pause / Resume" style="'+(timerState.running?'':'display:none')+'">⏸</button><button class="btn btn-outline btn-icon" onclick="skipPhase()" title="Skip">&#9197;</button></div>' +
  '<div id="custom-dur-row" style="'+(timerState.mode==='custom'?'':'display:none')+'"><label class="label" style="text-align:center">'+t('timer_dur')+'</label><input type="number" class="input" id="custom-minutes" value="60" min="1" max="300" style="text-align:center;font-size:20px;width:120px" onchange="if(!timerState.running)setCustomDuration(this.value)"></div>' +
  '<button class="btn btn-outline btn-sm" onclick="openFocusMode()" style="margin-top:4px">'+t('timer_focus')+'</button>' +
  '</div>' +
  '<div style="display:flex;flex-direction:column;gap:14px">' +
  '<div class="card"><div class="card-title">'+t('timer_session_setup')+'</div><div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">' +
  '<div><label class="label">'+t('timer_subject')+'</label><select class="input" id="timer-subject" onchange="updateTimerTopics()"><option value="">'+t('dash_choose')+'</option>'+DEFAULT_SUBJECTS.map(s=>'<option value="'+s.id+'" '+(timerState.selectedSubjectId===s.id?'selected':'')+'>'+s.icon+' '+s.shortName+'</option>').join('')+'</select><div id="timer-subject-status" style="margin-top:4px;display:none"></div></div>' +
  '<div><label class="label">'+t('timer_topic')+'</label><select class="input" id="timer-topic"><option value="">'+t('dash_any')+'</option></select></div>' +
  '<div><label class="label">'+t('timer_notes')+'</label><textarea class="input" id="timer-notes" rows="3" placeholder="'+t('timer_notes_ph')+'" style="resize:vertical">'+timerState.notes+'</textarea></div>' +
  '</div></div>' +
  '<div class="card" id="pomo-presets-card" style="'+(timerState.mode==='pomodoro'?'':'display:none')+'"><div class="card-title">'+t('timer_preset')+'</div><div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">'+POMODORO_PRESETS.map((p,i)=>'<button class="btn btn-outline btn-sm" onclick="applyPomoPreset('+i+')">'+p.label+' · '+p.cycles+' '+t('timer_cycles')+'</button>').join('')+'</div></div>' +
  '<div class="card"><div class="card-title">'+t('timer_today')+'</div><div id="today-sessions-list" style="margin-top:8px;display:flex;flex-direction:column;gap:5px">'+renderTodaySessionsList()+'</div></div>' +
  '</div></div>';

  if (timerState.selectedSubjectId) {
    const el=document.getElementById('timer-subject');
    if(el){ el.value=timerState.selectedSubjectId; updateTimerTopics(); }
  }
  updateTimerDisplay();
}
function renderTodaySessionsList() {
  const ss=Storage.getSessions().filter(s=>s.date===today());
  if(!ss.length) return '<div style="font-size:13px;color:var(--muted)">'+t('timer_no_today')+'</div>';
  return ss.map(function(s){const sub=getSubject(s.subjectId);return '<div class="session-item" style="padding:7px 10px"><div class="session-dot" style="background:'+(sub?sub.color:'#666')+'"></div><div class="session-info"><div style="font-weight:500;font-size:13px">'+(sub?sub.shortName:'')+'</div></div><div class="session-dur" style="font-size:13px">'+fmtMins(s.duration)+'</div></div>';}).join('');
}
function updateTimerTopics() {
  const sid=document.getElementById('timer-subject').value;
  timerState.selectedSubjectId=sid||null;
  const sub=getSubject(sid);
  const sel=document.getElementById('timer-topic');
  if(!sel)return;
  sel.innerHTML='<option value="">'+t('dash_any')+'</option>'+(sub?sub.topics.map(function(tp){return '<option value="'+tp.name+'">'+tTopic(tp.id,tp.name)+'</option>';}).join(''):'');
  var statusEl=document.getElementById('timer-subject-status');
  if(statusEl){
    if(sid&&sub){
      var totals=Storage.getSubjectTotals();
      var beh=isSubjectBehind(sid,totals[sid]||0);
      statusEl.style.display='';
      statusEl.innerHTML=beh
        ?'<span style="color:var(--red,#ef4444);font-size:12px">⚠️ '+t('subj_behind')+' — prioritise this subject</span>'
        :'<span style="color:var(--green,#22c55e);font-size:12px">✓ On track</span>';
    } else {
      statusEl.style.display='none';
    }
  }
}
function setTimerMode(mode) {
  timerState.mode=mode;
  if(timerState.running)resetTimer();
  renderTimerPage();
  if(mode==='pomodoro'){ const s=getSettings(); initPomodoro(s.pomodoroWork,s.pomodoroShortBreak,s.pomodoroLongBreak,s.pomodoroCycles); }
  else { setCustomDuration(parseInt(document.getElementById('custom-minutes').value||'60')); }
}
function setCustomDuration(mins) { mins=parseInt(mins)||60; timerState.totalSeconds=mins*60; timerState.remainingSeconds=mins*60; updateTimerDisplay(); }
function applyPomoPreset(i) { const p=POMODORO_PRESETS[i]; Storage.saveSettings({pomodoroWork:p.work,pomodoroShortBreak:p.shortBreak,pomodoroLongBreak:p.longBreak,pomodoroCycles:p.cycles}); if(!timerState.running)initPomodoro(p.work,p.shortBreak,p.longBreak,p.cycles); toast(t('toast_preset',{label:p.label}),'success'); renderTimerPage(); }
function initPomodoro(work,sb,lb,cycles) { work=work||25;sb=sb||5;lb=lb||15;cycles=cycles||4; timerState.phase='work'; timerState.cyclesDone=0; timerState.totalSeconds=work*60; timerState.remainingSeconds=work*60; timerState._work=work; timerState._shortB=sb; timerState._longB=lb; timerState._cycles=cycles; updateTimerDisplay(); }
function toggleTimer() {
  if(!timerState.running){
    timerState.selectedSubjectId=document.getElementById('timer-subject').value||null;
    timerState.selectedTopic=document.getElementById('timer-topic').value||'';
    timerState.notes=document.getElementById('timer-notes').value||'';
    if(!timerState.selectedSubjectId){toast(t('toast_select_subject_first'),'warning');return;}
    if(timerState.remainingSeconds<=0){ if(timerState.mode==='pomodoro')initPomodoro(timerState._work,timerState._shortB,timerState._longB,timerState._cycles); else setCustomDuration(parseInt(document.getElementById('custom-minutes').value||'60')); }
    timerState.running=true; timerState.paused=false; timerState.sessionStartTime=Date.now();
    startCountdown(); document.getElementById('timer-main-btn').textContent=t('timer_btn_stop');
    if (document.body.classList.contains('detective-active')) startDetectiveTick();
    var pb=document.getElementById('timer-pause-btn'); if(pb){pb.style.display='';pb.textContent='⏸';}
    var fp=document.getElementById('focus-pause-btn'); if(fp)fp.textContent=t('timer_btn_pause');
  } else {
    // Stop — log elapsed time and reset
    stopDetectiveTick();
    clearInterval(timerState.intervalId);
    var elapsed=Math.round((Date.now()-timerState.sessionStartTime)/60000);
    if(elapsed>=1){
      _pendingSession={id:uid(),subjectId:timerState.selectedSubjectId,topic:timerState.selectedTopic,duration:Math.max(1,elapsed),date:today(),notes:timerState.notes,type:timerState.mode,timestamp:Date.now()};
      openReflectionModal();
    }
    timerState.running=false; timerState.paused=false;
    if(timerState.mode==='pomodoro')initPomodoro(timerState._work,timerState._shortB,timerState._longB,timerState._cycles);
    else setCustomDuration(parseInt((document.getElementById('custom-minutes')||{value:'60'}).value||'60'));
    document.getElementById('timer-main-btn').textContent=t('timer_btn_start');
    var pb2=document.getElementById('timer-pause-btn'); if(pb2)pb2.style.display='none';
    if(focusState.active)closeFocusMode();
    var el=document.getElementById('today-sessions-list'); if(el)el.innerHTML=renderTodaySessionsList();
  }
}
function pauseTimer(){
  if(!timerState.running)return;
  if(!timerState.paused){
    timerState.paused=true; clearInterval(timerState.intervalId);
    var pb=document.getElementById('timer-pause-btn'); if(pb)pb.textContent=t('timer_btn_resume');
    var fp=document.getElementById('focus-pause-btn'); if(fp)fp.textContent=t('focus_resume');
  } else {
    timerState.paused=false; startCountdown();
    var pb=document.getElementById('timer-pause-btn'); if(pb)pb.textContent=t('timer_btn_pause');
    var fp=document.getElementById('focus-pause-btn'); if(fp)fp.textContent=t('focus_pause');
  }
}
function startCountdown() {
  clearInterval(timerState.intervalId);
  timerState._tickStart=Date.now();
  timerState._tickBase=timerState.remainingSeconds;
  timerState.intervalId=setInterval(function(){
    var elapsed=Math.floor((Date.now()-timerState._tickStart)/1000);
    var remaining=timerState._tickBase-elapsed;
    if(remaining<=0){
      timerState.remainingSeconds=0;
      clearInterval(timerState.intervalId);
      updateTimerDisplay();
      if(focusState.active){var fe=document.getElementById('focus-time');if(fe)fe.textContent='00:00';}
      handleTimerEnd();
    } else {
      timerState.remainingSeconds=remaining;
      updateTimerDisplay();
      if(focusState.active){var fe=document.getElementById('focus-time');if(fe){var m=Math.floor(remaining/60),s2=remaining%60;fe.textContent=String(m).padStart(2,'0')+':'+String(s2).padStart(2,'0');}}
    }
  },500);
}
function handleTimerEnd() {
  if(getSettings().soundEnabled)playBeep();
  if(timerState.mode==='pomodoro'){
    if(timerState.phase==='work'){
      openPomodoroNoteModal();
      return;
    } else { timerState.phase='work'; timerState.totalSeconds=(timerState._work||25)*60; toast(t('toast_back_to_work'),'info'); }
    timerState.remainingSeconds=timerState.totalSeconds; startCountdown(); updateTimerDisplay();
  } else {
    const elapsed=Math.round((Date.now()-timerState.sessionStartTime)/60000);
    if(elapsed>=1){
      _pendingSession={id:uid(),subjectId:timerState.selectedSubjectId,topic:timerState.selectedTopic,duration:Math.max(1,elapsed),date:today(),notes:timerState.notes,type:'custom',timestamp:Date.now()};
      openReflectionModal();
    }
    timerState.running=false; timerState.remainingSeconds=0;
    if(focusState.active) closeFocusMode();
    document.getElementById('timer-main-btn').textContent=t('timer_btn_start');
    const el=document.getElementById('today-sessions-list'); if(el)el.innerHTML=renderTodaySessionsList();
  }
}
function openPomodoroNoteModal() {
  _pomoMood = '';
  var o=document.createElement('div'); o.className='modal-overlay fade-in'; o.id='pomo-note-modal';
  o.innerHTML='<div class="modal-box" style="max-width:400px">'+
    '<div class="modal-title">🍅 '+t('pomo_note_title')+'</div>'+
    '<textarea class="input" id="pomo-note-text" rows="3" placeholder="'+t('pomo_note_ph')+'" style="resize:vertical;margin-bottom:12px"></textarea>'+
    '<div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:8px">'+t('refl_mood')+'</div>'+
    '<div style="display:flex;gap:8px;margin-bottom:16px">'+
      '<button class="btn btn-outline mood-btn" style="flex:1;padding:10px 4px;font-size:16px;flex-direction:column;gap:2px" onclick="selectPomodoroMood(this,\'tough\')">😤<div style="font-size:10px">'+t('refl_tough')+'</div></button>'+
      '<button class="btn btn-outline mood-btn" style="flex:1;padding:10px 4px;font-size:16px;flex-direction:column;gap:2px" onclick="selectPomodoroMood(this,\'good\')">😊<div style="font-size:10px">'+t('refl_good')+'</div></button>'+
      '<button class="btn btn-outline mood-btn" style="flex:1;padding:10px 4px;font-size:16px;flex-direction:column;gap:2px" onclick="selectPomodoroMood(this,\'flow\')">🔥<div style="font-size:10px">'+t('refl_flow')+'</div></button>'+
    '</div>'+
    '<div class="modal-footer">'+
    '<button class="btn btn-outline" onclick="completePomodoroWork(\'\',\'\')" style="flex:1">'+t('pomo_note_skip')+'</button>'+
    '<button class="btn btn-primary" onclick="completePomodoroWork(document.getElementById(\'pomo-note-text\').value,_pomoMood)" style="flex:1">'+t('pomo_note_log')+'</button>'+
    '</div></div>';
  document.body.appendChild(o);
  setTimeout(function(){var ta=document.getElementById('pomo-note-text');if(ta)ta.focus();},80);
}
function selectPomodoroMood(btn, mood) {
  _pomoMood = mood;
  document.querySelectorAll('.mood-btn').forEach(function(b){b.style.background='';b.style.borderColor='';});
  btn.style.background='var(--primary)22'; btn.style.borderColor='var(--primary-l)';
}
function completePomodoroWork(quickNote, mood) {
  closeModal('pomo-note-modal');
  var combinedNotes = [timerState.notes, (quickNote||'').trim()].filter(Boolean).join(' | ');
  Storage.addSession({id:uid(),subjectId:timerState.selectedSubjectId,topic:timerState.selectedTopic,duration:timerState._work||25,date:today(),notes:combinedNotes,mood:mood||'',type:'pomodoro',timestamp:Date.now()});
  checkAchievements();
  timerState.cyclesDone++; updatePomodoroDots();
  if(timerState.cyclesDone>=(timerState._cycles||4)){ timerState.phase='long-break'; timerState.totalSeconds=(timerState._longB||15)*60; toast(t('toast_long_break'),'success'); }
  else { timerState.phase='short-break'; timerState.totalSeconds=(timerState._shortB||5)*60; toast(t('toast_short_break'),'info'); }
  timerState.remainingSeconds=timerState.totalSeconds; startCountdown(); updateTimerDisplay();
  var el=document.getElementById('today-sessions-list'); if(el)el.innerHTML=renderTodaySessionsList();
}
function resetTimer() {
  clearInterval(timerState.intervalId); timerState.running=false; timerState.paused=false; timerState.cyclesDone=0;
  const s=getSettings();
  if(timerState.mode==='pomodoro')initPomodoro(s.pomodoroWork,s.pomodoroShortBreak,s.pomodoroLongBreak,s.pomodoroCycles);
  else setCustomDuration(parseInt((document.getElementById('custom-minutes')||{value:'60'}).value||'60'));
  const btn=document.getElementById('timer-main-btn'); if(btn)btn.textContent=t('timer_btn_start');
  updatePomodoroDots();
}
function skipPhase() { if(!timerState.running)return; timerState.remainingSeconds=0; }
function updatePomodoroDots() {
  const total=timerState._cycles||getSettings().pomodoroCycles;
  for(let i=0;i<total;i++){
    const d=document.getElementById('pdot-'+i); if(!d)continue;
    d.className='pomodoro-dot';
    if(i<timerState.cyclesDone)d.classList.add('done');
    else if(i===timerState.cyclesDone&&timerState.phase==='work'&&timerState.running)d.classList.add('active');
  }
}
function updateTimerDisplay() {
  const mins=Math.floor(timerState.remainingSeconds/60), secs=timerState.remainingSeconds%60;
  const te=document.getElementById('timer-time'); if(te)te.textContent=String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  const phaseLabels={work:t('phase_work'),'short-break':t('phase_short_break'),'long-break':t('phase_long_break')};
  const phaseColors={work:'var(--primary-l)','short-break':'var(--green)','long-break':'var(--cyan)'};
  const pe=document.getElementById('timer-phase'); if(pe)pe.textContent=timerState.mode==='pomodoro'?(phaseLabels[timerState.phase]||''):'';
  const le=document.getElementById('timer-label'); if(le)le.textContent=timerState.running?(timerState.paused?t('timer_paused'):t('timer_running')):t('timer_ready');
  const circ=document.getElementById('timer-progress-circle');
  if(circ){ const total=timerState.totalSeconds||1; const pct=timerState.remainingSeconds/total; circ.style.strokeDashoffset=2*Math.PI*108*(1-pct); circ.style.stroke=phaseColors[timerState.phase]||'var(--primary-l)'; }
  const svg=document.getElementById('timer-svg'); if(svg)svg.classList.toggle('ring-running', timerState.running && !timerState.paused);
  updatePomodoroDots();
}
function playBeep() { try{ const ctx=new(window.AudioContext||window.webkitAudioContext)(); const osc=ctx.createOscillator(); const g=ctx.createGain(); osc.connect(g); g.connect(ctx.destination); osc.frequency.value=880; g.gain.value=0.3; osc.start(); osc.stop(ctx.currentTime+0.4); }catch{} }

