// ── Insights helpers ──────────────────────────────────────────────────────────
function getWeekMins(weeksAgo) {
  var now = new Date();
  var startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay() - weeksAgo * 7); startOfWeek.setHours(0,0,0,0);
  var endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 7);
  return Storage.getSessions().filter(function(s) {
    var d = new Date(s.date + 'T00:00:00'); return d >= startOfWeek && d < endOfWeek;
  }).reduce(function(a,s) { return a + s.duration; }, 0);
}

function computeInsights() {
  var sessions = Storage.getSessions();
  var totals   = Storage.getSubjectTotals();
  var topicDone= Storage.getTopicDone();

  // avg session
  var avgLen = sessions.length ? Math.round(sessions.reduce(function(a,s){return a+s.duration;},0)/sessions.length) : 0;

  // best hour from timestamps
  var hourBuckets = new Array(24).fill(0);
  sessions.forEach(function(s){ if(s.timestamp){ var h=new Date(s.timestamp).getHours(); hourBuckets[h]+=s.duration; }});
  var bestHour = hourBuckets.indexOf(Math.max.apply(null, hourBuckets));
  var bestHourMins = hourBuckets[bestHour];

  // best weekday
  var dayBuckets = new Array(7).fill(0);
  sessions.forEach(function(s){ var d=new Date(s.date+'T00:00:00').getDay(); dayBuckets[d]+=s.duration; });
  var bestDayIdx = dayBuckets.indexOf(Math.max.apply(null, dayBuckets));
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // burnout
  var thisW = getWeekMins(0), lastW = getWeekMins(1);
  var dropPct = lastW > 0 ? Math.round((1 - thisW/lastW)*100) : 0;
  var streak = Storage.getStreak();

  // consistency (last 30 days)
  var history = streak.history || [];
  var studied30 = 0;
  for (var i=0; i<30; i++) { var d=new Date(); d.setDate(d.getDate()-i); if(history.includes(d.toISOString().split('T')[0])) studied30++; }
  var consistency = Math.round(studied30/30*100);

  // most skipped
  var sessionCounts = {};
  sessions.forEach(function(s){ sessionCounts[s.subjectId]=(sessionCounts[s.subjectId]||0)+1; });
  var mostSkipped = getSubjects().reduce(function(worst,s){ return (!worst||(sessionCounts[s.id]||0)<(sessionCounts[worst.id]||0))?s:worst; }, null);

  // longest session
  var longestSession = sessions.reduce(function(mx,s){ return s.duration>mx?s.duration:mx; }, 0);

  // weakness ranking
  var weaknesses = getSubjects().map(function(s) {
    var mins = totals[s.id]||0;
    var hScore = Math.min(1, mins/(s.targetHours*60));
    var td = s.topics.filter(function(t){return topicDone[t.id];}).length;
    var tScore = s.topics.length ? td/s.topics.length : 0;
    return { s:s, score:(hScore+tScore)/2, hPct:Math.round(hScore*100), tPct:Math.round(tScore*100), mins:mins, td:td };
  }).sort(function(a,b){return a.score-b.score;});

  // goal projections
  var projections = getSubjects().map(function(s) {
    var logged = (totals[s.id]||0)/60;
    var remaining = Math.max(0, s.targetHours - logged);
    var last14 = sessions.filter(function(x){
      var cutoff=new Date(); cutoff.setDate(cutoff.getDate()-14);
      return x.subjectId===s.id && new Date(x.date+'T00:00:00')>=cutoff;
    });
    var avgDayH = last14.reduce(function(a,x){return a+x.duration;},0)/60/14;
    var daysLeft = avgDayH>0.01 ? Math.ceil(remaining/avgDayH) : null;
    var eta = daysLeft ? new Date(Date.now()+daysLeft*86400000).toISOString().split('T')[0] : null;
    return { s:s, logged:Math.round(logged*10)/10, remaining:Math.round(remaining*10)/10, daysLeft:daysLeft, eta:eta, pct:Math.min(100,Math.round(logged/s.targetHours*100)) };
  });

  var recovery = computeRecoveryRate(history);

  return { sessions:sessions, avgLen:avgLen, bestHour:bestHour, bestHourMins:bestHourMins, bestDayIdx:bestDayIdx, DAYS:DAYS, thisW:thisW, lastW:lastW, dropPct:dropPct, streak:streak, consistency:consistency, mostSkipped:mostSkipped, longestSession:longestSession, weaknesses:weaknesses, projections:projections, sessionCounts:sessionCounts, recovery:recovery };
}

