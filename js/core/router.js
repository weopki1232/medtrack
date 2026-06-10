// ── Router ────────────────────────────────────────────────────────────────────
function navigate(page) {
  var isDetective = document.body.classList.contains('detective-active');
  if (page !== 'dashboard' && isDetective) { clearRedStrings(); _stopStringAnim(); }
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active', el.dataset.page===page));
  document.querySelectorAll('.page-section').forEach(el=>el.classList.toggle('page-hidden', el.id!=='page-'+page));
  var titleEl = document.getElementById('header-title');
  if (titleEl) titleEl.textContent = t('page_'+page);
  renderPage(page);
  if (page === 'dashboard' && isDetective) setTimeout(function() { drawRedStrings(); _startStringAnim(); }, 300);
}
function renderPage(p) {
  if (p==='dashboard')  renderDashboard();
  else if (p==='timer')     renderTimerPage();
  else if (p==='subjects')  renderSubjectsPage();
  else if (p==='analytics') renderAnalytics();
  else if (p==='tasks')     renderTasks();
  else if (p==='diagrams')  renderDiagrams();
  else if (p==='settings')  renderSettings();
  else if (p==='insights')  renderInsights();
  else if (p==='journey')   renderJourney();
  else if (p==='vault')     renderVault();
  else if (p==='schedule')  renderSchedulePage();
}

