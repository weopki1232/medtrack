// ── Storage ───────────────────────────────────────────────────────────────────
const KEYS = { SESSIONS:'mt_sessions', TASKS:'mt_tasks', TOPIC_DONE:'mt_topic_done', SETTINGS:'mt_settings', DIAGRAMS:'mt_diagrams', STREAK:'mt_streak', FORMULAS:'mt_formulas', DAILY_REVIEW:'mt_daily_review', SCORES:'mt_scores', REVIEW:'mt_review', SCHEDULE:'mt_schedule', TOPIC_NOTES:'mt_topic_notes', ACHIEVEMENTS:'mt_achievements', MISTAKES:'mt_mistakes', WEEKLY_TARGETS:'mt_weekly_targets', SUBJECT_PREFS:'mt_subject_prefs' };

const Storage = {
  get(key, fb=null) { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(key, val)     { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },

  getSessions()       { return this.get(KEYS.SESSIONS, []); },
  addSession(s)       { const ss=this.getSessions(); ss.unshift(s); this.set(KEYS.SESSIONS, ss); this._updateStreak(s.date); this._updateDaily(s); },
  deleteSession(id) {
    var all = this.getSessions();
    var del = all.find(function(s){return s.id===id;});
    this.set(KEYS.SESSIONS, all.filter(function(s){return s.id!==id;}));
    if(del){
      var dkey='mt_daily_'+del.date;
      var day=this.get(dkey,{total:0,subjects:{}});
      day.total=Math.max(0,(day.total||0)-del.duration);
      if(day.subjects)day.subjects[del.subjectId]=Math.max(0,(day.subjects[del.subjectId]||0)-del.duration);
      this.set(dkey,day);
    }
  },

  getTasks()          { return this.get(KEYS.TASKS, []); },
  addTask(t)          { const ts=this.getTasks(); ts.unshift(t); this.set(KEYS.TASKS, ts); },
  updateTask(id, p)   { this.set(KEYS.TASKS, this.getTasks().map(t => t.id===id ? {...t,...p} : t)); },
  deleteTask(id)      { this.set(KEYS.TASKS, this.getTasks().filter(t => t.id !== id)); },

  getTopicDone()      { return this.get(KEYS.TOPIC_DONE, {}); },
  toggleTopic(id)     { const d=this.getTopicDone(); d[id]=!d[id]; this.set(KEYS.TOPIC_DONE,d); return d[id]; },
  isTopicDone(id)     { return !!this.getTopicDone()[id]; },

  getSettings() {
    return this.get(KEYS.SETTINGS, { darkMode:true, darkModeAuto:false, dailyGoalMinutes:90, pomodoroWork:25, pomodoroShortBreak:5, pomodoroLongBreak:15, pomodoroCycles:4, soundEnabled:true, userName:'Student', theme:'default', lang:'en', autoSchedule:true });
  },
  saveSettings(patch) { this.set(KEYS.SETTINGS, {...this.getSettings(), ...patch}); },

  getDiagrams()       { return this.get(KEYS.DIAGRAMS, []); },
  saveDiagram(d)      { const ds=this.getDiagrams(); const i=ds.findIndex(x=>x.id===d.id); if(i>=0)ds[i]=d; else ds.unshift(d); this.set(KEYS.DIAGRAMS,ds); },
  deleteDiagram(id)   { this.set(KEYS.DIAGRAMS, this.getDiagrams().filter(d => d.id!==id)); },

  getFormulas()       { return this.get(KEYS.FORMULAS, []); },
  saveFormula(f)      { const fs=this.getFormulas(); const i=fs.findIndex(x=>x.id===f.id); if(i>=0)fs[i]=f; else fs.unshift(f); this.set(KEYS.FORMULAS,fs); },
  importFormulas(arr) { const fs=this.getFormulas(); let added=0; arr.forEach(f=>{ if(!fs.some(x=>x.id===f.id)){ fs.push(f); added++; } }); this.set(KEYS.FORMULAS,fs); return added; },
  deleteFormula(id)   { this.set(KEYS.FORMULAS, this.getFormulas().filter(f=>f.id!==id)); },

  getTopicNotes()          { return this.get(KEYS.TOPIC_NOTES, {}); },
  setTopicNote(tid,tx)     { var n=this.getTopicNotes(); if(tx&&tx.trim()) n[tid]=tx.trim(); else delete n[tid]; this.set(KEYS.TOPIC_NOTES,n); },
  getAchievements()        { return this.get(KEYS.ACHIEVEMENTS, {}); },
  unlockAch(id)            { var a=this.getAchievements(); if(a[id])return false; a[id]=Date.now(); this.set(KEYS.ACHIEVEMENTS,a); return true; },
  getMistakes()            { return this.get(KEYS.MISTAKES, []); },
  addMistake(m)            { var ms=this.getMistakes(); ms.unshift(m); this.set(KEYS.MISTAKES,ms); },
  deleteMistake(id)        { this.set(KEYS.MISTAKES, this.getMistakes().filter(function(m){return m.id!==id;})); },
  getWeeklyTargets()       { return this.get(KEYS.WEEKLY_TARGETS, {}); },
  getSubjectPrefs()        { return this.get(KEYS.SUBJECT_PREFS, {}); },
  setSubjectPref(sid, patch) {
    var all = this.getSubjectPrefs();
    var cur = Object.assign({}, all[sid] || {}, patch);
    Object.keys(cur).forEach(function(k){ if (cur[k]===null || cur[k]===undefined || cur[k]==='') delete cur[k]; });
    if (Object.keys(cur).length) all[sid] = cur; else delete all[sid];
    this.set(KEYS.SUBJECT_PREFS, all);
  },
  setWeeklyTarget(sid,h)   { var wt=this.getWeeklyTargets(); if(parseFloat(h)>0) wt[sid]=parseFloat(h); else delete wt[sid]; this.set(KEYS.WEEKLY_TARGETS,wt); },
  getWeekMinsForSubject(sid){ var now=new Date(),dow=now.getDay(),sow=new Date(now); sow.setDate(now.getDate()-dow); sow.setHours(0,0,0,0); return this.getSessions().filter(function(s){return s.subjectId===sid&&new Date(s.date+'T00:00:00')>=sow;}).reduce(function(a,s){return a+s.duration;},0); },

  getDailyReviews()   { return this.get(KEYS.DAILY_REVIEW, []); },
  saveDailyReview(entry) { const rs=this.getDailyReviews(); const i=rs.findIndex(r=>r.date===entry.date); if(i>=0)rs[i]=entry; else rs.unshift(entry); this.set(KEYS.DAILY_REVIEW,rs); },
  getDailyReviewByDate(date) { return this.getDailyReviews().find(function(r){return r.date===date;})||null; },

  getScores()         { return this.get(KEYS.SCORES, []); },
  addScore(s)         { const ss=this.getScores(); ss.unshift(s); this.set(KEYS.SCORES,ss); },
  deleteScore(id)     { this.set(KEYS.SCORES, this.getScores().filter(s=>s.id!==id)); },

  getReview()         { return this.get(KEYS.REVIEW, {}); },
  markReview(topicId, intervalDays) {
    var rv=this.getReview();
    var today=new Date().toISOString().split('T')[0];
    var next=new Date(); next.setDate(next.getDate()+intervalDays);
    rv[topicId]={lastReviewed:today, nextReview:next.toISOString().split('T')[0], interval:intervalDays};
    this.set(KEYS.REVIEW,rv);
  },
  unmarkReview(topicId) { var rv=this.getReview(); delete rv[topicId]; this.set(KEYS.REVIEW,rv); },
  getDueTopics() {
    var rv=this.getReview(); var today=new Date().toISOString().split('T')[0];
    return Object.keys(rv).filter(function(id){return rv[id].nextReview<=today;});
  },

  getSchedule(date) { var all=this.get(KEYS.SCHEDULE,{}); return all[date]||null; },
  saveSchedule(date, slots) { var all=this.get(KEYS.SCHEDULE,{}); all[date]=slots; this.set(KEYS.SCHEDULE,all); },
  markScheduleDone(date, subjectId) {
    var all=this.get(KEYS.SCHEDULE,{}); if(!all[date])return;
    all[date]=all[date].map(function(sl){return sl.subjectId===subjectId?{...sl,done:true}:sl;});
    this.set(KEYS.SCHEDULE,all);
  },

  getStreak() { return this.get(KEYS.STREAK, {current:0, longest:0, lastDate:null, history:[]}); },
  _updateStreak(dateStr) {
    const streak=this.getStreak(); const t=dateStr||new Date().toISOString().split('T')[0];
    if (streak.lastDate===t) return;
    const y=new Date(t); y.setDate(y.getDate()-1); const ys=y.toISOString().split('T')[0];
    streak.current = streak.lastDate===ys ? streak.current+1 : 1;
    streak.longest = Math.max(streak.longest, streak.current);
    streak.lastDate = t;
    if (!streak.history.includes(t)) streak.history.push(t);
    this.set(KEYS.STREAK, streak);
  },
  _updateDaily(session) {
    const key='mt_daily_'+session.date; const cur=this.get(key,{total:0,subjects:{}});
    cur.total+=session.duration; cur.subjects[session.subjectId]=(cur.subjects[session.subjectId]||0)+session.duration;
    this.set(key, cur);
  },
  getDayData(d)       { return this.get('mt_daily_'+d, {total:0,subjects:{}}); },
  // Deliberately DEFAULT_SUBJECTS (all, not just enabled): totals are history,
  // and disabled subjects keep their logged sessions + prior hours
  getSubjectTotals()  { const t={}; this.getSessions().forEach(s=>{ t[s.subjectId]=(t[s.subjectId]||0)+s.duration; }); DEFAULT_SUBJECTS.forEach(s=>{ var ph=this.get('mt_prior_hours_'+s.id,0); if(ph>0)t[s.id]=(t[s.id]||0)+ph*60; }); return t; },
  getLast14()         { const r=[]; for(let i=13;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const s=d.toISOString().split('T')[0]; r.push({date:s,minutes:this.getDayData(s).total}); } return r; },
  getHeatmap(months=6) {
    const data={}; const end=new Date(); const start=new Date(); start.setMonth(start.getMonth()-months);
    for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){ const s=d.toISOString().split('T')[0]; data[s]=this.getDayData(s).total; }
    return data;
  },
  getTodayMins()      { return this.getDayData(new Date().toISOString().split('T')[0]).total; },
};

