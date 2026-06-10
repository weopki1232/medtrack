// ── Achievements ──────────────────────────────────────────────────────────────
function getAchievementProgress(id) {
  var sessions   = Storage.getSessions();
  var topicDone  = Storage.getTopicDone();
  var streak     = Storage.getStreak();
  var formulas   = Storage.getFormulas();
  var diagrams   = Storage.getDiagrams();
  var mistakes   = Storage.getMistakes();
  var totalHours = sessions.reduce(function(a,s){return a+s.duration;},0) / 60;
  var pomoCount  = sessions.filter(function(s){return s.type==='pomodoro';}).length;
  var doneCount  = Object.values(topicDone).filter(Boolean).length;
  var allTopics  = DEFAULT_SUBJECTS.reduce(function(a,s){return a+(s.topics?s.topics.length:0);},0);
  var sow = new Date(); sow.setDate(sow.getDate()-sow.getDay()); sow.setHours(0,0,0,0);
  var weekSubs   = new Set(sessions.filter(function(s){return new Date(s.date+'T00:00:00')>=sow;}).map(function(s){return s.subjectId;}));

  var map = {
    first_session: {current:sessions.length,                  target:1,                   unit:'session logged'},
    streak_3:      {current:streak.current,                    target:3,                   unit:'day streak'},
    streak_7:      {current:streak.current,                    target:7,                   unit:'day streak'},
    streak_30:     {current:streak.current,                    target:30,                  unit:'day streak'},
    hours_10:      {current:Math.round(totalHours*10)/10,      target:10,                  unit:'hours studied'},
    hours_50:      {current:Math.round(totalHours*10)/10,      target:50,                  unit:'hours studied'},
    hours_100:     {current:Math.round(totalHours*10)/10,      target:100,                 unit:'hours studied'},
    topics_10:     {current:doneCount,                         target:10,                  unit:'topics completed'},
    topics_all:    {current:doneCount,                         target:Math.max(1,allTopics),unit:'topics completed'},
    formulas_5:    {current:formulas.length,                   target:5,                   unit:'formulas saved'},
    diagram_1:     {current:diagrams.length,                   target:1,                   unit:'diagram created'},
    pomo_10:       {current:pomoCount,                         target:10,                  unit:'Pomodoro sessions'},
    all_round:     {current:weekSubs.size,                     target:DEFAULT_SUBJECTS.length, unit:'subjects this week'},
    mistake_5:     {current:mistakes.length,                   target:5,                   unit:'mistakes logged'},
  };
  var p = map[id] || {current:0, target:1, unit:''};
  p.pct = Math.min(100, Math.round(p.current / p.target * 100));
  return p;
}

function openAchievementModal(id) {
  var a = ACHIEVEMENTS.find(function(x){return x.id===id;});
  if (!a) return;
  var ach  = Storage.getAchievements();
  var done = !!ach[a.id];
  var ts   = done ? new Date(ach[a.id]).toLocaleDateString() : '';
  var p    = getAchievementProgress(id);
  var remaining = Math.max(0, p.target - p.current);

  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='ach-detail-modal';
  o.innerHTML =
    '<div class="modal-box" style="max-width:360px;text-align:center">'+
      '<div style="font-size:52px;margin-bottom:10px;'+(done?'':'filter:grayscale(1);opacity:.35')+';transition:all .3s">'+a.icon+'</div>'+
      '<div style="font-size:19px;font-weight:700;margin-bottom:4px">'+a.name+'</div>'+
      '<div style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5">'+a.desc+'</div>'+
      (done
        ? '<div style="background:color-mix(in srgb,var(--green) 12%,transparent);border:1px solid color-mix(in srgb,var(--green) 30%,transparent);border-radius:10px;padding:12px 16px;margin-bottom:20px">'+
            '<div style="font-size:20px;margin-bottom:4px">✅</div>'+
            '<div style="font-weight:600;color:var(--green)">'+t('ach_unlocked_at')+'</div>'+
            '<div style="font-size:13px;color:var(--muted);margin-top:2px">'+ts+'</div>'+
          '</div>'
        : '<div style="margin-bottom:20px;text-align:left">'+
            '<div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12px;margin-bottom:6px">'+
              '<span style="color:var(--muted);font-weight:500">Progress</span>'+
              '<span style="font-weight:700">'+p.current+' <span style="color:var(--muted);font-weight:400">/ '+p.target+' '+p.unit+'</span></span>'+
            '</div>'+
            '<div class="progress-bar progress-bar-lg" style="background:var(--bg3)">'+
              '<div class="progress-fill" style="width:'+p.pct+'%;background:'+
                (p.pct>=100?'var(--green)':p.pct>=60?'var(--primary-l)':'var(--amber)')+
                ';transition:width .6s cubic-bezier(.22,1,.36,1)"></div>'+
            '</div>'+
            '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:5px">'+
              '<span>'+p.pct+'% there</span>'+
              '<span>'+(remaining > 0 ? remaining+' '+p.unit+' to go' : 'Complete!')+'</span>'+
            '</div>'+
          '</div>'
      )+
      '<button class="btn btn-outline" onclick="closeModal(\'ach-detail-modal\')">Close</button>'+
    '</div>';
  o.addEventListener('click', function(e){ if(e.target===o) closeModal('ach-detail-modal'); });
  document.body.appendChild(o);
}

