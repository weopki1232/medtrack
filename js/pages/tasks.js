// ── Tasks ─────────────────────────────────────────────────────────────────────
function renderTasks() {
  const tasks=Storage.getTasks();
  const filtered=taskFilter==='all'?tasks:taskFilter==='active'?tasks.filter(t=>!t.completed):tasks.filter(t=>t.completed);
  document.getElementById('page-tasks').innerHTML=
  '<div style="display:flex;flex-direction:column;gap:16px">'+
  '<div class="section-header"><span class="section-title">'+t('tasks_title')+'</span><button class="btn btn-primary btn-sm" onclick="openAddTaskModal()">'+t('tasks_add')+'</button></div>'+
  '<div class="pill-tabs" style="width:fit-content"><button class="pill-tab '+(taskFilter==='all'?'active':'')+'" onclick="taskFilter=\'all\';renderTasks()">'+t('tasks_all')+' ('+tasks.length+')</button><button class="pill-tab '+(taskFilter==='active'?'active':'')+'" onclick="taskFilter=\'active\';renderTasks()">'+t('tasks_active')+' ('+tasks.filter(function(tx){return !tx.completed;}).length+')</button><button class="pill-tab '+(taskFilter==='done'?'active':'')+'" onclick="taskFilter=\'done\';renderTasks()">'+t('tasks_done')+' ('+tasks.filter(function(tx){return tx.completed;}).length+')</button></div>'+
  '<div style="display:flex;flex-direction:column;gap:8px">'+
  (filtered.length===0?'<div class="empty-state"><div class="empty-icon">✅</div><p>'+t('tasks_empty')+(taskFilter==='active'?' '+t('tasks_empty_active'):'')+'</p></div>':
  filtered.sort(function(a,b){const po={critical:0,high:1,medium:2,low:3};if(!a.completed&&b.completed)return -1;if(a.completed&&!b.completed)return 1;return(po[a.priority]||2)-(po[b.priority]||2);}).map(function(t){return renderTaskItem(t);}).join(''))+
  '</div></div>';
}
function renderTaskItem(t) {
  const sub=getSubject(t.subjectId);
  const dl=t.deadline?daysUntil(t.deadline):null;
  return '<div class="task-item '+(t.completed?'done':'')+'" style="'+(dl!==null&&dl<=3&&!t.completed?'border-color:var(--red)':'')+'"><div class="task-check '+(t.completed?'checked':'')+'" onclick="toggleTaskDone(\''+t.id+'\')">'+( t.completed?'✓':'')+'</div><div style="flex:1"><div class="task-title">'+t.title+'</div><div class="task-meta">'+priorityBadge(t.priority)+(sub?'<span class="badge" style="background:'+sub.color+'22;color:'+sub.color+'">'+sub.icon+' '+sub.shortName+'</span>':'')+(t.deadline?'<span class="badge '+(dl<=3&&!t.completed?'badge-red':'badge-cyan')+'">📅 '+fmtDate(t.deadline)+(dl!==null?' ('+dl+'d)':'')+'</span>':'')+'</div>'+(t.notes?'<div style="font-size:12px;color:var(--muted);margin-top:4px">'+t.notes+'</div>':'')+'</div><button class="btn btn-ghost btn-xs" onclick="deleteTaskUI(\''+t.id+'\')">✕</button></div>';
}
function toggleTaskDone(id) { const t=Storage.getTasks().find(x=>x.id===id); if(t)Storage.updateTask(id,{completed:!t.completed}); renderTasks(); }
function deleteTaskUI(id) { Storage.deleteTask(id); renderTasks(); }
function openAddTaskModal() {
  const o=document.createElement('div'); o.className='modal-overlay fade-in'; o.id='add-task-modal';
  o.innerHTML='<div class="modal-box"><div class="modal-title">'+t('modal_add_task')+'</div><div class="form-group"><label class="label">'+t('modal_title_lbl')+'</label><input class="input" id="task-title" placeholder="'+t('modal_task_ph')+'"></div><div class="form-group"><label class="label">'+t('modal_subj_lbl')+'</label><select class="input" id="task-subj"><option value="">'+t('modal_none')+'</option>'+DEFAULT_SUBJECTS.map(s=>'<option value="'+s.id+'">'+s.icon+' '+s.shortName+'</option>').join('')+'</select></div><div class="grid-2" style="gap:10px"><div class="form-group"><label class="label">'+t('modal_priority_lbl')+'</label><select class="input" id="task-priority"><option value="critical">'+t('prio_critical')+'</option><option value="high">'+t('prio_high')+'</option><option value="medium" selected>'+t('prio_medium')+'</option><option value="low">'+t('prio_low')+'</option></select></div><div class="form-group"><label class="label">'+t('modal_deadline_lbl')+'</label><input type="date" class="input" id="task-deadline"></div></div><div class="form-group"><label class="label">'+t('modal_notes_lbl')+'</label><textarea class="input" id="task-notes" rows="2" placeholder="'+t('modal_optional_ph')+'"></textarea></div><div class="modal-footer"><button class="btn btn-outline" onclick="closeModal(\'add-task-modal\')">'+t('btn_cancel')+'</button><button class="btn btn-primary" onclick="submitAddTask()">'+t('modal_add_btn')+'</button></div></div>';
  o.addEventListener('click',function(e){if(e.target===o)closeModal('add-task-modal');});
  document.body.appendChild(o);
}
function submitAddTask() {
  const title=document.getElementById('task-title').value.trim();
  if(!title){toast(t('toast_enter_title'),'warning');return;}
  Storage.addTask({id:uid(),title,subjectId:document.getElementById('task-subj').value||'',priority:document.getElementById('task-priority').value||'medium',deadline:document.getElementById('task-deadline').value||'',notes:document.getElementById('task-notes').value||'',completed:false,createdAt:Date.now()});
  closeModal('add-task-modal'); toast(t('toast_task_added'),'success'); renderTasks();
}
function closeModal(id) { const el=document.getElementById(id); if(el)el.remove(); }

function openDailyReviewModal() {
  var d = today();
  var existing = Storage.getDailyReviewByDate(d);
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='daily-review-modal';
  o.innerHTML = '<div class="modal-box">'+
    '<div class="modal-title">'+t('review_modal_title')+'</div>'+
    (existing?'<div style="font-size:12px;color:var(--muted);margin-bottom:10px">'+t('review_already')+'</div>':'')+
    '<div class="form-group"><label class="label">'+t('review_modal_prompt')+'</label>'+
    '<textarea class="input" id="review-text" rows="5" placeholder="'+t('review_modal_ph')+'" style="resize:vertical">'+escHtml(existing?existing.text:'')+'</textarea></div>'+
    '<div class="modal-footer">'+
    '<button class="btn btn-outline" onclick="closeModal(\'daily-review-modal\')">'+t('btn_cancel')+'</button>'+
    '<button class="btn btn-primary" onclick="submitDailyReview()">'+t('review_save')+'</button>'+
    '</div></div>';
  o.addEventListener('click',function(e){if(e.target===o)closeModal('daily-review-modal');});
  document.body.appendChild(o);
  setTimeout(function(){var ta=document.getElementById('review-text');if(ta)ta.focus();},80);
}
function submitDailyReview() {
  var text = (document.getElementById('review-text')||{}).value||'';
  text = text.trim();
  if(!text) { closeModal('daily-review-modal'); return; }
  Storage.saveDailyReview({date:today(), text:text, ts:Date.now()});
  closeModal('daily-review-modal');
  toast(t('review_saved'),'success');
}

