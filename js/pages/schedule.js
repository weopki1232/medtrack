// ── Weekly Summary ────────────────────────────────────────────────────────────
function renderWeeklySummary() {
  var thisW = getWeekMins(0), lastW = getWeekMins(1);
  if (thisW === 0) {
    return '<div class="card" style="padding:16px"><div class="section-header"><span class="section-title">📊 '+t('dash_weekly')+'</span></div><div class="empty-state" style="padding:10px 0"><p>'+t('dash_weekly_no_data')+'</p></div></div>';
  }
  var now = new Date();
  var startOfWeek = new Date(now); startOfWeek.setDate(now.getDate()-now.getDay()); startOfWeek.setHours(0,0,0,0);
  var endOfWeek = new Date(startOfWeek.getTime()+7*24*60*60*1000);
  var dayMins=[0,0,0,0,0,0,0], subjectMins={};
  Storage.getSessions().forEach(function(s){
    var d=new Date(s.date+'T00:00:00');
    if(d>=startOfWeek&&d<endOfWeek){dayMins[d.getDay()]+=s.duration;subjectMins[s.subjectId]=(subjectMins[s.subjectId]||0)+s.duration;}
  });
  var maxDay=Math.max.apply(null,dayMins)||1;
  var shortDays=['S','M','T','W','T','F','S'];
  var barsHtml=dayMins.map(function(m,i){
    var h=m>0?Math.max(6,Math.round(m/maxDay*44)):4;
    var isToday=(i===now.getDay());
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">'+
      '<div style="width:18px;height:'+h+'px;background:'+(m>0?'var(--primary-l)':'var(--bg3)')+';border-radius:3px;'+(isToday?'outline:2px solid var(--primary);outline-offset:1px':'')+';transition:height .3s"></div>'+
      '<div style="font-size:10px;color:'+(isToday?'var(--primary-l)':'var(--muted)')+'">'+shortDays[i]+'</div>'+
    '</div>';
  }).join('');
  var bestSubId=null,bestSubMins=0;
  Object.keys(subjectMins).forEach(function(id){if(subjectMins[id]>bestSubMins){bestSubMins=subjectMins[id];bestSubId=id;}});
  var bestSub=bestSubId?getSubject(bestSubId):null;
  var cmpText='';
  if(lastW>0){var diff=thisW-lastW,pct=Math.abs(Math.round(diff/lastW*100));cmpText=pct+'% '+(diff>0?t('dash_weekly_up'):diff<0?t('dash_weekly_down'):t('dash_weekly_same'));}
  return '<div class="card" style="padding:16px">'+
    '<div class="section-header"><span class="section-title">📊 '+t('dash_weekly')+'</span>'+
    '<div style="display:flex;align-items:center;gap:10px">'+(cmpText?'<span style="font-size:12px;color:var(--muted)">'+cmpText+'</span>':'')+
    '<button class="btn btn-outline btn-sm" onclick="openDailyReviewModal()">📝 '+t('dash_end_day')+'</button></div></div>'+
    '<div style="display:flex;align-items:flex-end;gap:16px;margin-top:10px">'+
      '<div style="display:flex;gap:5px;align-items:flex-end">'+barsHtml+'</div>'+
      '<div>'+
        '<div style="font-size:24px;font-weight:700">'+fmtMins(thisW)+'</div>'+
        (bestSub?'<div style="font-size:12px;color:var(--muted);margin-top:4px">'+t('dash_weekly_best')+': <span style="color:'+bestSub.color+';font-weight:600">'+bestSub.icon+' '+bestSub.shortName+'</span></div>':'')+
      '</div>'+
    '</div>'+
  '</div>';
}

