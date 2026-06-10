// ── Ambient Focus Mode ─────────────────────────────────────────────────────────
var focusState = { active:false, particles:[], animId:null, audioCtx:null, gainNode:null, soundOn:true };

function openFocusMode() {
  var overlay = document.getElementById('focus-overlay');
  if (!overlay) return;
  // Sync subject label
  var sid = timerState.selectedSubjectId;
  var sub = sid ? getSubject(sid) : null;
  var lbl = document.getElementById('focus-subject-lbl');
  if (lbl) lbl.textContent = sub ? sub.icon+' '+sub.shortName : '';
  overlay.classList.add('active');
  focusState.active = true;
  var soundBtn = document.getElementById('focus-sound-btn');
  if (soundBtn) soundBtn.textContent = focusState.soundOn ? t('focus_sound_on') : t('focus_sound_off');
  var pauseBtn = document.getElementById('focus-pause-btn');
  if (pauseBtn) pauseBtn.textContent = t('focus_pause');
  var exitBtn = document.getElementById('focus-exit-btn');
  if (exitBtn) exitBtn.textContent = t('focus_exit');
  initFocusParticles();
  _updateFocusSongBar();
  startFocusAudio();
  updateFocusDisplay();
}

function closeFocusMode() {
  var overlay = document.getElementById('focus-overlay');
  if (overlay) overlay.classList.remove('active');
  focusState.active = false;
  if (focusState.animId) { cancelAnimationFrame(focusState.animId); focusState.animId = null; }
  stopFocusAudio();
}

function updateFocusDisplay() {
  if (!focusState.active) return;
  var el = document.getElementById('focus-time');
  if (el) {
    var mins = Math.floor(timerState.remainingSeconds/60), secs = timerState.remainingSeconds%60;
    el.textContent = String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  }
  var subEl = document.getElementById('focus-sub');
  if (subEl) {
    var phaseLabels = {work:t('focus_label'),'short-break':t('focus_break'),'long-break':t('focus_long_break')};
    subEl.textContent = timerState.mode==='pomodoro' ? (phaseLabels[timerState.phase]||t('focus_label')) : t('focus_label');
  }
  if (timerState.running && !timerState.paused) requestAnimationFrame(updateFocusDisplay);
}

function initFocusParticles() {
  var canvas = document.getElementById('focus-particle-canvas');
  if (!canvas) return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  focusState.particles = [];
  for (var i = 0; i < 120; i++) {
    focusState.particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: 0.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 2.5,
      o: 0.1 + Math.random() * 0.6
    });
  }
  drawFocusParticles();
}

var _focusParticleLastTs = 0;
function drawFocusParticles(ts) {
  var canvas = document.getElementById('focus-particle-canvas');
  if (!canvas || !focusState.active) return;
  if (document.hidden || (_powerMode === 'min' && ts - _focusParticleLastTs < 33)) {
    focusState.animId = requestAnimationFrame(drawFocusParticles);
    return;
  }
  var dt = Math.min((ts - _focusParticleLastTs) / 16.67, 3);
  _focusParticleLastTs = ts;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  focusState.particles.forEach(function(p) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > canvas.height) { p.y = -4; p.x = Math.random() * canvas.width; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(167,139,250,'+p.o+')';
    ctx.fill();
  });
  focusState.animId = requestAnimationFrame(drawFocusParticles);
}

function startFocusAudio() {
  if (!focusState.soundOn) return;
  var vol = parseFloat((document.getElementById('focus-sound-vol')||{}).value || 0.35);

  // If an uploaded song is loaded, play it instead of the synth
  if (_focusSongEl && _focusSongUrl) {
    stopFocusSynth();
    _focusSongEl.volume = vol;
    _focusSongEl.play().catch(function(){});
    return;
  }

  // Synth fallback: rain noise + lofi drone
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    focusState.audioCtx = ctx;
    var masterGain = ctx.createGain();
    masterGain.gain.value = vol;
    masterGain.connect(ctx.destination);
    focusState.gainNode = masterGain;

    var bufSize = ctx.sampleRate * 2;
    var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < bufSize; i++) data[i] = Math.random()*2-1;
    var noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    var bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 1200; bpf.Q.value = 0.5;
    var noiseGain = ctx.createGain(); noiseGain.gain.value = 0.18;
    noise.connect(bpf); bpf.connect(noiseGain); noiseGain.connect(masterGain);
    noise.start();

    [110, 110.4].forEach(function(freq) {
      var osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
      var g = ctx.createGain(); g.gain.value = 0.06;
      osc.connect(g); g.connect(masterGain); osc.start();
    });

    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.15;
    var lfoGain = ctx.createGain(); lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    var sub = ctx.createOscillator(); sub.type = 'triangle'; sub.frequency.value = 55;
    var subG = ctx.createGain(); subG.gain.value = 0.07;
    lfoGain.connect(subG.gain);
    sub.connect(subG); subG.connect(masterGain);
    lfo.start(); sub.start();
  } catch(e) {}
}

function stopFocusSynth() {
  if (focusState.audioCtx) {
    try { focusState.audioCtx.close(); } catch(e) {}
    focusState.audioCtx = null; focusState.gainNode = null;
  }
}

function stopFocusAudio() {
  stopFocusSynth();
  if (_focusSongEl) { _focusSongEl.pause(); }
}

function focusToggleSound() {
  focusState.soundOn = !focusState.soundOn;
  var btn = document.getElementById('focus-sound-btn');
  if (focusState.soundOn) {
    if (btn) btn.textContent = t('focus_sound_on');
    startFocusAudio();
  } else {
    if (btn) btn.textContent = t('focus_sound_off');
    stopFocusAudio();
  }
}

function focusSetVolume(v) {
  var vol = parseFloat(v);
  if (focusState.gainNode) focusState.gainNode.gain.value = vol;
  if (_focusSongEl) _focusSongEl.volume = vol;
}

// ── Focus mode song upload ─────────────────────────────────────────────────────
function focusUploadSong() {
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'audio/*';
  inp.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (_focusSongUrl) URL.revokeObjectURL(_focusSongUrl);
    _focusSongUrl = URL.createObjectURL(file);
    _focusSongName = file.name.replace(/\.[^.]+$/, '');

    if (!_focusSongEl) {
      _focusSongEl = new Audio();
      _focusSongEl.loop = true;
    }
    _focusSongEl.src = _focusSongUrl;
    _focusSongEl.volume = parseFloat((document.getElementById('focus-sound-vol')||{}).value || 0.35);

    // Always start playing immediately on upload (stop synth if running)
    stopFocusSynth();
    focusState.soundOn = true;
    var btn = document.getElementById('focus-sound-btn');
    if (btn) btn.textContent = t('focus_sound_on');
    _focusSongEl.play().catch(function(){});
    _updateFocusSongBar();
    toast('🎵 ' + _focusSongName + ' — playing', 'success');
  };
  inp.click();
}

function focusClearSong() {
  if (_focusSongEl) { _focusSongEl.pause(); _focusSongEl.src = ''; }
  if (_focusSongUrl) { URL.revokeObjectURL(_focusSongUrl); _focusSongUrl = ''; }
  _focusSongName = '';
  // Fall back to synth if focus mode is running
  if (focusState.active && focusState.soundOn) { stopFocusSynth(); startFocusAudio(); }
  _updateFocusSongBar();
}

function _updateFocusSongBar() {
  var bar  = document.getElementById('focus-song-bar');
  var name = document.getElementById('focus-song-name');
  if (bar)  bar.style.display  = _focusSongName ? 'flex' : 'none';
  if (name) name.textContent   = _focusSongName;
}


