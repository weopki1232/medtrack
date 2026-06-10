// ── Canvas polyfill ───────────────────────────────────────────────────────────
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
    this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y);
    this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r);
    this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h);
    this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r);
    this.quadraticCurveTo(x,y,x+r,y); this.closePath();
  };
}

// ── Data ──────────────────────────────────────────────────────────────────────
const EXAM_DATES = [
  { id:'reg_tgat', label:'Register TGAT/TPAT',                      labelTh:'สมัครสอบ TGAT/TPAT',                      date:'2026-11-04', color:'#6366f1' },
  { id:'tpat3',    label:'TPAT3 + TGAT Exam',                       labelTh:'สอบ TPAT3 + TGAT',                         date:'2027-01-30', color:'#8b5cf6' },
  { id:'tpat1',    label:'TPAT1 Medical Exam',                      labelTh:'สอบ TPAT1 กสพท (แพทย์)',                  date:'2027-02-13', color:'#ef4444' },
  { id:'alevel1',  label:'A-Level Day 1 (Bio/Physics/Thai/Social)', labelTh:'A-Level วันที่ 1 (ชีวะ/ฟิสิกส์/ไทย/สังคม)', date:'2027-03-13', color:'#f59e0b' },
  { id:'alevel2',  label:'A-Level Day 2 (Math1/English/Chem)',      labelTh:'A-Level วันที่ 2 (คณิต1/อังกฤษ/เคมี)',      date:'2027-03-14', color:'#f59e0b' },
  { id:'alevel3',  label:'A-Level Day 3 (Math2/AppliedSci)',        labelTh:'A-Level วันที่ 3 (คณิต2/วิทย์ประยุกต์)',    date:'2027-03-15', color:'#f59e0b' },
  { id:'results',  label:'A-Level Results',                         labelTh:'ประกาศผล A-Level',                         date:'2027-04-20', color:'#10b981' },
  { id:'round3',   label:'Round 3 Admission',                       labelTh:'รอบ 3 Admission',                          date:'2027-05-07', color:'#06b6d4' },
];

const STUDY_PHASES = [
  { id:1, name:'Phase 1 — Foundation',  start:'2026-05-13', end:'2026-08-31', color:'#06b6d4', description:'Weekend classes, build base knowledge' },
  { id:2, name:'Phase 2 — Intensive',   start:'2026-09-01', end:'2026-12-31', color:'#8b5cf6', description:'Deep practice, focus on Chem/Physics/Math' },
  { id:3, name:'Phase 3 — Exam Sprint', start:'2027-01-01', end:'2027-03-15', color:'#ef4444', description:'Past papers, TPAT1 & A-Level final push' },
];