// ── Study Schedule ────────────────────────────────────────────────────────────
function computeRecommendedSchedule() {
  var sessions = Storage.getSessions();
  var totals = Storage.getSubjectTotals();
  var goalMins = getSettings().dailyGoalMinutes || 90;
  var cutoff7 = new Date(); cutoff7.setDate(cutoff7.getDate()-7);

  var scored = getSubjects().filter(function(s){ return !isSubjectInactive(s.id); }).map(function(s) {
    var loggedMins = totals[s.id]||0;
    var behind = isSubjectBehind(s.id, loggedMins);
    var dl = daysUntil(s.examDate);
    var urgency = dl >= 0 ? Math.max(0, Math.round((1 - dl/365)*30)) : 30;
    var last7mins = sessions.filter(function(x){return x.subjectId===s.id&&new Date(x.date+'T00:00:00')>=cutoff7;}).reduce(function(a,x){return a+x.duration;},0);
    var neglect = Math.round(Math.max(0,1-(last7mins/(goalMins*7)))*30);
    var reasons = [];
    if(behind)reasons.push(t('sched_reason_behind'));
    if(urgency>=20)reasons.push(t('sched_reason_urgent'));
    if(neglect>=20)reasons.push(t('sched_reason_neglect'));
    return {subjectId:s.id, score:(behind?40:0)+urgency+neglect, reasons:reasons, loggedMins:loggedMins};
  });

  scored.sort(function(a,b){return b.score-a.score;});
  var top = scored.slice(0,3);
  var totalScore = top.reduce(function(a,x){return a+Math.max(x.score,1);},0);
  var slots = top.map(function(x){
    var dur = Math.max(20, Math.round(goalMins*(Math.max(x.score,1)/totalScore)/5)*5);
    return {subjectId:x.subjectId, durationMins:dur, done:false, reasons:x.reasons};
  });
  return slots;
}

function getOrCreateTodaySchedule() {
  var d = today();
  var existing = Storage.getSchedule(d);
  if(existing) return existing;
  if(!getSettings().autoSchedule) return null;
  var slots = computeRecommendedSchedule();
  Storage.saveSchedule(d, slots);
  return slots;
}

