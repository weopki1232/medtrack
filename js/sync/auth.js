// ── Auth (Google via Supabase) ─────────────────────────────────────────────────
var _syncUser = null;

function initAuth() {
  if (!syncAvailableHere()) return;
  sb().auth.onAuthStateChange(function(event, session) {
    var wasUser = _syncUser;
    _syncUser = session ? session.user : null;
    renderAccountBadge();
    if (_syncUser && !wasUser) SyncEngine.fullSync();      // just signed in / restored
    if (currentPage === 'settings') renderSettings();
  });
}

function signInWithGoogle() {
  if (!syncAvailableHere()) { toast(t('sync_web_only'), 'warning'); return; }
  sb().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname }
  });
}

function signOutUI() {
  if (!sb()) return;
  sb().auth.signOut().then(function() {
    _syncUser = null;
    renderAccountBadge();
    if (currentPage === 'settings') renderSettings();
    toast(t('sync_signed_out'), 'info');
  });
}

// Small status chip in the sidebar footer
function renderAccountBadge() {
  var el = document.getElementById('account-badge');
  if (!el) return;
  if (_syncUser) {
    el.innerHTML = '☁️ ' + escHtml((_syncUser.email || '').split('@')[0]);
    el.title = (_syncUser.email || '') + ' — ' + t('sync_synced');
    el.style.display = '';
  } else if (syncAvailableHere()) {
    el.innerHTML = '☁️ ' + t('sync_sign_in_short');
    el.title = t('sync_sign_in');
    el.style.display = '';
  } else {
    el.style.display = 'none';
  }
}
