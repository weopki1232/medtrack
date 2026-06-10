// ── Sync engine ────────────────────────────────────────────────────────────────
// Offline-first: localStorage stays the source of truth for the running app.
// Signed in, every Storage.set is debounced and upserted to Supabase
// (user_state: PK user_id+key, value jsonb, updated_at). On load/login we pull
// all rows and resolve per key by last-write-wins, except record arrays which
// are merged as a union by record id so two offline devices can't erase each
// other's logs.
var SyncEngine = {
  _dirty: {},
  _timer: null,
  _busy: false,
  lastSyncedAt: null,

  // Arrays of {id,...} records — merged by id union instead of replaced
  RECORD_ARRAY_KEYS: ['mt_sessions', 'mt_tasks', 'mt_scores', 'mt_mistakes', 'mt_formulas', 'mt_diagrams'],
  // Never synced
  SKIP_KEYS: ['mt_sync_meta'],

  _meta: function() { return Storage.get('mt_sync_meta', {}); },
  _setMeta: function(m) { try { localStorage.setItem('mt_sync_meta', JSON.stringify(m)); } catch (e) {} },
  _touch: function(key) { var m = this._meta(); m[key] = Date.now(); this._setMeta(m); },

  onLocalWrite: function(key) {
    if (this.SKIP_KEYS.indexOf(key) !== -1) return;
    this._touch(key);
    if (!_syncUser) return;
    this._dirty[key] = true;
    clearTimeout(this._timer);
    var self = this;
    this._timer = setTimeout(function() { self.pushDirty(); }, 2000);
  },

  pushDirty: function() {
    if (!_syncUser || !sb()) return Promise.resolve();
    var keys = Object.keys(this._dirty);
    if (!keys.length) return Promise.resolve();
    this._dirty = {};
    var meta = this._meta();
    var rows = keys.map(function(k) {
      return {
        user_id: _syncUser.id,
        key: k,
        value: Storage.get(k, null),
        updated_at: new Date(meta[k] || Date.now()).toISOString()
      };
    });
    var self = this;
    return sb().from('user_state').upsert(rows).then(function(res) {
      if (res.error) { keys.forEach(function(k) { self._dirty[k] = true; }); }
      else { self.lastSyncedAt = new Date(); renderAccountBadge(); }
    });
  },

  _mergeRecordArrays: function(localArr, remoteArr, preferRemote) {
    var base = (preferRemote ? remoteArr : localArr) || [];
    var other = (preferRemote ? localArr : remoteArr) || [];
    var seen = {};
    base.forEach(function(r) { if (r && r.id) seen[r.id] = true; });
    var merged = base.slice();
    other.forEach(function(r) { if (r && r.id && !seen[r.id]) merged.push(r); });
    return merged;
  },

  fullSync: function() {
    if (!_syncUser || !sb() || this._busy) return Promise.resolve();
    var self = this;
    this._busy = true;
    return sb().from('user_state').select('key,value,updated_at').then(function(res) {
      self._busy = false;
      if (res.error) { toast(t('sync_failed'), 'error'); return; }
      var meta = self._meta();
      var remoteKeys = {};
      var changedLocally = false;
      (res.data || []).forEach(function(row) {
        remoteKeys[row.key] = true;
        if (self.SKIP_KEYS.indexOf(row.key) !== -1) return;
        var remoteTs = new Date(row.updated_at).getTime();
        var localTs = meta[row.key] || 0;
        var localVal = Storage.get(row.key, null);
        if (self.RECORD_ARRAY_KEYS.indexOf(row.key) !== -1 && Array.isArray(row.value) && Array.isArray(localVal)) {
          var merged = self._mergeRecordArrays(localVal, row.value, remoteTs > localTs);
          if (JSON.stringify(merged) !== JSON.stringify(localVal)) { localStorage.setItem(row.key, JSON.stringify(merged)); changedLocally = true; }
          if (JSON.stringify(merged) !== JSON.stringify(row.value)) self._dirty[row.key] = true;
          else meta[row.key] = remoteTs; // in sync — record it so next pull skips the merge
        } else if (remoteTs > localTs) {
          if (JSON.stringify(row.value) !== JSON.stringify(localVal)) { localStorage.setItem(row.key, JSON.stringify(row.value)); changedLocally = true; }
          meta[row.key] = remoteTs;
        } else if (localTs > remoteTs && localVal !== null) {
          self._dirty[row.key] = true;
        }
      });
      // Local keys the server has never seen → push them
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('mt_') === 0 && !remoteKeys[k] && self.SKIP_KEYS.indexOf(k) === -1) self._dirty[k] = true;
      }
      self._setMeta(meta);
      self.pushDirty();
      self.lastSyncedAt = new Date();
      renderAccountBadge();
      if (changedLocally) { renderPage(currentPage); updateCountdownSidebar(); }
      toast(t('sync_done'), 'success');
    });
  },

  manualSync: function() {
    if (!_syncUser) { toast(t('sync_sign_in'), 'info'); return; }
    this.fullSync();
  }
};

// Hook every structured write so changes queue for sync automatically
(function() {
  var _origSet = Storage.set.bind(Storage);
  Storage.set = function(key, val) {
    _origSet(key, val);
    SyncEngine.onLocalWrite(key);
  };
})();
