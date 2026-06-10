// ── Supabase client (lazy singleton) ───────────────────────────────────────────
var _sbClient = null;

function syncConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
}

function sb() {
  if (!syncConfigured()) return null;
  if (!_sbClient) _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _sbClient;
}

// OAuth redirects need a real http(s) origin; Electron runs on file:// so the
// desktop app stays local-only and points users at the hosted web app to sync.
function syncAvailableHere() {
  return syncConfigured() && (location.protocol === 'https:' || location.protocol === 'http:');
}