function renderScheduleCard() {
  var d = today();
  var slots = getOrCreateTodaySchedule();
  var html = '<div class="card" style="padding:16px">';
  html += '<div class="section-header"><span class="section-title">📅 '+t('sched_title')+'</span>';
  html += '<div style="display:flex;gap:6px;align-items:center">';
  html += '<button class="btn btn-ghost btn-xs" onclick="openScheduleInfoModal()" title="How does this work?" style="font-size:15px;padding:2px 6px">ℹ️</button>';
  html += '<button class="btn btn-ghost btn-sm" onclick="regenSchedule()">🔄 '+t('sched_regen')+'</button>';
  html += '<button class="btn btn-outline btn-sm" onclick="openCustomizeScheduleModal()">✏️ '+t('sched_customize')+'</button>';
  html += '</div></div>';

  if(!getSettings().autoSchedule && !slots) {
    html += '<div class="empty-state" style="padding:10px 0"><p>Auto-planning is off. <button class="btn btn-outline btn-xs" onclick="toggleAutoSchedule();renderDashboard()">Enable</button></p></div>';
  } else if(!slots||slots.length===0) {
    html += '<div class="empty-state" style="padding:10px 0"><p>'+t('sched_no_plan')+'</p></div>';
  } else {
    var pendingTasks = Storage.getTasks().filter(function(tk){return !tk.done;});
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    slots.forEach(function(sl) {
      var sub = getSubject(sl.subjectId);
      if(!sub) return;
      var slotTasks = pendingTasks.filter(function(tk){return tk.subjectId===sl.subjectId;});
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border-radius:10px;border-left:3px solid '+(sl.done?'var(--green,#22c55e)':sub.color)+'">';
      html += '<span style="font-size:22px">'+sub.icon+'</span>';
      html += '<div style="flex:1">';
      html += '<div style="font-weight:600;font-size:14px">'+(sl.done?'<s>':'')+sub.shortName+(sl.done?'</s>':'')+'</div>';
      html += '<div style="font-size:11px;color:var(--muted)">'+sl.durationMins+' '+t('sched_mins');
      if(sl.reasons&&sl.reasons.length)html+=' · '+sl.reasons.join(', ');
      html += '</div>';
      if(slotTasks.length) html += '<div style="font-size:11px;color:var(--primary-l);margin-top:2px">📋 '+slotTasks.length+' task'+(slotTasks.length>1?'s':'')+' pending</div>';
      html += '</div>';
      if(sl.done) {
        html += '<span style="color:var(--green,#22c55e);font-size:13px;font-weight:600">'+t('sched_logged')+'</span>';
      } else {
        html += '<button class="btn btn-ghost btn-xs" onclick="markScheduleDoneUI(\''+sl.subjectId+'\','+sl.durationMins+')">'+t('sched_done_btn')+'</button>';
        html += '<button class="btn btn-primary btn-sm" onclick="startScheduledSession(\''+sl.subjectId+'\','+sl.durationMins+')">'+t('sched_start_btn')+'</button>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  return html+'</div>';
}

function regenSchedule() {
  var slots = computeRecommendedSchedule();
  Storage.saveSchedule(today(), slots);
  renderDashboard();
}
function toggleAutoSchedule() {
  var s = getSettings();
  Storage.saveSettings({autoSchedule: !s.autoSchedule});
  renderSettings();
}
function toggleNotif(){
  var s=getSettings();
  if(!s.notifEnabled){
    requestNotifPermission(function(){
      Storage.saveSettings({notifEnabled:true});
      renderSettings();
    });
  } else {
    Storage.saveSettings({notifEnabled:false});
    renderSettings();
  }
}
function saveNotifTime(v){ Storage.saveSettings({notifTime:v}); }
function openScheduleInfoModal() {
  var o=document.createElement('div'); o.className='modal-overlay fade-in'; o.id='sched-info-modal';
  o.innerHTML='<div class="modal-box" style="max-width:440px">'+
    '<div class="modal-title">📅 How Today\'s Plan works</div>'+
    '<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;font-size:13px">'+
    '<div style="padding:10px;background:var(--bg2);border-radius:8px"><strong>🔴 Behind schedule</strong><br>You\'re on track to finish this subject\'s target hours <em>after</em> the exam date at your current study pace. You need to study it more to catch up.</div>'+
    '<div style="padding:10px;background:var(--bg2);border-radius:8px"><strong>⚡ Exam soon</strong><br>The exam is within ~2 months. The closer the date, the higher the priority score.</div>'+
    '<div style="padding:10px;background:var(--bg2);border-radius:8px"><strong>😴 Not studied recently</strong><br>You haven\'t logged any sessions for this subject in the last 7 days. Spaced review prevents forgetting.</div>'+
    '<div style="padding:8px 10px;background:var(--bg3);border-radius:8px;font-size:12px;color:var(--muted)">The plan scores every subject (0–100) and picks the top 3. Your daily goal minutes are split between them proportionally. Click Regenerate to refresh.</div>'+
    '</div>'+
    '<button class="btn btn-primary" onclick="closeModal(\'sched-info-modal\')" style="margin-top:16px;width:100%">'+t('sched_info_got_it')+'</button>'+
    '</div>';
  document.body.appendChild(o);
}

function markScheduleDoneUI(subjectId, durationMins) {
  Storage.markScheduleDone(today(), subjectId);
  Storage.addSession({id:uid(),subjectId:subjectId,topic:'',duration:durationMins,date:today(),notes:'',type:'schedule',timestamp:Date.now()});
  toast(t('toast_logged',{dur:fmtMins(durationMins),sub:getSubject(subjectId).shortName}),'success');
  renderDashboard();
}

function startScheduledSession(subjectId, durationMins) {
  timerState.selectedSubjectId = subjectId;
  timerState.mode = 'custom';
  navigate('timer');
  setTimeout(function(){
    var subEl=document.getElementById('timer-subject'); if(subEl){subEl.value=subjectId;updateTimerTopics();}
    var minEl=document.getElementById('custom-minutes'); if(minEl)minEl.value=durationMins;
    setCustomDuration(durationMins);
  }, 100);
}

function openCustomizeScheduleModal() {
  var d = today();
  var slots = Storage.getSchedule(d) || computeRecommendedSchedule();
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='sched-modal';
  var slotsHtml = slots.map(function(sl,i) {
    var sub = getSubject(sl.subjectId);
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px" id="sched-slot-'+i+'">' +
      '<select class="input" id="sched-sub-'+i+'" style="flex:1">' +
      getSubjects().map(function(s){return '<option value="'+s.id+'"'+(s.id===sl.subjectId?' selected':'')+'>'+s.icon+' '+s.shortName+'</option>';}).join('') +
      '</select>' +
      '<input type="number" class="input" id="sched-dur-'+i+'" value="'+sl.durationMins+'" min="10" max="300" style="width:70px" title="'+t('sched_duration')+'">' +
      '<span style="color:var(--muted);font-size:11px">'+t('sched_mins')+'</span>' +
      '<button class="btn btn-ghost btn-xs" onclick="document.getElementById(\'sched-slot-'+i+'\').remove()">✕</button>' +
    '</div>';
  }).join('');
  o.innerHTML = '<div class="modal-box" style="max-width:480px">' +
    '<div class="modal-title">'+t('sched_modal_title')+'</div>' +
    '<div id="sched-slots">'+slotsHtml+'</div>' +
    '<button class="btn btn-ghost btn-sm" onclick="addSchedSlot()" style="margin-bottom:12px">'+t('sched_add_slot')+'</button>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-outline" onclick="closeModal(\'sched-modal\')">'+t('btn_cancel')+'</button>' +
    '<button class="btn btn-primary" onclick="saveCustomSchedule()">'+t('sched_save')+'</button>' +
    '</div></div>';
  o.addEventListener('click',function(e){if(e.target===o)closeModal('sched-modal');});
  document.body.appendChild(o);
}

function addSchedSlot() {
  var container = document.getElementById('sched-slots'); if(!container)return;
  var i = container.children.length;
  var div = document.createElement('div');
  div.id = 'sched-slot-'+i;
  div.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px';
  div.innerHTML = '<select class="input" id="sched-sub-'+i+'" style="flex:1">' +
    getSubjects().map(function(s){return '<option value="'+s.id+'">'+s.icon+' '+s.shortName+'</option>';}).join('') +
    '</select><input type="number" class="input" id="sched-dur-'+i+'" value="30" min="10" max="300" style="width:70px">' +
    '<span style="color:var(--muted);font-size:11px">'+t('sched_mins')+'</span>' +
    '<button class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()">✕</button>';
  container.appendChild(div);
}

function saveCustomSchedule() {
  var container = document.getElementById('sched-slots'); if(!container)return;
  var slots = [];
  Array.from(container.children).forEach(function(row,i) {
    var subEl = row.querySelector('[id^="sched-sub-"]');
    var durEl = row.querySelector('[id^="sched-dur-"]');
    if(!subEl||!durEl)return;
    var dur = parseInt(durEl.value)||30;
    slots.push({subjectId:subEl.value, durationMins:dur, done:false, reasons:[]});
  });
  Storage.saveSchedule(today(), slots);
  closeModal('sched-modal');
  renderDashboard();
}

// ── Calendar / Schedule Page ──────────────────────────────────────────────────
var calWeekOffset = 0;

function getCalWeekDays() {
  var now = new Date();
  var dow = now.getDay();
  var monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + calWeekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  var days = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function renderSchedulePage() {
  var el = document.getElementById('page-schedule');
  if (!el) return;
  var days = getCalWeekDays();
  var todayStr = today();
  var allTasks = Storage.getTasks().filter(function(tk) { return !tk.completed && tk.deadline; });
  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  var weekLabel = days[0].toLocaleDateString('en-GB',{day:'numeric',month:'short'}) + ' – ' + days[6].toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});

  var html = '<div style="display:flex;flex-direction:column;gap:16px">';

  // Header row
  html += '<div class="section-header">';
  html += '<span class="section-title">📅 ' + t('cal_title') + '</span>';
  html += '<div style="display:flex;gap:8px;align-items:center">';
  html += '<button class="btn btn-outline btn-sm" onclick="calWeekOffset--;renderSchedulePage()">‹ ' + t('cal_prev') + '</button>';
  html += '<span style="font-size:13px;color:var(--muted);min-width:160px;text-align:center">' + weekLabel + '</span>';
  html += '<button class="btn btn-outline btn-sm" onclick="calWeekOffset++;renderSchedulePage()">' + t('cal_next') + ' ›</button>';
  if (calWeekOffset !== 0) {
    html += '<button class="btn btn-ghost btn-sm" onclick="calWeekOffset=0;renderSchedulePage()">' + t('cal_today') + '</button>';
  }
  html += '</div></div>';

  // 7-column grid
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;min-width:0">';

  days.forEach(function(d) {
    var dateStr = d.toISOString().split('T')[0];
    var isToday = dateStr === todayStr;
    var isFuture = dateStr > todayStr;
    var slots = Storage.getSchedule(dateStr) || [];
    var dayTasks = allTasks.filter(function(tk) { return tk.deadline === dateStr; });
    var pColors = {critical:'var(--red)',high:'var(--amber)',medium:'var(--green)',low:'var(--cyan)'};

    html += '<div style="display:flex;flex-direction:column;min-height:180px;background:var(--bg2);border:1px solid ' + (isToday ? 'var(--primary-l)' : 'var(--border)') + ';border-radius:10px;overflow:hidden' + (isToday ? ';box-shadow:0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent)' : '') + '">';

    // Day header
    html += '<div style="padding:7px 8px;background:' + (isToday ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'var(--bg3)') + ';border-bottom:1px solid var(--border);text-align:center">';
    html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + (isToday ? 'var(--primary-l)' : 'var(--muted)') + '">' + dayNames[d.getDay()] + '</div>';
    html += '<div style="font-size:20px;font-weight:800;line-height:1.1;color:' + (isToday ? 'var(--primary-l)' : 'var(--text)') + '">' + d.getDate() + '</div>';
    html += '</div>';

    // Content
    html += '<div style="flex:1;padding:5px;display:flex;flex-direction:column;gap:3px;overflow:hidden">';

    // Study slots
    slots.forEach(function(sl, idx) {
      var sub = getSubject(sl.subjectId);
      if (!sub) return;
      html += '<div style="display:flex;align-items:center;gap:3px;padding:3px 5px;border-radius:5px;background:' + sub.color + '1a;border-left:2px solid ' + sub.color + ';cursor:pointer;position:relative" title="' + sub.shortName + ' — ' + sl.durationMins + 'min" onclick="startScheduledSession(\'' + sl.subjectId + '\',' + sl.durationMins + ')">';
      html += '<span style="font-size:13px;flex-shrink:0">' + sub.icon + '</span>';
      html += '<div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:600;color:' + sub.color + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + sub.shortName + '</div>';
      html += '<div style="font-size:9px;color:var(--muted)">' + sl.durationMins + 'm' + (sl.done ? ' ✓' : '') + '</div></div>';
      html += '<button onclick="event.stopPropagation();removeCalSlot(\'' + dateStr + '\',' + idx + ')" style="background:none;border:none;color:var(--muted);font-size:10px;padding:0 2px;line-height:1;opacity:.6;cursor:pointer" title="Remove">✕</button>';
      html += '</div>';
    });

    // Tasks due on this day
    dayTasks.forEach(function(tk) {
      var col = pColors[tk.priority] || 'var(--muted)';
      var sub2 = getSubject(tk.subjectId);
      html += '<div style="padding:3px 5px;border-radius:5px;background:' + col + '18;border-left:2px solid ' + col + ';cursor:pointer;display:flex;align-items:flex-start;gap:4px" title="Click to mark done" onclick="calToggleTask(\'' + tk.id + '\')">';
      html += '<span style="font-size:11px;margin-top:1px;flex-shrink:0">📋</span>';
      html += '<div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)">' + escHtml(tk.title) + '</div>';
      if (sub2) html += '<div style="font-size:9px;color:var(--muted)">' + sub2.icon + ' ' + sub2.shortName + '</div>';
      html += '</div>';
      html += '<span style="font-size:10px;color:var(--muted);flex-shrink:0;margin-top:1px">○</span>';
      html += '</div>';
    });

    // Add slot button (always visible at bottom)
    html += '<div style="flex:1"></div>';
    html += '<button class="btn btn-ghost btn-xs" onclick="openCalAddSlotModal(\'' + dateStr + '\')" style="width:100%;justify-content:center;font-size:11px;color:var(--muted);border:1px dashed var(--border);border-radius:5px;padding:3px">' + t('cal_add_slot') + '</button>';

    html += '</div></div>';
  });

  html += '</div>';

  // Legend
  html += '<div style="display:flex;gap:12px;font-size:11px;color:var(--muted);flex-wrap:wrap;align-items:center">';
  html += '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:var(--primary-l);display:inline-block"></span>' + t('cal_legend_plan') + '</span>';
  html += '<span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:var(--amber);display:inline-block"></span>' + t('cal_legend_task') + '</span>';
  html += '<span>· ' + t('cal_legend_click') + '</span>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
}

function removeCalSlot(dateStr, idx) {
  var slots = Storage.getSchedule(dateStr) || [];
  slots.splice(idx, 1);
  Storage.saveSchedule(dateStr, slots);
  renderSchedulePage();
}

function openCalAddSlotModal(dateStr) {
  var o = document.createElement('div'); o.className = 'modal-overlay fade-in'; o.id = 'cal-add-slot-modal';
  o.innerHTML = '<div class="modal-box" style="max-width:360px">' +
    '<div class="modal-title">📅 ' + t('cal_slot_title') + ' ' + fmtDate(dateStr) + '</div>' +
    '<div class="form-group"><label class="label">' + t('cal_slot_subj') + '</label>' +
    '<select class="input" id="cal-slot-subj">' +
    getSubjects().map(function(s) { return '<option value="' + s.id + '">' + s.icon + ' ' + s.shortName + '</option>'; }).join('') +
    '</select></div>' +
    '<div class="form-group"><label class="label">' + t('cal_slot_dur') + '</label>' +
    '<input type="number" class="input" id="cal-slot-dur" value="60" min="10" max="360"></div>' +
    '<div class="modal-footer">' +
    '<button class="btn btn-outline" onclick="closeModal(\'cal-add-slot-modal\')">' + t('btn_cancel') + '</button>' +
    '<button class="btn btn-primary" onclick="submitCalAddSlot(\'' + dateStr + '\')">' + t('cal_add_slot') + '</button>' +
    '</div></div>';
  o.addEventListener('click', function(e) { if (e.target === o) closeModal('cal-add-slot-modal'); });
  document.body.appendChild(o);
  setTimeout(function() { var el = document.getElementById('cal-slot-dur'); if (el) el.focus(); }, 60);
}

function submitCalAddSlot(dateStr) {
  var subjectId = document.getElementById('cal-slot-subj').value;
  var dur = parseInt(document.getElementById('cal-slot-dur').value, 10) || 60;
  if (!subjectId) return;
  var existing = Storage.getSchedule(dateStr) || [];
  existing.push({subjectId: subjectId, durationMins: dur, done: false, reasons: []});
  Storage.saveSchedule(dateStr, existing);
  closeModal('cal-add-slot-modal');
  toast(t('cal_slot_saved'), 'success');
  renderSchedulePage();
}

function calToggleTask(id) {
  var tk = Storage.getTasks().find(function(x) { return x.id === id; });
  if (!tk) return;
  Storage.updateTask(id, {done: !tk.done});
  toast(tk.done ? t('toast_topic_undone') : '✅ Task done!', 'success');
  renderSchedulePage();
}