// ── Insights page ─────────────────────────────────────────────────────────────
function renderInsights() {
  var I = computeInsights();
  var el = document.getElementById('page-insights');
  if (!el) return;

  if (I.sessions.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🧠</div><p>'+t('no_data')+'</p></div>';
    return;
  }

  var hLabel = I.bestHourMins > 0 ? (I.bestHour+':00–'+(I.bestHour+1)+':00') : '—';
  var burnoutClass = I.dropPct >= 50 ? 'insight-alert' : I.dropPct >= 25 ? 'insight-warn' : 'insight-good';
  var burnoutIcon  = I.dropPct >= 50 ? '🚨' : I.dropPct >= 25 ? '⚠️' : '✅';
  var onTrack = (Storage.getSettings().lang==='th') ? 'ตามแผน' : 'On Track';
  var burnoutVal   = I.dropPct >= 25 ? 'Down '+I.dropPct+'%' : onTrack;
  var burnoutSub   = I.dropPct >= 50 ? t('ins_drop_sharp') :
                     I.dropPct >= 25 ? t('ins_drop_slight') :
                     t('ins_great');

  var html = '<div style="display:flex;flex-direction:column;gap:24px">';

  // ── Pattern cards
  html += '<div><div class="section-header"><span class="section-title">'+t('sec_patterns')+'</span></div>';
  html += '<div class="grid-4">';
  html += '<div class="insight-card"><div class="insight-icon">⏱</div><div class="insight-lbl">'+t('avg_session')+'</div><div class="insight-val">'+fmtMins(I.avgLen)+'</div><div class="insight-sub">'+t('ins_per_block')+'</div></div>';
  html += '<div class="insight-card"><div class="insight-icon">🕐</div><div class="insight-lbl">'+t('peak_hour')+'</div><div class="insight-val">'+(I.bestHourMins>0?hLabel:'—')+'</div><div class="insight-sub">'+t('ins_productive')+'</div></div>';
  html += '<div class="insight-card"><div class="insight-icon">📅</div><div class="insight-lbl">'+t('best_day')+'</div><div class="insight-val">'+(I.sessions.length?I.DAYS[I.bestDayIdx]:'—')+'</div><div class="insight-sub">'+t('ins_high_vol')+'</div></div>';
  html += '<div class="insight-card '+(I.longestSession>=90?'insight-good':'')+'"><div class="insight-icon">🏆</div><div class="insight-lbl">'+t('ins_longest')+'</div><div class="insight-val">'+fmtMins(I.longestSession)+'</div><div class="insight-sub">'+t('ins_personal_best')+'</div></div>';
  html += '</div></div>';

  // ── Burnout + Consistency
  html += '<div class="grid-2">';
  html += '<div><div class="section-header"><span class="section-title">'+t('sec_burnout')+'</span></div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  html += '<div class="insight-card '+burnoutClass+'"><div class="insight-icon">'+burnoutIcon+'</div><div class="insight-lbl">'+t('ins_wow')+'</div><div class="insight-val">'+burnoutVal+'</div><div class="insight-sub">'+burnoutSub+'</div></div>';
  html += '<div class="insight-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="insight-lbl">'+t('this_week')+'</span><span class="insight-lbl">'+t('last_week')+'</span></div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:18px;font-weight:700;color:var(--primary-l)">'+fmtMins(I.thisW)+'</span><span style="font-size:13px;color:var(--muted)">vs '+fmtMins(I.lastW)+'</span></div>';
  if (I.streak.current >= 14) { html += '<div class="insight-sub" style="color:var(--amber);margin-top:6px">⚡ '+I.streak.current+'-day streak — make sure to rest!</div>'; }
  html += '</div></div></div>';
  html += '<div><div class="section-header"><span class="section-title">'+t('sec_stats')+'</span></div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px">';
  html += '<div class="insight-card '+(I.consistency>=70?'insight-good':I.consistency>=40?'insight-warn':'insight-alert')+'"><div class="insight-icon">'+(I.consistency>=70?'💪':I.consistency>=40?'📊':'😴')+'</div><div class="insight-lbl">'+t('consistency')+' (last 30 days)</div><div class="insight-val">'+I.consistency+'%</div><div class="insight-sub">'+t('ins_studied_of',{n:Math.round(I.consistency*30/100)})+'</div></div>';
  html += '<div class="insight-card"><div class="insight-icon">🚫</div><div class="insight-lbl">'+t('most_skipped')+'</div><div class="insight-val">'+(I.mostSkipped?I.mostSkipped.icon+' '+I.mostSkipped.shortName:'—')+'</div><div class="insight-sub">'+(I.mostSkipped?(I.sessionCounts[I.mostSkipped.id]||0)+' '+t('sessions_logged'):'')+'</div></div>';
  var recovClass = I.recovery ? (I.recovery.avg<=2?'insight-good':I.recovery.avg<=5?'insight-warn':'insight-alert') : '';
  var recovIcon  = I.recovery ? (I.recovery.avg<=2?'⚡':I.recovery.avg<=5?'🔄':'😓') : '✅';
  var recovVal   = I.recovery ? t('ins_bounce_days',{n:I.recovery.avg}) : t('ins_bounce_none');
  var recovSub   = I.recovery ? t(I.recovery.count>1?'recovery_gaps':'recovery_gap',{n:I.recovery.count}) : t('ins_bounce_none');
  html += '<div class="insight-card '+recovClass+'"><div class="insight-icon">'+recovIcon+'</div><div class="insight-lbl">'+t('ins_recovery')+'</div><div class="insight-val">'+recovVal+'</div><div class="insight-sub">'+recovSub+'</div></div>';
  html += '</div></div>';
  html += '</div>';

  // ── Weakness analysis
  html += '<div><div class="section-header"><span class="section-title">'+t('sec_weakness')+'</span><span style="font-size:13px;color:var(--muted)">'+t('ins_ranked')+'</span></div>';
  var ranks = ['🥇','🥈','🥉'];
  var rankColors = ['var(--red)','var(--amber)','var(--cyan)'];
  I.weaknesses.slice(0,5).forEach(function(w, i) {
    var rankIcon = i < 3 ? ranks[i] : (i+1)+'';
    var scoreColor = w.score < 0.2 ? 'var(--red)' : w.score < 0.5 ? 'var(--amber)' : 'var(--green)';
    html += '<div class="weakness-row">';
    html += '<div class="weakness-rank" style="color:'+rankColors[Math.min(i,2)]+'">'+rankIcon+'</div>';
    html += '<span style="font-size:20px">'+w.s.icon+'</span>';
    html += '<div style="flex:1"><div style="font-weight:600;font-size:14px">'+w.s.shortName+'</div>';
    html += '<div style="display:flex;gap:12px;margin-top:4px"><div style="flex:1"><div style="font-size:11px;color:var(--muted);margin-bottom:2px">'+t('ins_hours_lbl')+' '+w.hPct+'%</div><div class="progress-bar"><div class="progress-fill" style="width:'+w.hPct+'%;background:'+w.s.color+'"></div></div></div>';
    html += '<div style="flex:1"><div style="font-size:11px;color:var(--muted);margin-bottom:2px">'+t('ins_topics_lbl')+' '+w.tPct+'%</div><div class="progress-bar"><div class="progress-fill" style="width:'+w.tPct+'%;background:var(--green)"></div></div></div></div></div>';
    html += '<div style="text-align:right;min-width:52px"><div style="font-size:18px;font-weight:800;color:'+scoreColor+'">'+Math.round(w.score*100)+'%</div><div style="font-size:11px;color:var(--muted)">score</div></div>';
    html += '</div>';
  });
  html += '</div>';

  // ── Goal projections
  html += '<div><div class="section-header"><span class="section-title">'+t('sec_projection')+'</span><span style="font-size:13px;color:var(--muted)">'+t('ins_14_pace')+'</span></div>';
  html += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px">';
  html += '<thead><tr style="color:var(--muted);border-bottom:1px solid var(--border)"><th style="text-align:left;padding:8px 10px">'+t('proj_subject')+'</th><th style="text-align:left;padding:8px 10px">'+t('proj_progress')+'</th><th style="text-align:right;padding:8px 10px">'+t('hours_logged')+'</th><th style="text-align:right;padding:8px 10px">'+t('remaining')+'</th><th style="text-align:right;padding:8px 10px">'+t('eta')+'</th></tr></thead><tbody>';
  I.projections.forEach(function(p) {
    var etaStr = p.eta ? fmtDate(p.eta) : (p.remaining<=0 ? t('proj_done') : t('proj_no_data'));
    var etaColor = p.remaining<=0 ? 'var(--green)' : p.eta ? 'var(--text)' : 'var(--muted)';
    html += '<tr style="border-bottom:1px solid var(--border)"><td style="padding:8px 10px"><span style="display:flex;align-items:center;gap:6px">'+p.s.icon+' '+p.s.shortName+'</span></td>';
    html += '<td style="padding:8px 10px;min-width:100px"><div class="progress-bar"><div class="progress-fill" style="width:'+p.pct+'%;background:'+p.s.color+'"></div></div><div style="font-size:11px;color:var(--muted);margin-top:2px">'+p.pct+'%</div></td>';
    html += '<td style="padding:8px 10px;text-align:right;color:var(--cyan);font-weight:600">'+p.logged+'h</td>';
    html += '<td style="padding:8px 10px;text-align:right;color:var(--muted)">'+p.remaining+'h</td>';
    html += '<td style="padding:8px 10px;text-align:right;color:'+etaColor+'">'+etaStr+'</td></tr>';
  });
  html += '</tbody></table></div></div>';

  html += '</div>';
  el.innerHTML = html;
}

