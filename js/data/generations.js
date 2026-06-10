// ── Generations ────────────────────────────────────────────────────────────────
// MedTrack's built-in dates are the dek-70 (TCAS70 — entering university 2027)
// template. Any other generation (71, 72, …) shifts every default date by
// (generation − 70) years, and each exam date can still be overridden
// individually in Settings (stored in settings.examDates = {examId:'YYYY-MM-DD'}).
var BASE_GENERATION = 70;

function getGeneration() {
  var g = parseInt(getSettings().generation, 10);
  return (g && g >= 60 && g <= 200) ? g : BASE_GENERATION;
}

function shiftDateYears(iso, years) {
  if (!iso || !years) return iso;
  return (parseInt(iso.slice(0, 4), 10) + years) + iso.slice(4);
}

function getExamDates() {
  var shift = getGeneration() - BASE_GENERATION;
  var ov = getSettings().examDates || {};
  return EXAM_DATES.map(function(e) {
    return Object.assign({}, e, { date: ov[e.id] || shiftDateYears(e.date, shift) });
  });
}

function getExamById(id) { return getExamDates().find(function(e) { return e.id === id; }); }

function getStudyPhases() {
  var shift = getGeneration() - BASE_GENERATION;
  return STUDY_PHASES.map(function(p) {
    return Object.assign({}, p, { start: shiftDateYears(p.start, shift), end: shiftDateYears(p.end, shift) });
  });
}

// Sidebar countdown target — user-selectable exam, or a fully custom label+date.
function getCountdownTarget() {
  var c = getSettings().countdown || {};
  if (c.mode === 'custom' && c.date) return { label: c.label || 'My exam', date: c.date };
  var e = (c.examId && getExamById(c.examId)) || getExamById('tpat1');
  return { label: e.label, date: e.date };
}

function updateCountdownSidebar() {
  var cd = getCountdownTarget();
  var lbl = document.getElementById('sidebar-footer-label');
  var cel = document.getElementById('sidebar-countdown');
  var fd  = document.getElementById('sidebar-days-until');
  if (lbl) lbl.textContent = cd.label;
  if (cel) cel.textContent = Math.max(0, Math.ceil((new Date(cd.date + 'T00:00:00') - new Date()) / 86400000));
  if (fd)  fd.textContent = t('sidebar_days_until', { date: fmtDate(cd.date) });
}
