// ── Topic Note Modal ───────────────────────────────────────────────────────────
function openTopicNoteModal(tid, topicName) {
  var existing = Storage.getTopicNotes()[tid] || '';
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='topic-note-modal';
  o.innerHTML = '<div class="modal-box" style="max-width:480px">'+
    '<div class="modal-title">📝 '+t('note_title')+': '+escHtml(topicName)+'</div>'+
    '<div class="form-group">'+
      '<textarea class="input" id="topic-note-ta" rows="6" placeholder="'+t('note_ph')+'" style="resize:vertical">'+escHtml(existing)+'</textarea>'+
    '</div>'+
    '<div class="modal-footer">'+
      '<button class="btn btn-outline" onclick="closeModal(\'topic-note-modal\')">'+t('btn_cancel')+'</button>'+
      '<button class="btn btn-outline" onclick="saveTopicNote(\''+tid+'\',true)">'+t('note_clear')+'</button>'+
      '<button class="btn btn-primary" onclick="saveTopicNote(\''+tid+'\',false)">'+t('note_save')+'</button>'+
    '</div>'+
  '</div>';
  o.addEventListener('click', function(e){ if(e.target===o) closeModal('topic-note-modal'); });
  document.body.appendChild(o);
  setTimeout(function(){ var ta=document.getElementById('topic-note-ta'); if(ta)ta.focus(); },80);
}

function saveTopicNote(tid, clear) {
  var ta = document.getElementById('topic-note-ta');
  var txt = clear ? '' : (ta ? ta.value : '');
  Storage.setTopicNote(tid, txt);
  closeModal('topic-note-modal');
  toast(clear ? t('note_clear') : t('note_save'), 'success');
  if (currentPage === 'subjects') renderSubjectsPage();
}

// ── Mistake Log Modal ──────────────────────────────────────────────────────────
function openMistakeModal(sid) {
  var sub = getSubject(sid);
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='mistake-modal';
  o.innerHTML = '<div class="modal-box" style="max-width:440px">'+
    '<div class="modal-title">💡 '+t('mistake_title')+'</div>'+
    '<div class="form-group"><label class="label">'+t('mistake_ph')+'</label>'+
      '<textarea class="input" id="mistake-note-ta" rows="4" placeholder="'+t('mistake_ph')+'" style="resize:vertical"></textarea>'+
    '</div>'+
    '<div class="form-group"><label class="label">'+t('mistake_topic_opt')+'</label>'+
      '<select class="input" id="mistake-topic-sel">'+
        '<option value="">—</option>'+
        (sub&&sub.topics?sub.topics.map(function(tp){return '<option value="'+escHtml(tp.name)+'">'+tTopic(tp.id,tp.name)+'</option>';}).join(''):'')+
      '</select>'+
    '</div>'+
    '<div class="modal-footer">'+
      '<button class="btn btn-outline" onclick="closeModal(\'mistake-modal\')">'+t('btn_cancel')+'</button>'+
      '<button class="btn btn-primary" onclick="submitMistake(\''+sid+'\')">'+t('mistake_save')+'</button>'+
    '</div>'+
  '</div>';
  o.addEventListener('click', function(e){ if(e.target===o) closeModal('mistake-modal'); });
  document.body.appendChild(o);
  setTimeout(function(){ var ta=document.getElementById('mistake-note-ta'); if(ta)ta.focus(); },80);
}

function submitMistake(sid) {
  var ta = document.getElementById('mistake-note-ta');
  var topicSel = document.getElementById('mistake-topic-sel');
  var note = ta ? ta.value.trim() : '';
  if (!note) { toast(t('mistake_ph'), 'warning'); return; }
  Storage.addMistake({id:uid(), subjectId:sid, topic:topicSel?topicSel.value:'', note:note, date:today(), timestamp:Date.now()});
  closeModal('mistake-modal');
  toast(t('mistake_save'), 'success');
  checkAchievements();
  if (currentPage === 'subjects') renderSubjectsPage();
}

function deleteMistakeUI(id, sid) {
  Storage.deleteMistake(id);
  toast(t('mistake_del'), 'info');
  if (currentPage === 'subjects') renderSubjectsPage();
}

// ── Session Reflection Modal ───────────────────────────────────────────────────
function openReflectionModal() {
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='reflection-modal';
  o.innerHTML = '<div class="modal-box" style="max-width:380px;text-align:center">'+
    '<div class="modal-title" style="font-size:18px">'+t('refl_title')+'</div>'+
    '<div style="font-size:13px;color:var(--muted);margin-bottom:16px">'+t('refl_mood')+'</div>'+
    '<div style="display:flex;gap:12px;justify-content:center;margin-bottom:20px">'+
      '<button class="btn btn-outline refl-mood-btn" style="flex-direction:column;gap:4px;padding:14px 18px;font-size:13px" onclick="submitReflection(\'tough\')" data-mood="tough">'+
        '<span style="font-size:24px">😤</span>'+t('refl_tough')+
      '</button>'+
      '<button class="btn btn-outline refl-mood-btn" style="flex-direction:column;gap:4px;padding:14px 18px;font-size:13px" onclick="submitReflection(\'good\')" data-mood="good">'+
        '<span style="font-size:24px">😊</span>'+t('refl_good')+
      '</button>'+
      '<button class="btn btn-outline refl-mood-btn" style="flex-direction:column;gap:4px;padding:14px 18px;font-size:13px;border-color:var(--primary)" onclick="submitReflection(\'flow\')" data-mood="flow">'+
        '<span style="font-size:24px">🔥</span>'+t('refl_flow')+
      '</button>'+
    '</div>'+
    '<button class="btn btn-ghost btn-sm" onclick="submitReflection(\'\')">'+t('refl_skip')+'</button>'+
  '</div>';
  document.body.appendChild(o);
}

function submitReflection(mood) {
  closeModal('reflection-modal');
  if (!_pendingSession) return;
  var s = _pendingSession;
  _pendingSession = null;
  s.mood = mood;
  Storage.addSession(s);
  var sub = getSubject(s.subjectId);
  toast(t('toast_logged', {dur:fmtMins(s.duration), sub:sub?sub.shortName:s.subjectId}), 'success');
  checkAchievements();
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'analytics') renderPage('analytics');
}

