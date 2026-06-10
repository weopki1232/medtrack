// ── Formula Vault page ────────────────────────────────────────────────────────
function renderVault() {
  var el = document.getElementById('page-vault');
  if (!el) return;
  var formulas = Storage.getFormulas();
  var filtered = vaultSearch
    ? formulas.filter(function(f) { return (f.name+f.latex+(f.notes||'')+(f.badge||'')).toLowerCase().includes(vaultSearch.toLowerCase()) || (f.subjectId && getSubject(f.subjectId) && getSubject(f.subjectId).shortName.toLowerCase().includes(vaultSearch.toLowerCase())); })
    : formulas;

  var html = '<div style="display:flex;flex-direction:column;gap:16px">';
  html += '<div class="section-header"><span class="section-title">'+t('page_vault')+'</span><div style="display:flex;gap:8px">'+
    (!vaultQuizMode&&!vaultFlashMode?'<button class="btn btn-primary btn-sm" onclick="openAddFormulaModal()">'+t('add_formula')+'</button>':'')+
    (!vaultQuizMode&&!vaultFlashMode?'<button class="btn btn-outline btn-sm" onclick="importUbuCards()" title="Import UBU Pharmatalent flashcards">📥 UBU</button>':'')+
    (vaultFlashMode?'<button class="btn btn-primary btn-sm" onclick="vaultFlashMode=false;vaultFlashIdx=0;renderVault()">✕ '+t('flash_exit')+'</button>':'<button class="btn btn-outline btn-sm" onclick="startVaultFlash()">🃏 '+t('flash_mode')+'</button>')+
    (!vaultFlashMode?'<button class="btn '+(vaultQuizMode?'btn-primary':'btn-outline')+' btn-sm" onclick="vaultQuizMode=!vaultQuizMode;vaultRevealed=new Set();renderVault()">'+(vaultQuizMode?'✕ '+t('vault_quiz_exit'):'📋 '+t('vault_quiz'))+'</button>':'')+
  '</div></div>';

  // ── Flashcard mode view ───────────────────────────────────────────────────
  if (vaultFlashMode) {
    if (vaultFlashList.length === 0) {
      html += '<div class="empty-state"><div class="empty-icon">🃏</div><p>No formulas to flash. Add some first!</p></div>';
    } else {
      var fi = Math.min(vaultFlashIdx, vaultFlashList.length-1);
      var fc = vaultFlashList[fi];
      var revealed = vaultRevealed.has(fc.id);
      var fsub = fc.subjectId ? getSubject(fc.subjectId) : null;
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 0">';
      html += '<div style="font-size:12px;color:var(--muted)">'+t('flash_progress')+' '+(fi+1)+' / '+vaultFlashList.length+'</div>';
      html += '<div style="width:100%;max-width:520px;min-height:200px;background:var(--bg2);border:2px solid var(--border);border-radius:16px;padding:28px 32px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;cursor:pointer;transition:border-color .2s" onclick="vaultRevealed.add(\''+fc.id+'\');renderVault()">';
      html += cardBadge(fc);
      html += '<div style="font-size:18px;font-weight:700;text-align:center;margin-bottom:4px">'+escHtml(fc.name)+'</div>';
      if (!revealed) {
        html += '<div style="color:var(--muted);font-size:13px;border:1px dashed var(--border);border-radius:8px;padding:10px 20px">🔍 Tap to reveal</div>';
      } else {
        html += '<div id="flash-formula-'+fc.id+'" style="font-size:15px;text-align:center">'+cardBackHtml(fc)+'</div>';
        if (fc.latex && fc.notes) html += '<div style="font-size:12px;color:var(--muted);text-align:center">'+escHtml(fc.notes)+'</div>';
      }
      html += '</div>';
      if (revealed) {
        html += '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">';
        html += '<button class="btn btn-danger btn-sm" onclick="flashRate(\'hard\')">'+t('flash_hard')+'</button>';
        html += '<button class="btn btn-outline btn-sm" onclick="flashNext()">'+t('flash_skip')+'</button>';
        html += '<button class="btn btn-primary btn-sm" style="background:var(--green)" onclick="flashRate(\'know\')">'+t('flash_know')+'</button>';
        html += '</div>';
      } else {
        html += '<button class="btn btn-outline btn-sm" onclick="flashNext()">'+t('flash_skip')+'</button>';
      }
      html += '</div>';
    }
    html += '</div>'; el.innerHTML = html;
    setTimeout(function() {
      if (!window.katex) return;
      document.querySelectorAll('.formula-latex[data-latex]').forEach(function(span) {
        try { katex.render(span.dataset.latex, span, {throwOnError:false, displayMode:true}); } catch(e) {}
      });
    }, 40);
    return;
  }

  if (!vaultQuizMode) {
    html += '<div style="display:flex;gap:10px"><input class="input" placeholder="'+t('search_formulas')+'" value="'+vaultSearch+'" oninput="vaultSearch=this.value;renderVault()" style="max-width:320px">';
    html += '<select class="input" style="max-width:200px;width:auto" onchange="vaultSearch=this.value;renderVault()"><option value="">'+t('vault_all_subjects')+'</option>'+DEFAULT_SUBJECTS.map(function(s){return '<option value="'+s.shortName+'"'+(vaultSearch===s.shortName?' selected':'')+'>'+s.icon+' '+s.shortName+'</option>';}).join('')+'</select></div>';
  }

  if (filtered.length === 0) {
    html += '<div class="empty-state"><div class="empty-icon">🔬</div><p>'+(formulas.length===0?t('no_formulas'):'No results for "'+vaultSearch+'".')+'</p></div>';
  } else {
    html += '<div class="grid-auto">';
    filtered.forEach(function(f) {
      var sub = f.subjectId ? getSubject(f.subjectId) : null;
      var revealed = vaultRevealed.has(f.id);
      html += '<div class="formula-card">';
      html += '<div class="formula-name"><span>'+escHtml(f.name)+'</span>'+(vaultQuizMode?'':'<button class="btn btn-ghost btn-xs" onclick="deleteFormulaUI(\''+f.id+'\')">✕</button>')+'</div>';
      html += cardBadge(f);
      if (vaultQuizMode && !revealed) {
        html += '<div id="fq-'+f.id+'" onclick="revealFormula(\''+f.id+'\')" style="cursor:pointer;display:flex;align-items:center;justify-content:center;height:60px;border:2px dashed var(--border);border-radius:8px;color:var(--muted);font-size:13px;gap:6px">🔍 '+t('vault_quiz_reveal')+'</div>';
      } else {
        html += '<div class="formula-expr" id="fq-'+f.id+'">'+cardBackHtml(f)+'</div>';
        if (!vaultQuizMode && f.latex && f.notes) html += '<div style="font-size:12px;color:var(--muted)">'+escHtml(f.notes)+'</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;

  // Render KaTeX for visible formulas
  setTimeout(function() {
    if (!window.katex) return;
    document.querySelectorAll('.formula-latex[data-latex]').forEach(function(span) {
      try { katex.render(span.dataset.latex, span, {throwOnError:false, displayMode:true}); }
      catch(e) {}
    });
  }, 40);
}

function revealFormula(id) {
  vaultRevealed.add(id);
  var f = Storage.getFormulas().find(function(x){return x.id===id;});
  var el=document.getElementById('fq-'+id); if(!el||!f)return;
  el.className='formula-expr'; el.onclick=null; el.style.cursor='';
  el.innerHTML=cardBackHtml(f);
  if(window.katex && f.latex){var span=el.querySelector('.formula-latex[data-latex]');if(span)try{katex.render(span.dataset.latex,span,{throwOnError:false,displayMode:true});}catch(e){}}
}
function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Render a card's "back": LaTeX (math formula) if present, else plain text (handles Thai + bilingual cards).
function cardBackHtml(f) {
  if (f.latex) return '<span class="formula-latex" data-latex="'+escHtml(f.latex)+'">'+escHtml(f.latex)+'</span>';
  return '<div style="font-size:14px;line-height:1.6;text-align:center;white-space:pre-wrap;word-break:break-word">'+escHtml(f.notes||'')+'</div>';
}
// Badge for a card: real subject if it has one, else the imported deck tag (e.g. "⚗️ Chem · atoms").
function cardBadge(f) {
  var sub = f.subjectId ? getSubject(f.subjectId) : null;
  if (sub) return '<span class="badge" style="background:'+sub.color+'22;color:'+sub.color+';margin-bottom:6px;display:inline-flex">'+sub.icon+' '+sub.shortName+'</span>';
  if (f.badge) return '<span class="badge" style="background:'+(f.color||'#8b5cf6')+'22;color:'+(f.color||'#8b5cf6')+';margin-bottom:6px;display:inline-flex">'+escHtml(f.badge)+'</span>';
  return '';
}
// One-click import of the bundled UBU Pharmatalent flashcard decks into the Vault.
function importUbuCards() {
  var node = document.getElementById('ubu-cards-data');
  if (!node) { toast('UBU card data not found', 'warning'); return; }
  var arr;
  try { arr = JSON.parse(node.textContent); } catch(e) { toast('Could not read UBU card data', 'warning'); return; }
  var cards = arr.map(function(c) {
    return { id:c.id, name:c.q, latex:'', notes:c.a, badge:c.badge, color:c.color, subjectId:'', kind:'card', createdAt:Date.now() };
  });
  var added = Storage.importFormulas(cards);
  var dup = cards.length - added;
  toast('📥 Imported '+added+' UBU cards'+(dup>0?' ('+dup+' already there)':''), 'success');
  checkAchievements(); renderVault();
}

function openAddFormulaModal() {
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='add-formula-modal';
  o.innerHTML = '<div class="modal-box"><div class="modal-title">'+t('add_formula')+'</div>'+
    '<div class="form-group"><label class="label">'+t('formula_name')+' *</label><input class="input" id="fm-name" placeholder="e.g. Kinematic velocity"></div>'+
    '<div class="form-group"><label class="label">'+t('formula_latex')+' *</label><input class="input" id="fm-latex" placeholder="e.g. v = v_0 + at"></div>'+
    '<div style="padding:8px 12px;background:var(--bg3);border-radius:8px;margin-bottom:14px;min-height:40px;font-size:13px;color:var(--muted)" id="fm-preview">Preview will appear here</div>'+
    '<div class="form-group"><label class="label">'+t('fm_subj_lbl')+'</label><select class="input" id="fm-subj"><option value="">'+t('fm_none')+'</option>'+DEFAULT_SUBJECTS.map(function(s){return '<option value="'+s.id+'">'+s.icon+' '+s.shortName+'</option>';}).join('')+'</select></div>'+
    '<div class="form-group"><label class="label">'+t('formula_notes')+'</label><textarea class="input" id="fm-notes" rows="2"></textarea></div>'+
    '<div class="modal-footer"><button class="btn btn-outline" onclick="closeModal(\'add-formula-modal\')">'+t('btn_cancel')+'</button><button class="btn btn-primary" onclick="submitAddFormula()">'+t('btn_save_formula')+'</button></div></div>';
  o.addEventListener('click', function(e){ if(e.target===o) closeModal('add-formula-modal'); });
  document.body.appendChild(o);
  // Live KaTeX preview
  var latexInput = document.getElementById('fm-latex');
  var preview = document.getElementById('fm-preview');
  latexInput.addEventListener('input', function() {
    if (!window.katex || !latexInput.value) { preview.textContent='Preview will appear here'; return; }
    try { katex.render(latexInput.value, preview, {throwOnError:false, displayMode:true}); }
    catch(e) { preview.textContent = latexInput.value; }
  });
}

function submitAddFormula() {
  var name  = document.getElementById('fm-name').value.trim();
  var latex = document.getElementById('fm-latex').value.trim();
  if (!name)  { toast(t('toast_enter_name'),'warning'); return; }
  if (!latex) { toast(t('toast_enter_latex'),'warning'); return; }
  Storage.saveFormula({ id:uid(), name:name, latex:latex, subjectId:document.getElementById('fm-subj').value||'', notes:document.getElementById('fm-notes').value||'', createdAt:Date.now() });
  closeModal('add-formula-modal'); toast(t('toast_formula_saved'),'success'); checkAchievements(); renderVault();
}

function deleteFormulaUI(id) { Storage.deleteFormula(id); toast(t('toast_formula_deleted'),'info'); renderVault(); }

// ── Rich Notes (Markdown + KaTeX) ─────────────────────────────────────────────
function renderNotes(text) {
  if (!text) return '';
  var safe = escHtml(text);
  // Use marked.js if available, else plain text with line breaks
  if (window.marked) {
    try {
      var md = window.marked.parse(text, {breaks:true, gfm:true});
      return md;
    } catch(e) { return safe.replace(/\n/g,'<br>'); }
  }
  return safe.replace(/\n/g,'<br>');
}

// ── Recovery Rate ──────────────────────────────────────────────────────────────
function computeRecoveryRate(historyArr) {
  // historyArr: sorted array of YYYY-MM-DD strings (dates studied)
  if (!historyArr || historyArr.length < 2) return null;
  var sorted = historyArr.slice().sort();
  var gaps = []; // gap lengths in days after a missed day before resuming
  for (var i = 1; i < sorted.length; i++) {
    var prev = new Date(sorted[i-1]+'T00:00:00');
    var curr = new Date(sorted[i]+'T00:00:00');
    var diff = Math.round((curr - prev) / 86400000);
    if (diff > 1) gaps.push(diff - 1); // days missed before returning
  }
  if (!gaps.length) return null; // never missed a day
  var avg = Math.round(gaps.reduce(function(a,b){return a+b;},0) / gaps.length);
  return { avg:avg, count:gaps.length };
}

