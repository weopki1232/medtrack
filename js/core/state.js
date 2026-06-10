// ── App State ─────────────────────────────────────────────────────────────────
let currentPage = 'dashboard';
let openSubjectId = null;
let taskFilter = 'all';
let vaultSearch = '';
let vaultQuizMode = false;
let vaultRevealed = new Set();
let vaultFlashMode = false, vaultFlashIdx = 0, vaultFlashList = [];
var _ambientCtx = null, _ambientGain = null, _ambientSrc = null, _ambientType = '';
var _focusSongEl = null, _focusSongName = '', _focusSongUrl = '';
var _pendingSession = null, _pomoMood = '';
