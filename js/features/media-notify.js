// ── Ambient Sound (YouTube iframe) ────────────────────────────────────────────
function _parseYtId(url) {
  if (!url) return null;
  url = url.trim();
  var m;
  m = url.match(/[?&]list=([^&]+)/);   if (m) return {type:'playlist', id:m[1]};
  m = url.match(/youtu\.be\/([^?&\s]+)/); if (m) return {type:'video', id:m[1]};
  m = url.match(/[?&]v=([^&\s]+)/);    if (m) return {type:'video', id:m[1]};
  m = url.match(/\/embed\/([^?&\s]+)/);if (m) return {type:'video', id:m[1]};
  // bare video ID (11 chars, no slash)
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return {type:'video', id:url};
  return null;
}

function startAmbientSound(url) {
  stopAmbientSound();
  if (!url) { _ambientType = ''; renderSettings(); return; }
  var parsed = _parseYtId(url);
  if (!parsed) { toast('Paste a valid YouTube URL', 'warning'); return; }
  var src = parsed.type === 'playlist'
    ? 'https://www.youtube.com/embed/videoseries?list='+parsed.id+'&autoplay=1&mute=0&enablejsapi=1'
    : 'https://www.youtube.com/embed/'+parsed.id+'?autoplay=1&loop=1&playlist='+parsed.id+'&enablejsapi=1';
  var container = document.getElementById('yt-ambient-container');
  if (!container) return;
  var iframe = document.createElement('iframe');
  iframe.id = 'yt-ambient-iframe';
  iframe.width = '320'; iframe.height = '180';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.frameBorder = '0';
  iframe.src = src;
  container.appendChild(iframe);
  var wrap = document.getElementById('yt-player-wrap');
  if (wrap) wrap.style.display = 'block';
  _ambientType = url;
  Storage.saveSettings({ambientUrl: url});
  renderSettings();
}

function stopAmbientSound() {
  var container = document.getElementById('yt-ambient-container');
  if (container) container.innerHTML = '';
  var wrap = document.getElementById('yt-player-wrap');
  if (wrap) wrap.style.display = 'none';
  _ambientSrc = null; _ambientCtx = null; _ambientGain = null; _ambientType = '';
  Storage.saveSettings({ambientUrl: ''});
  renderSettings();
}

function toggleMiniPlayer() {
  var c = document.getElementById('yt-ambient-container');
  var btn = document.getElementById('yt-mini-toggle');
  if (!c) return;
  var minimized = c.style.display === 'none';
  c.style.display = minimized ? 'block' : 'none';
  if (btn) btn.textContent = minimized ? 'Minimize' : 'Expand';
}

function playAmbientFromInput() {
  var inp = document.getElementById('yt-url-input');
  startAmbientSound(inp ? inp.value.trim() : '');
}

// ── Browser Notifications ──────────────────────────────────────────────────────
function requestNotifPermission(cb) {
  if (!('Notification' in window)) { toast(t('notif_denied'), 'warning'); return; }
  if (Notification.permission === 'granted') { if (cb) cb(); return; }
  Notification.requestPermission().then(function(p) {
    if (p === 'granted') { if (cb) cb(); }
    else toast(t('notif_denied'), 'warning');
  });
}

function initStudyReminder() {
  var s = getSettings();
  if (!s.notifEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  var parts = (s.notifTime || '20:00').split(':');
  var now = new Date();
  var fire = new Date(now);
  fire.setHours(parseInt(parts[0]||20), parseInt(parts[1]||0), 0, 0);
  if (fire <= now) fire.setDate(fire.getDate() + 1);
  var ms = fire - now;
  setTimeout(function() {
    // Only fire if today's goal not met
    var goal = s.dailyGoalMinutes || 90;
    var todayMins = Storage.getSessions().filter(function(x){return x.date===today();}).reduce(function(a,x){return a+x.duration;},0);
    if (todayMins < goal) {
      try { new Notification('MedTrack', {body:t('notif_msg'), icon:''}); } catch(e){}
    }
    initStudyReminder(); // re-schedule for tomorrow
  }, ms);
}

// ── Print Weekly Report ────────────────────────────────────────────────────────
function printWeeklyReport() {
  var sessions = Storage.getSessions();
  var now = new Date(); var dow = now.getDay();
  var sow = new Date(now); sow.setDate(now.getDate()-dow); sow.setHours(0,0,0,0);
  var weekSess = sessions.filter(function(s){ return new Date(s.date+'T00:00:00')>=sow; });
  var totals = {};
  weekSess.forEach(function(s){ totals[s.subjectId]=(totals[s.subjectId]||0)+s.duration; });
  var totalMins = weekSess.reduce(function(a,s){return a+s.duration;},0);
  var ach = Storage.getAchievements();
  var unlocked = ACHIEVEMENTS.filter(function(a){return !!ach[a.id];});
  var streak = Storage.getStreak();

  var rowsHtml = DEFAULT_SUBJECTS.filter(function(s){return totals[s.id];}).map(function(s){
    return '<tr><td>'+s.icon+' '+s.name+'</td><td style="text-align:right">'+fmtMins(totals[s.id]||0)+'</td></tr>';
  }).join('');

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MedTrack Weekly Report</title><style>'+
    'body{font-family:Georgia,serif;max-width:640px;margin:40px auto;color:#1a1206;padding:0 24px}'+
    'h1{font-size:26px;font-weight:700;margin-bottom:4px}h2{font-size:16px;font-weight:600;margin:24px 0 8px;border-bottom:2px solid #c05818;padding-bottom:4px;color:#c05818}'+
    'table{width:100%;border-collapse:collapse;margin-bottom:16px}td{padding:7px 0;border-bottom:1px solid #e0d0b8;font-size:14px}'+
    '.total{font-weight:700;font-size:15px}.ach{display:inline-block;padding:4px 10px;background:#fef3c7;border-radius:6px;margin:3px;font-size:13px}'+
    '@media print{body{margin:0}}'+
  '</style></head><body>'+
  '<h1>📚 MedTrack Weekly Report</h1>'+
  '<p style="color:#7a6050;font-size:13px">Week of '+sow.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+' &mdash; Generated '+now.toLocaleDateString('en-GB')+'</p>'+
  '<h2>Study Time This Week</h2>'+
  '<table>'+rowsHtml+
  '<tr class="total"><td>Total</td><td style="text-align:right">'+fmtMins(totalMins)+'</td></tr>'+
  '</table>'+
  '<h2>Streak</h2><p>Current: <strong>'+streak.current+' days</strong> &nbsp;|&nbsp; Best: <strong>'+streak.best+' days</strong></p>'+
  (unlocked.length?'<h2>Achievements</h2><div>'+unlocked.map(function(a){return '<span class="ach">'+a.icon+' '+a.name+'</span>';}).join('')+'</div>':'')+
  '<p style="font-size:11px;color:#9a8070;margin-top:32px">MedTrack — TCAS Study Tracker</p>'+
  '</body></html>';

  var w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(function(){ w.print(); }, 400); }
}