function renderAchievementsStrip() {
  var ach = Storage.getAchievements();
  var total = ACHIEVEMENTS.length;
  var unlockedCount = Object.keys(ach).length;
  var html = '<div class="card"><div class="section-header" style="margin-bottom:12px"><span class="section-title">🏆 '+t('ach_title')+'</span><span style="font-size:12px;color:var(--muted)">'+unlockedCount+' / '+total+'</span></div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
  ACHIEVEMENTS.forEach(function(a) {
    var done = !!ach[a.id];
    var p = getAchievementProgress(a.id);
    var barColor = p.pct>=100?'var(--green)':p.pct>=60?'var(--primary-l)':'var(--amber)';
    html += '<div id="ach-badge-'+a.id+'" onclick="openAchievementModal(\''+a.id+'\')" '+
      'class="ach-badge'+(done?' ach-done':'')+'" '+
      'style="display:flex;flex-direction:column;gap:4px;padding:8px 10px;border-radius:10px;font-size:12px;'+
        'background:'+(done?'color-mix(in srgb,var(--primary) 18%,transparent)':'var(--bg3)')+';'+
        'color:'+(done?'var(--primary-l)':'var(--muted)')+';'+
        'border:1px solid '+(done?'color-mix(in srgb,var(--primary) 30%,transparent)':'var(--border)')+';'+
        'min-width:100px">';
    html += '<div style="display:flex;align-items:center;gap:6px">'+
      '<span class="ach-icon'+(done?' ach-done':'')+'" style="font-size:18px;'+(done?'':'filter:grayscale(1);opacity:.35')+'">'+a.icon+'</span>'+
      '<span class="ach-text'+(done?' ach-done':'')+'" style="font-size:12px">'+a.name+'</span>'+
    '</div>';
    if (!done) {
      html += '<div style="height:3px;background:var(--border);border-radius:99px;overflow:hidden;margin-top:2px">'+
        '<div style="height:100%;width:'+p.pct+'%;background:'+barColor+';border-radius:99px;transition:width .4s"></div>'+
      '</div>'+
      '<div style="font-size:10px;opacity:.6">'+p.current+' / '+p.target+'</div>';
    } else {
      html += '<div style="font-size:10px;color:var(--green);font-weight:500">✓ Done</div>';
    }
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function checkAchievements() {
  var sessions = Storage.getSessions();
  var topicDone = Storage.getTopicDone();
  var streak = Storage.getStreak();
  var formulas = Storage.getFormulas();
  var diagrams = Storage.getDiagrams ? Storage.getDiagrams() : [];
  var mistakes = Storage.getMistakes();
  var totalMins = sessions.reduce(function(a,s){return a+s.duration;},0);
  var totalHours = totalMins / 60;
  var pomoSessions = sessions.filter(function(s){return s.type==='pomodoro';}).length;
  var doneCount = Object.values(topicDone).filter(Boolean).length;
  var allTopicCount = DEFAULT_SUBJECTS.reduce(function(a,s){return a+(s.topics?s.topics.length:0);},0);

  // Check what subjects were studied this week
  var now = new Date(); var dow = now.getDay();
  var sow = new Date(now); sow.setDate(now.getDate()-dow); sow.setHours(0,0,0,0);
  var thisWeekSubs = new Set(sessions.filter(function(s){return new Date(s.date+'T00:00:00')>=sow;}).map(function(s){return s.subjectId;}));

  var checks = [
    {id:'first_session',  pass: sessions.length >= 1},
    {id:'streak_3',       pass: streak.current >= 3},
    {id:'streak_7',       pass: streak.current >= 7},
    {id:'streak_30',      pass: streak.current >= 30},
    {id:'hours_10',       pass: totalHours >= 10},
    {id:'hours_50',       pass: totalHours >= 50},
    {id:'hours_100',      pass: totalHours >= 100},
    {id:'topics_10',      pass: doneCount >= 10},
    {id:'topics_all',     pass: allTopicCount > 0 && doneCount >= allTopicCount},
    {id:'formulas_5',     pass: formulas.length >= 5},
    {id:'diagram_1',      pass: diagrams.length >= 1},
    {id:'pomo_10',        pass: pomoSessions >= 10},
    {id:'all_round',      pass: thisWeekSubs.size >= DEFAULT_SUBJECTS.length},
    {id:'mistake_5',      pass: mistakes.length >= 5},
  ];

  var newIds = [];
  checks.forEach(function(c) {
    if (c.pass && Storage.unlockAch(c.id)) {
      newIds.push(c.id);
      var a = ACHIEVEMENTS.find(function(x){return x.id===c.id;});
      if (a) toast(a.icon + ' ' + t('ach_new') + ' ' + a.name, 'success');
    }
  });

  if (newIds.length) {
    // Refresh the achievements section in the DOM so badges flip to "done" state
    var achSec = document.getElementById('ds-achievements');
    if (achSec) achSec.innerHTML = renderAchievementsStrip();

    // Then fire burst animation on each newly-unlocked badge
    setTimeout(function() {
      newIds.forEach(function(id) {
        var badge = document.getElementById('ach-badge-' + id);
        if (!badge) return;
        badge.classList.add('ach-new');
        badge.querySelectorAll('.ach-icon, .ach-text').forEach(function(el) { el.classList.add('ach-new'); });
        setTimeout(function() {
          badge.classList.remove('ach-new');
          badge.querySelectorAll('.ach-icon, .ach-text').forEach(function(el) { el.classList.remove('ach-new'); });
        }, 1200);
      });
    }, 60);
  }
}

