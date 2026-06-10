// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  var _freshUser = Storage.get(KEYS.SETTINGS, null) === null;
  var s = Storage.getSettings();
  if (s.darkModeAuto) {
    var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    document.body.classList.toggle('light-mode', !mqDark.matches);
    mqDark.addEventListener('change', function(e) {
      if (Storage.getSettings().darkModeAuto) {
        document.body.classList.toggle('light-mode', !e.matches);
        Storage.saveSettings({darkMode:e.matches});
      }
    });
  } else {
    if (!s.darkMode) document.body.classList.add('light-mode');
  }
  // Apply saved theme
  if (s.theme && s.theme !== 'default') document.body.classList.add('theme-'+s.theme);
  // Restore lights state
  if (localStorage.getItem('mt_lights_off') === '1') {
    document.body.classList.add('lights-off');
    var lbl = document.getElementById('light-switch-label'); if (lbl) lbl.textContent = 'OFF';
    var btn = document.getElementById('light-switch-btn'); if (btn) btn.title = 'Turn lights on';
    if (localStorage.getItem('mt_detective_active') === '1') {
      document.body.classList.add('detective-active');
      setTimeout(function() {
        startFireflies();
        startPipe();
        startRain();
        startSmoke();
        startDetectiveAmbience();
        _restoreLampState();
      }, 150);
    }
  }
  // Wire up detective lamp click/drag
  initLampInteraction();
  initLampDragMove();
  // Typewriter sound for detective mode inputs
  initTypewriterSound();
  // Start NPC system
  initNPC();

  // Card click ripple micro-interaction
  document.addEventListener('click', function(e) {
    var card = e.target.closest && e.target.closest('.card');
    if (!card) return;
    var rect = card.getBoundingClientRect();
    var r = document.createElement('div');
    r.className = 'ripple-dot';
    var size = 40;
    r.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(r);
    setTimeout(function(){ r.remove(); }, 560);
  });
  // Apply saved language to buttons and sidebar
  if (s.lang) {
    var enBtn = document.getElementById('lang-en'), thBtn = document.getElementById('lang-th');
    if (enBtn) enBtn.classList.toggle('active', s.lang==='en');
    if (thBtn) thBtn.classList.toggle('active', s.lang==='th');
    if (s.lang !== 'en') {
      var navLabels = {dashboard:'nav_dashboard',timer:'nav_timer',subjects:'nav_subjects',analytics:'nav_analytics',insights:'nav_insights',journey:'nav_journey',tasks:'nav_tasks',schedule:'nav_schedule',vault:'nav_vault',diagrams:'nav_diagrams',settings:'nav_settings'};
      Object.keys(navLabels).forEach(function(page){ var el=document.getElementById('nav-lbl-'+page); if(el)el.textContent=t(navLabels[page]); });
      var sub=document.getElementById('sidebar-subtitle'); if(sub)sub.textContent=t('sidebar_subtitle');
      var secMain=document.getElementById('nav-sec-main'); if(secMain)secMain.textContent=t('sidebar_main');
      var secTrack=document.getElementById('nav-sec-track'); if(secTrack)secTrack.textContent=t('sidebar_track');
      var secTools=document.getElementById('nav-sec-tools'); if(secTools)secTools.textContent=t('sidebar_tools');
      var qs=document.getElementById('header-quick-start'); if(qs)qs.textContent=t('header_quick_start');
    }
  }

  function updateDate() {
    var now = new Date();
    var el = document.getElementById('header-date');
    if (el) el.textContent = now.toLocaleDateString('en-GB', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
    updateCountdownSidebar();
  }
  updateDate();
  setInterval(updateDate, 60000);

  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.addEventListener('click', function() {
      navigate(el.dataset.page);
      var sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    });
  });

  diagramState.name = t('diag_untitled');
  initPomodoro(s.pomodoroWork, s.pomodoroShortBreak, s.pomodoroLongBreak, s.pomodoroCycles);
  initStudyReminder();
  if (s.ambientUrl) { _ambientType = s.ambientUrl; }
  setTimeout(checkAchievements, 600); // claim any already-earned achievements on load
  var _pmBtn = document.getElementById('power-mode-btn');
  if (_pmBtn) _pmBtn.textContent = _powerMode === 'min' ? '⚡ Min' : '🔥 Max';
  navigate('dashboard');
  initAuth();
  renderAccountBadge();
  if (_freshUser) setTimeout(openOnboardingModal, 400);

  document.addEventListener('keydown', function(e) {
    var tag = (e.target||{}).tagName||'';
    if (tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT') return;
    if ((e.ctrlKey||e.altKey||e.metaKey) && e.key!=='Escape') return;
    switch(e.key) {
      case ' ': case 'Spacebar':
        if(currentPage==='timer'){e.preventDefault();toggleTimer();}
        break;
      case 'd': case 'D': navigate('dashboard'); break;
      case 's': case 'S': navigate('subjects'); break;
      case 'a': case 'A': navigate('analytics'); break;
      case 't': case 'T': navigate('tasks'); break;
      case 'v': case 'V': navigate('vault'); break;
      case 'j': case 'J': navigate('journey'); break;
      case 'i': case 'I': navigate('insights'); break;
      case '?': openKeyboardShortcutsModal(); break;
      case 'Escape':
        document.querySelectorAll('.modal-overlay').forEach(function(m){m.remove();});
        if(focusState&&focusState.active)closeFocusMode();
        break;
    }
  });
}


// ── Mobile sidebar toggle ──────────────────────────────────────────────────────
function toggleSidebar() {
  var sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}
