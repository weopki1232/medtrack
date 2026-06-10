function t(key, vars) {
  var lang = Storage.getSettings ? (Storage.getSettings().lang || 'en') : 'en';
  var str = (STRINGS[lang] && STRINGS[lang][key]) || (STRINGS.en[key]) || key;
  if (vars) { Object.keys(vars).forEach(function(k){ str = str.replace('{'+k+'}', vars[k]); }); }
  return str;
}
function openKeyboardShortcutsModal() {
  if (document.getElementById('kb-modal')) return;
  var pairs = [['Space','Start/Stop timer'],['D','Dashboard'],['S','Subjects'],['A','Analytics'],['T','Tasks'],['V','Formula Vault'],['J','Journey'],['I','Insights'],['Esc','Close modal'],['?','This help']];
  var o = document.createElement('div'); o.className='modal-overlay fade-in'; o.id='kb-modal';
  o.innerHTML='<div class="modal-box" style="max-width:380px"><div class="modal-title">⌨️ Keyboard Shortcuts</div>'+
    '<div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;margin-top:14px;align-items:center">'+
    pairs.map(function(p){return '<span class="kb-badge">'+p[0]+'</span><span style="font-size:13px;color:var(--text)">'+p[1]+'</span>';}).join('')+
    '</div>'+
    '<button class="btn btn-primary" onclick="closeModal(\'kb-modal\')" style="margin-top:20px;width:100%">Got it</button></div>';
  o.addEventListener('click',function(e){if(e.target===o)closeModal('kb-modal');});
  document.body.appendChild(o);
}
function setLang(lang) {
  Storage.saveSettings({lang:lang});
  var enBtn = document.getElementById('lang-en'), thBtn = document.getElementById('lang-th');
  if(enBtn) enBtn.classList.toggle('active', lang==='en');
  if(thBtn) thBtn.classList.toggle('active', lang==='th');
  // Update all nav item labels
  var navLabels = {dashboard:'nav_dashboard',timer:'nav_timer',subjects:'nav_subjects',analytics:'nav_analytics',insights:'nav_insights',journey:'nav_journey',tasks:'nav_tasks',schedule:'nav_schedule',vault:'nav_vault',diagrams:'nav_diagrams',settings:'nav_settings'};
  Object.keys(navLabels).forEach(function(page) {
    var el = document.getElementById('nav-lbl-'+page);
    if (el) el.textContent = t(navLabels[page]);
  });
  // Update sidebar section labels + subtitle + footer
  var sub = document.getElementById('sidebar-subtitle'); if(sub) sub.textContent = t('sidebar_subtitle');
  var secMain = document.getElementById('nav-sec-main'); if(secMain) secMain.textContent = t('sidebar_main');
  var secTrack = document.getElementById('nav-sec-track'); if(secTrack) secTrack.textContent = t('sidebar_track');
  var secTools = document.getElementById('nav-sec-tools'); if(secTools) secTools.textContent = t('sidebar_tools');
  var fLabel = document.getElementById('sidebar-footer-label'); if(fLabel) fLabel.textContent = t('sidebar_footer_label');
  var fDays = document.getElementById('sidebar-days-until'); if(fDays) fDays.textContent = t('sidebar_days_until');
  var qs = document.getElementById('header-quick-start'); if(qs) qs.textContent = t('header_quick_start');
  // Update header title
  var titleEl = document.getElementById('header-title');
  if (titleEl) titleEl.textContent = t('page_'+currentPage);
  renderPage(currentPage);
}

