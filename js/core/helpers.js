let sessionFilter = { subject:'', search:'', dateFrom:'', dateTo:'' };
let timerState = { mode:'pomodoro', phase:'work', running:false, paused:false, totalSeconds:0, remainingSeconds:0, cyclesDone:0, selectedSubjectId:null, selectedTopic:'', notes:'', sessionStartTime:null, intervalId:null };
let diagramState = { tool:'node', nodes:[], connections:[], dragging:null, dragOffset:{x:0,y:0}, connecting:null, nodeColor:'#7c3aed', textColor:'#ffffff', connColor:'#64748b', nodeTexture:'solid', connStyle:'curved', floating:true, floatAnimId:null, floatTime:0, currentId:null, name:'' };
var _diagBgCache = null;
let dCanvas = null, dCtx = null;

const PAGE_TITLES = { dashboard:'📊 Dashboard', timer:'⏱ Study Timer', subjects:'📚 Subjects & Topics', analytics:'📈 Analytics', tasks:'✅ Task Manager', diagrams:'🗺 Diagrams', settings:'⚙️ Settings', insights:'🧠 Smart Insights', journey:'🗓 Study Journey', vault:'🔬 Formula Vault' };

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid()        { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function today()      { return new Date().toISOString().split('T')[0]; }
function getSubject(id) { return DEFAULT_SUBJECTS.find(s=>s.id===id); }
function getSettings()  { return Storage.getSettings(); }
function fmtMins(m)   { const h=Math.floor(m/60),mn=m%60; return h===0?mn+'m':mn===0?h+'h':h+'h '+mn+'m'; }
function fmtDate(str) { return new Date(str+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
function daysUntil(d) { const n=new Date(); n.setHours(0,0,0,0); return Math.ceil((new Date(d+'T00:00:00')-n)/86400000); }
function getCurrentPhase() { const t=today(); return STUDY_PHASES.find(p=>t>=p.start&&t<=p.end)||null; }
function priorityBadge(p) { var m={critical:['badge-red','prio_critical'],high:['badge-amber','prio_high'],medium:['badge-green','prio_medium'],low:['badge-cyan','prio_low']}; var pair=m[p]||m.medium; return '<span class="badge '+pair[0]+'">'+t(pair[1])+'</span>'; }

function toast(msg, type='info') {
  const el=document.getElementById('toast');
  const icons={info:'ℹ️',success:'✅',warning:'⚠️',error:'❌'};
  el.innerHTML=(icons[type]||'ℹ️')+' '+msg;
  el.classList.add('show');
  clearTimeout(window._tt);
  window._tt=setTimeout(()=>el.classList.remove('show'),3000);
}

