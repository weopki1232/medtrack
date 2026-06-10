// ── Journey page ──────────────────────────────────────────────────────────────
function renderJourney() {
  var el = document.getElementById('page-journey');
  if (!el) return;
  var sessions = Storage.getSessions().slice().reverse(); // oldest first

  if (sessions.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">🗓</div><p>'+t('journey_empty')+'</p></div>';
    return;
  }

  var totals = Storage.getSubjectTotals();
  // Group by YYYY-MM
  var monthMap = {};
  var firstPerSubject = {};
  sessions.forEach(function(s) {
    var ym = s.date.substring(0,7);
    if (!monthMap[ym]) monthMap[ym] = {mins:0, count:0, subjectMins:{}, subjects:new Set()};
    monthMap[ym].mins   += s.duration;
    monthMap[ym].count  += 1;
    monthMap[ym].subjects.add(s.subjectId);
    monthMap[ym].subjectMins[s.subjectId] = (monthMap[ym].subjectMins[s.subjectId]||0) + s.duration;
    if (!firstPerSubject[s.subjectId]) firstPerSubject[s.subjectId] = ym;
  });

  // Streak milestones per month from streak history
  var streak = Storage.getStreak();
  var history = streak.history || [];

  // Daily reviews grouped by month
  var reviewsByMonth = {};
  Storage.getDailyReviews().forEach(function(r){
    var ym=r.date.substring(0,7);
    if(!reviewsByMonth[ym])reviewsByMonth[ym]=[];
    reviewsByMonth[ym].push(r);
  });

  var months = Object.keys(monthMap).sort().reverse(); // newest first

  var html = '<div style="display:flex;flex-direction:column;gap:0">';
  html += '<div class="section-header"><span class="section-title">'+t('page_journey')+'</span><span style="font-size:13px;color:var(--muted)">'+months.length+' '+t('jour_recorded')+'</span></div>';
  html += '<div class="journey-wrap">';

  months.forEach(function(ym) {
    var m = monthMap[ym];
    var monthDate = new Date(ym+'-01T00:00:00');
    var monthName = monthDate.toLocaleDateString('en', {month:'long', year:'numeric'});
    // dot color: current month = primary, past = muted
    var isCurrentMonth = ym === today().substring(0,7);
    var dotColor = isCurrentMonth ? 'var(--primary)' : 'var(--border)';

    // build events
    var events = [];
    // First sessions for subjects this month
    Object.keys(firstPerSubject).forEach(function(sid) {
      if (firstPerSubject[sid] === ym) {
        var sub = getSubject(sid);
        if (sub) events.push({ icon: sub.icon, text: t('jour_started')+' '+sub.shortName });
      }
    });
    // Top subject this month
    var topSid = Object.keys(m.subjectMins).reduce(function(a,b){ return m.subjectMins[a]>m.subjectMins[b]?a:b; }, null);
    var topSub = topSid ? getSubject(topSid) : null;
    if (topSub) events.push({ icon:'🏅', text: topSub.shortName+' '+t('jour_most_studied_lbl')+' ('+fmtMins(m.subjectMins[topSid])+')' });
    // Streak days this month
    var ymDays = history.filter(function(d){ return d.substring(0,7)===ym; }).length;
    if (ymDays > 0) events.push({ icon:'🔥', text: ymDays+' '+t('jour_study_days') });
    // Phase transitions
    STUDY_PHASES.forEach(function(p) {
      if (p.start.substring(0,7)===ym) events.push({ icon:'🚀', text:t('jour_entered')+' '+p.name });
    });
    // Daily reviews this month
    var monthReviews = reviewsByMonth[ym]||[];
    if(monthReviews.length>0){
      var latest=monthReviews.slice().sort(function(a,b){return b.date.localeCompare(a.date);})[0];
      var excerpt=latest.text.length>80?latest.text.substring(0,80)+'…':latest.text;
      events.push({icon:'📝',text:t('review_journey_lbl')+' ('+monthReviews.length+'): "'+excerpt+'"'});
    }

    html += '<div class="journey-month">';
    html += '<div class="journey-dot" style="background:'+dotColor+'"></div>';
    html += '<div class="journey-hd">'+monthName+(isCurrentMonth?' <span class="badge badge-purple" style="font-size:10px">'+t('jour_now')+'</span>':'')+'</div>';
    html += '<div class="journey-stats">';
    html += '<span>⏱ '+fmtMins(m.mins)+'</span>';
    html += '<span>📋 '+m.count+' '+t('jour_sessions')+'</span>';
    html += '<span>📚 '+m.subjects.size+' '+t('jour_subjects_count')+'</span>';
    html += '</div>';
    if (events.length > 0) {
      html += '<div class="card" style="padding:12px 16px"><div style="display:flex;flex-direction:column;gap:4px">';
      events.forEach(function(ev) {
        html += '<div class="journey-ev"><span class="journey-ev-icon">'+ev.icon+'</span><span>'+ev.text+'</span></div>';
      });
      html += '</div></div>';
    }
    html += '</div>';
  });

  html += '</div></div>';
  el.innerHTML = html;
}

