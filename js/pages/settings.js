// ── Settings ──────────────────────────────────────────────────────────────────
function renderSettings(){
  const s=getSettings();
  document.getElementById('page-settings').innerHTML=
  '<div style="max-width:560px;display:flex;flex-direction:column;gap:16px">'+
  '<div class="card"><div class="section-title" style="margin-bottom:16px">'+t('set_general')+'</div>'+
  '<div class="form-group"><label class="label">'+t('set_name')+'</label><input class="input" id="set-name" value="'+s.userName+'"></div>'+
  '<div class="form-group"><label class="label">'+t('set_goal')+'</label><input type="number" class="input" id="set-goal" value="'+s.dailyGoalMinutes+'" min="15" max="720"></div>'+
  '<div class="form-group" style="display:flex;align-items:center;justify-content:space-between"><label class="label" style="margin:0">'+t('set_dark')+'</label><div class="pill-tabs" style="gap:2px"><button class="pill-tab '+(s.darkModeAuto?'active':'')+'" onclick="setDarkMode(\'auto\')" style="padding:5px 10px;font-size:12px">'+t('set_dark_auto')+'</button><button class="pill-tab '+((!s.darkModeAuto&&s.darkMode)?'active':'')+'" onclick="setDarkMode(\'dark\')" style="padding:5px 10px;font-size:12px">🌙 '+t('set_dark_dark')+'</button><button class="pill-tab '+((!s.darkModeAuto&&!s.darkMode)?'active':'')+'" onclick="setDarkMode(\'light\')" style="padding:5px 10px;font-size:12px">☀️ '+t('set_dark_light')+'</button></div></div>'+
  '<div class="form-group" style="display:flex;align-items:center;justify-content:space-between;margin:0"><label class="label" style="margin:0">'+t('set_sound')+'</label><button class="btn '+(s.soundEnabled?'btn-primary':'btn-outline')+' btn-sm" onclick="toggleSound()">'+(s.soundEnabled?'🔔 '+t('set_on'):'🔕 '+t('set_off'))+'</button></div>'+
  '<div class="form-group" style="display:flex;align-items:center;justify-content:space-between;margin:0"><div><label class="label" style="margin:0">Animation Quality</label><div style="font-size:11px;color:var(--muted)">Min = lower CPU · Max = full quality</div></div><div class="pill-tabs" style="gap:2px"><button class="pill-tab '+(_powerMode==='min'?'active':'')+'" onclick="togglePowerMode()" style="padding:5px 12px;font-size:12px">⚡ Min</button><button class="pill-tab '+(_powerMode==='max'?'active':'')+'" onclick="togglePowerMode()" style="padding:5px 12px;font-size:12px">🔥 Max</button></div></div>'+
  '<div class="form-group" style="display:flex;align-items:center;justify-content:space-between"><div><label class="label" style="margin:0">'+t('set_auto_sched')+'</label><div style="font-size:11px;color:var(--muted)">'+t('set_auto_sched_desc')+'</div></div><button class="btn '+(s.autoSchedule!==false?'btn-primary':'btn-outline')+' btn-sm" onclick="toggleAutoSchedule()">'+(s.autoSchedule!==false?'✅ '+t('set_auto_sched_on'):'⬜ '+t('set_auto_sched_off'))+'</button></div>'+
  '</div>'+
  // ── Generation & exam dates card ──────────────────────────────────────────
  (function(){
    var cdc = s.countdown || {mode:'exam', examId:'tpat1'};
    var exams = getExamDates();
    var h = '<div class="card"><div class="section-title" style="margin-bottom:12px">'+t('set_gen_title')+'</div>'+
    '<div class="form-group"><label class="label">'+t('set_gen_label')+'</label><input type="number" class="input" id="set-generation" value="'+getGeneration()+'" min="60" max="200" onchange="saveGenerationUI(this.value)" style="max-width:120px"><div style="font-size:11px;color:var(--muted);margin-top:4px">'+t('set_gen_desc')+'</div></div>'+
    '<div class="form-group"><label class="label">'+t('set_countdown_title')+'</label><select class="input" id="set-countdown-exam" onchange="saveCountdownUI()">'+
      exams.map(function(e){return '<option value="'+e.id+'"'+(cdc.mode!=='custom'&&(cdc.examId||'tpat1')===e.id?' selected':'')+'>'+e.label+' ('+fmtDate(e.date)+')</option>';}).join('')+
      '<option value="__custom"'+(cdc.mode==='custom'?' selected':'')+'>✏️ '+t('set_countdown_custom')+'</option></select>'+
      (cdc.mode==='custom'?'<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input class="input" id="set-countdown-label" placeholder="'+t('set_countdown_custom_label')+'" value="'+escHtml(cdc.label||'')+'" onchange="saveCountdownUI()" style="flex:1;min-width:140px"><input type="date" class="input" id="set-countdown-date" value="'+(cdc.date||'')+'" onchange="saveCountdownUI()" style="max-width:170px"></div>':'')+
    '</div>'+
    '<div class="form-group" style="margin:0"><label class="label">'+t('set_exam_dates')+'</label>'+
      exams.map(function(e){return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:8px;height:8px;border-radius:50%;background:'+e.color+';flex-shrink:0"></span><span style="flex:1;font-size:12px">'+e.label+'</span><input type="date" class="input" style="max-width:165px;width:auto;font-size:12px;padding:4px 8px" value="'+e.date+'" onchange="saveExamDateUI(\''+e.id+'\',this.value)"></div>';}).join('')+
      '<button class="btn btn-ghost btn-sm" style="margin-top:4px" onclick="resetExamDatesUI()">'+t('set_exam_reset')+'</button>'+
    '</div></div>';
    return h;
  })()+

  '<div class="card"><div class="section-title" style="margin-bottom:16px">'+t('set_pomo')+'</div>'+
  '<div class="grid-2" style="gap:10px">'+
  '<div class="form-group"><label class="label">'+t('set_work')+'</label><input type="number" class="input" id="set-pomo-work" value="'+s.pomodoroWork+'" min="5" max="120"></div>'+
  '<div class="form-group"><label class="label">'+t('set_short')+'</label><input type="number" class="input" id="set-pomo-short" value="'+s.pomodoroShortBreak+'" min="1" max="30"></div>'+
  '<div class="form-group"><label class="label">'+t('set_long')+'</label><input type="number" class="input" id="set-pomo-long" value="'+s.pomodoroLongBreak+'" min="5" max="60"></div>'+
  '<div class="form-group"><label class="label">'+t('set_cycles')+'</label><input type="number" class="input" id="set-pomo-cycles" value="'+s.pomodoroCycles+'" min="2" max="8"></div>'+
  '</div></div>'+
  '<button class="btn btn-primary" onclick="saveSettings()">'+t('set_save')+'</button>'+

  // ── Notifications card ───────────────────────────────────────────────────
  '<div class="card"><div class="section-title" style="margin-bottom:12px">🔔 '+t('notif_title')+'</div>'+
  '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'+
    '<span style="font-size:13px;color:var(--muted)">'+t('notif_enable')+'</span>'+
    '<button class="btn '+(s.notifEnabled?'btn-primary':'btn-outline')+' btn-sm" onclick="toggleNotif()">'+
      (s.notifEnabled?'✅ '+t('set_on'):'⬜ '+t('set_off'))+
    '</button>'+
  '</div>'+
  (s.notifEnabled?'<div style="display:flex;align-items:center;gap:10px"><label class="label" style="margin:0;white-space:nowrap">'+t('notif_time')+'</label><input type="time" class="input" style="max-width:140px" id="set-notif-time" value="'+(s.notifTime||'20:00')+'" onchange="saveNotifTime(this.value)"></div>':'')+'</div>'+

  // ── Ambient sound card (YouTube) ──────────────────────────────────────────
  '<div class="card"><div class="section-title" style="margin-bottom:12px">🎵 '+t('sound_title')+'</div>'+
  '<div style="font-size:12px;color:var(--muted);margin-bottom:10px">Paste any YouTube lofi / study music URL</div>'+
  '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
    '<input class="input" id="yt-url-input" placeholder="https://youtube.com/watch?v=..." style="flex:1;min-width:200px" value="'+escHtml(s.ambientUrl||'')+'" onkeydown="if(event.key===\'Enter\')playAmbientFromInput()">'+
    '<button class="btn btn-primary btn-sm" onclick="playAmbientFromInput()">▶ Play</button>'+
    (_ambientType?'<button class="btn btn-outline btn-sm" onclick="stopAmbientSound()">■ Stop</button>':'')+
  '</div>'+
  (_ambientType?'<div style="font-size:11px;color:var(--green);margin-top:8px">▶ Playing — use your system volume to adjust</div>':'')+
  '</div>'+

  // ── Print report button ──────────────────────────────────────────────────
  '<div class="card"><div class="section-title" style="margin-bottom:12px">📊 Report</div>'+
  '<div style="display:flex;gap:10px;flex-wrap:wrap">'+
    '<button class="btn btn-outline btn-sm" onclick="printWeeklyReport()">'+t('print_report')+'</button>'+
  '</div></div>'+

  '<div class="card"><div class="section-title" style="margin-bottom:12px">'+t('set_data')+'</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" onclick="exportData()">'+t('set_export')+'</button><button class="btn btn-outline btn-sm" onclick="importData()">'+t('set_import')+'</button><button class="btn btn-danger btn-sm" onclick="clearAllData()">'+t('set_clear')+'</button></div></div>'+
  '<div class="card"><div class="section-title" style="margin-bottom:4px">'+t('set_theme')+'</div><div style="font-size:12px;color:var(--muted);margin-bottom:2px">'+t('set_theme_sub')+'</div><div class="theme-grid">'+
  [
    {id:'default',  label:'Default',  bg:'#0f1117', accent:'#a78bfa'},
    {id:'oled',     label:'OLED',     bg:'#000000', accent:'#a78bfa'},
    {id:'neon',     label:'Neon',     bg:'#07071a', accent:'#d966ff'},
    {id:'cyber',    label:'Cyber',    bg:'#010b16', accent:'#38bdf8'},
    {id:'minimal',  label:'Minimal',  bg:'#f8f9fa', accent:'#845ef7'},
    {id:'academia',  label:'Academia',  bg:'#1c1510', accent:'#d4941a'},
    {id:'enchant',   label:'Enchant ✨', bg:'#0f0b1c', accent:'#c06aff'},
    {id:'parchment', label:'Parchment', bg:'#f0e3c4', accent:'#c05818'},
  ].map(function(th){
    var active = (s.theme||'default')===th.id;
    return '<div class="theme-swatch'+(active?' active':'')+'" style="background:'+th.bg+';color:'+th.accent+'" onclick="applyTheme(\''+th.id+'\')">'+th.label+'</div>';
  }).join('')+
  '</div></div>'+
  '<div class="card"><div class="section-title" style="margin-bottom:10px">'+t('set_lang')+'</div><div style="display:flex;gap:10px;align-items:center">'+
  '<button class="btn '+(s.lang==='en'||!s.lang?'btn-primary':'btn-outline')+' btn-sm" onclick="setLang(\'en\')">🇬🇧 English</button>'+
  '<button class="btn '+(s.lang==='th'?'btn-primary':'btn-outline')+' btn-sm" onclick="setLang(\'th\')">🇹🇭 ภาษาไทย</button>'+
  '</div></div>'+
  '</div>';
}
function saveSettings(){Storage.saveSettings({userName:document.getElementById('set-name').value||'Student',dailyGoalMinutes:parseInt(document.getElementById('set-goal').value||'90'),pomodoroWork:parseInt(document.getElementById('set-pomo-work').value||'25'),pomodoroShortBreak:parseInt(document.getElementById('set-pomo-short').value||'5'),pomodoroLongBreak:parseInt(document.getElementById('set-pomo-long').value||'15'),pomodoroCycles:parseInt(document.getElementById('set-pomo-cycles').value||'4')});toast(t('toast_settings_saved'),'success');}
function saveGenerationUI(v){
  var g = parseInt(v, 10);
  if (!g || g < 60 || g > 200) { toast('60–200', 'error'); return; }
  Storage.saveSettings({generation:g});
  toast(t('toast_gen_saved'), 'success');
  updateCountdownSidebar(); renderSettings();
}
function saveExamDateUI(id, date){
  if (!date) return;
  var ov = Object.assign({}, getSettings().examDates || {});
  ov[id] = date;
  Storage.saveSettings({examDates:ov});
  toast(t('toast_exam_saved'), 'success');
  updateCountdownSidebar();
}
function resetExamDatesUI(){
  Storage.saveSettings({examDates:{}});
  toast(t('toast_exam_saved'), 'success');
  updateCountdownSidebar(); renderSettings();
}
function saveCountdownUI(){
  var sel = document.getElementById('set-countdown-exam');
  if (sel.value === '__custom') {
    var lblEl = document.getElementById('set-countdown-label'), dEl = document.getElementById('set-countdown-date');
    Storage.saveSettings({countdown:{mode:'custom', label:(lblEl?lblEl.value:''), date:(dEl?dEl.value:'')}});
  } else {
    Storage.saveSettings({countdown:{mode:'exam', examId:sel.value}});
  }
  toast(t('toast_countdown_saved'), 'success');
  updateCountdownSidebar(); renderSettings();
}
function setDarkMode(mode){
  var isAuto=(mode==='auto');
  var isDark=isAuto?window.matchMedia('(prefers-color-scheme: dark)').matches:(mode==='dark');
  Storage.saveSettings({darkMode:isDark,darkModeAuto:isAuto});
  document.body.classList.toggle('light-mode',!isDark);
  renderSettings();
}
function toggleDarkMode(){var s=getSettings();setDarkMode(s.darkMode?'light':'dark');}
function toggleSound(){const s=getSettings();Storage.saveSettings({soundEnabled:!s.soundEnabled});renderSettings();}
function exportData(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('mt_'))data[k]=localStorage.getItem(k);}const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='medtrack-backup-'+today()+'.json';a.click();toast(t('toast_exported'),'success');}
function importData(){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=function(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=function(ev){try{const d=JSON.parse(ev.target.result);Object.entries(d).forEach(function(kv){if(kv[0].startsWith('mt_'))localStorage.setItem(kv[0],kv[1]);});toast(t('toast_imported'),'success');setTimeout(function(){location.reload();},1200);}catch(ex){toast('Invalid file','error');}};r.readAsText(f);};i.click();}
function clearAllData(){if(!confirm(t('confirm_clear_data')))return;Object.keys(localStorage).filter(k=>k.startsWith('mt_')).forEach(k=>localStorage.removeItem(k));toast(t('toast_cleared'),'info');setTimeout(function(){location.reload();},1000);}

// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(name) {
  _diagBgCache = null;
  var themes = ['theme-oled','theme-neon','theme-cyber','theme-minimal','theme-academia','theme-enchant','theme-parchment'];
  document.body.classList.remove.apply(document.body.classList, themes);
  if (name && name !== 'default') document.body.classList.add('theme-'+name);
  Storage.saveSettings({theme: name});
  renderSettings();
  if (name === 'parchment') setTimeout(function(){ showNpcMessage("Ah, a cosy theme. Good choice. Now study. 📚"); }, 800);
}

