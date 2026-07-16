// ── Light Switch ──────────────────────────────────────────────────────────────
function toggleLights() {
  var isOff = document.body.classList.contains('lights-off');
  var lbl = document.getElementById('light-switch-label');
  var btn = document.getElementById('light-switch-btn');
  if (!isOff) {
    // Lights OFF — flicker then fade to dark
    document.body.classList.add('lights-flicker-off');
    setTimeout(function() {
      document.body.classList.remove('lights-flicker-off');
      document.body.classList.add('lights-off');
    }, 700);
    if (lbl) lbl.textContent = 'OFF';
    if (btn) btn.title = 'Turn lights on';
    localStorage.setItem('mt_lights_off', '1');
  } else {
    // Lights ON — clear detective mode too, bloom back to normal
    document.body.classList.remove('lights-off', 'detective-active');
    document.body.classList.add('lights-bloom-on');
    stopFireflies();
    stopPipe();
    stopRain();
    stopSmoke();
    stopDetectiveAmbience();
    stopDetectiveTick();
    _stopLampSway();
    if (_lampIdleTimer) { clearTimeout(_lampIdleTimer); _lampIdleTimer = null; }
    _resetLampState();
    setTimeout(function() { document.body.classList.remove('lights-bloom-on'); }, 950);
    if (lbl) lbl.textContent = 'ON';
    if (btn) btn.title = 'Turn lights off';
    localStorage.setItem('mt_lights_off', '0');
    localStorage.removeItem('mt_detective_active');
  }
}

// ── Detective Fireflies ───────────────────────────────────────────────────────
function startFireflies() {
  if (document.getElementById('sidebar-fireflies')) return;
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  var wrap = document.createElement('div');
  wrap.id = 'sidebar-fireflies';
  wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:20;';
  var count = 14;
  for (var i = 0; i < count; i++) {
    var f = document.createElement('div');
    f.className = 'firefly';
    var size = 2.5 + Math.random() * 2.5;
    f.style.width  = size + 'px';
    f.style.height = size + 'px';
    f.style.left   = (4 + Math.random() * 88) + '%';
    f.style.top    = (10 + Math.random() * 80) + '%';
    f.style.animationDuration  = (7 + Math.random() * 9) + 's';
    f.style.animationDelay     = (-Math.random() * 12) + 's';
    f.style.opacity = '0';
    wrap.appendChild(f);
  }
  sidebar.appendChild(wrap);
}

function stopFireflies() {
  var w = document.getElementById('sidebar-fireflies');
  if (w) w.remove();
}

// ── Detective Lamp Interaction ────────────────────────────────────────────────
function activateDetective() {
  if (document.body.classList.contains('detective-active')) return;
  document.body.classList.add('detective-active');
  localStorage.setItem('mt_detective_active', '1');
  startFireflies();
  startPipe();
  startRain();
  startSmoke();
  startDetectiveAmbience();
  if (timerState.running && !timerState.paused) startDetectiveTick();
  setTimeout(_restoreLampState, 120);
  setTimeout(_resetLampIdleTimer, 200);
}

// ── Detective: Pipe (Brightness Control via Proximity) ────────────────────────
var _lampPos    = null;
var _lampBright = 0.3;   // starts dim; dragging lamp toward pipe increases it
var _lampDragging = false, _lampDragOX = 0, _lampDragOY = 0;
var _pipeLit    = false;
var _smokeIntervalMs = 1200;

function startPipe() {
  if (document.getElementById('detective-pipe')) return;
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  var pipe = document.createElement('div');
  pipe.id = 'detective-pipe';
  pipe.innerHTML =
    '<svg width="76" height="64" viewBox="0 0 76 64" fill="none">'+
      '<path d="M10 54 Q22 54 32 40 Q38 32 56 30 L72 30" stroke="%235a3010" stroke-width="5.5" stroke-linecap="round"/>'+
      '<ellipse cx="16" cy="40" rx="13" ry="17" fill="%234a2808" stroke="%233a1e06" stroke-width="1.5"/>'+
      '<ellipse cx="16" cy="25" rx="10" ry="4.5" fill="%232a1405" stroke="%233a1e06" stroke-width="1"/>'+
      '<ellipse class="pipe-ember" cx="16" cy="25" rx="7.5" ry="3" fill="rgba(200,60,10,0)" style="transition:fill 0.4s ease"/>'+
    '</svg>';
  pipe.style.cssText = 'position:absolute;bottom:26%;left:10px;z-index:16;pointer-events:none;opacity:0;transition:opacity 1.2s ease 0.8s;';
  sidebar.appendChild(pipe);
  requestAnimationFrame(function() { pipe.style.opacity = '1'; });
}

function stopPipe() {
  var p = document.getElementById('detective-pipe');
  if (p) p.remove();
  _pipeLit = false;
}

function _updateBrightnessFromPipe(lampCX, lampCY) {
  // Once pipe is lit, brightness is permanently latched — don't reduce on move
  if (_pipeLit) { _applyBrightness(1.8); return; }

  var pipe = document.getElementById('detective-pipe');
  if (!pipe) return;
  var pr = pipe.getBoundingClientRect();
  var pipeCX = pr.left + pr.width * 0.22;
  var pipeCY = pr.top  + pr.height * 0.38;
  var bulbY  = lampCY + 44;
  var dist   = Math.sqrt(Math.pow(lampCX - pipeCX, 2) + Math.pow(bulbY - pipeCY, 2));
  var maxD   = 360;
  var bright = dist < maxD ? 0.2 + (1 - dist/maxD) * 1.6 : 0.2;
  _applyBrightness(bright);

  // Latch once lamp is clearly close (generous threshold) or brightness is high enough
  if (dist < 120 || bright >= 0.88) {
    // LIGHT the pipe — latches permanently until lights go back on
    _pipeLit = true;
    pipe.classList.add('pipe-lit');
    var ember = pipe.querySelector('.pipe-ember');
    if (ember) ember.style.fill = 'rgba(255,130,25,0.92)';
    _smokeIntervalMs = 380;
    if (_smokeInterval) {
      clearInterval(_smokeInterval);
      _smokeInterval = setInterval(_emitSmokePuff, _smokeIntervalMs);
    }
  }
}

function _applyBrightness(val) {
  _lampBright = Math.max(0.1, Math.min(1.8, val));
  var cone = document.getElementById('detective-cone');
  var glow = document.getElementById('detective-lamp-glow');
  var mc   = document.getElementById('main-content');
  if (cone) cone.style.opacity = Math.min(1, _lampBright).toString();
  if (glow) glow.style.opacity = Math.min(1, _lampBright * 0.9).toString();
  if (mc && document.body.classList.contains('detective-active'))
    mc.style.filter = 'brightness('+Math.max(0.04, 0.40*_lampBright)+') sepia(.60) saturate(.75)';

  // CONFIDENTIAL stamp glow — scales from dim red to full neon with lamp brightness
  var stamp = document.querySelector('.casefile-stamp');
  if (stamp) {
    var g = Math.max(0, (_lampBright - 0.12) / 1.68); // 0→1 normalised
    var a1 = (0.30 + g * 0.65).toFixed(2);
    var a2 = (0.22 + g * 0.55).toFixed(2);
    stamp.style.color  = 'rgba(225,32,18,'+a1+')';
    stamp.style.border = '2px solid rgba(215,30,16,'+a2+')';
    if (g < 0.05) {
      stamp.style.textShadow = 'none';
      stamp.style.boxShadow  = 'none';
    } else {
      var s1 = (g * 10).toFixed(1)+'px', s2 = (g * 26).toFixed(1)+'px', s3 = (g * 52).toFixed(1)+'px';
      var o1 = (g * 0.90).toFixed(2), o2 = (g * 0.65).toFixed(2), o3 = (g * 0.30).toFixed(2);
      stamp.style.textShadow = '0 0 '+s1+' rgba(230,30,15,'+o1+'),0 0 '+s2+' rgba(210,20,8,'+o2+'),0 0 '+s3+' rgba(180,10,4,'+o3+')';
      stamp.style.boxShadow  = '0 0 '+s1+' rgba(220,28,12,'+o2+'),0 0 '+s2+' rgba(200,18,6,'+o3+')';
    }
  }
}

function setLampPosition(cx, cy) {
  var lamp = document.getElementById('detective-lamp');
  var cone = document.getElementById('detective-cone');
  var glow = document.getElementById('detective-lamp-glow');
  if (lamp) { lamp.style.left=cx+'px'; lamp.style.top=cy+'px'; lamp.style.transform='translateX(-50%)'; }
  // Light center at mid-lamp (~44px below top) rather than bottom bulb
  if (cone) { cone.style.left=cx+'px'; cone.style.top=(cy+44)+'px'; cone.style.transform='translate(-50%,-50%)'; }
  if (glow) { glow.style.left=cx+'px'; glow.style.top=(cy+44)+'px'; glow.style.transform='translate(-50%,-50%)'; }
  _lampPos = { x:cx, y:cy };
}

function _restoreLampState() {
  var savedPos = JSON.parse(localStorage.getItem('mt_lamp_pos') || 'null');
  if (savedPos) {
    setLampPosition(savedPos.x, savedPos.y);
    _updateBrightnessFromPipe(savedPos.x, savedPos.y);
  } else {
    _applyBrightness(0.3); // dim by default — user needs to bring lamp to pipe
  }
}

function _resetLampState() {
  _lampPos = null; _lampBright = 0.3; _pipeLit = false;
  localStorage.removeItem('mt_lamp_pos');
  ['detective-lamp','detective-cone','detective-lamp-glow'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.style.left=''; el.style.top=''; el.style.transform=''; el.style.opacity=''; }
  });
  var mc = document.getElementById('main-content');
  if (mc) mc.style.filter = '';
}

function initLampDragMove() {
  var lamp = document.getElementById('detective-lamp');
  if (!lamp) return;

  lamp.addEventListener('mousedown', function(e) {
    if (!document.body.classList.contains('detective-active')) return;
    e.preventDefault(); e.stopPropagation();
    _stopLampSway();
    if (_lampIdleTimer) clearTimeout(_lampIdleTimer);
    _lampDragging = true;
    var r = lamp.getBoundingClientRect();
    _lampDragOX = e.clientX - (r.left + r.width/2);
    _lampDragOY = e.clientY - r.top;
  });
  document.addEventListener('mousemove', function(e) {
    if (!_lampDragging) return;
    var cx = e.clientX - _lampDragOX, cy = e.clientY - _lampDragOY;
    setLampPosition(cx, cy);
    _updateBrightnessFromPipe(cx, cy);
  });
  document.addEventListener('mouseup', function() {
    if (!_lampDragging) return;
    _lampDragging = false;
    if (_lampPos) localStorage.setItem('mt_lamp_pos', JSON.stringify(_lampPos));
  });

  // Touch support
  lamp.addEventListener('touchstart', function(e) {
    if (!document.body.classList.contains('detective-active')) return;
    _stopLampSway();
    if (_lampIdleTimer) clearTimeout(_lampIdleTimer);
    e.stopPropagation(); _lampDragging = true;
    var r = lamp.getBoundingClientRect();
    _lampDragOX = e.touches[0].clientX - (r.left + r.width/2);
    _lampDragOY = e.touches[0].clientY - r.top;
  }, {passive:true});
  document.addEventListener('touchmove', function(e) {
    if (!_lampDragging) return;
    var cx = e.touches[0].clientX - _lampDragOX, cy = e.touches[0].clientY - _lampDragOY;
    setLampPosition(cx, cy);
    _updateBrightnessFromPipe(cx, cy);
  }, {passive:true});
  document.addEventListener('touchend', function() {
    if (!_lampDragging) return;
    _lampDragging = false;
    if (_lampPos) localStorage.setItem('mt_lamp_pos', JSON.stringify(_lampPos));
    _resetLampIdleTimer();
  });
}

// ── Detective: Lamp idle sway ─────────────────────────────────────────────────
var _lampIdleTimer = null;
var _lampSwayId    = null;
var _lampSwayBase  = null;

function _resetLampIdleTimer() {
  if (_lampIdleTimer) clearTimeout(_lampIdleTimer);
  _stopLampSway();
  if (!document.body.classList.contains('detective-active')) return;
  _lampIdleTimer = setTimeout(_startLampSway, 10000);
}

function _startLampSway() {
  if (!_lampPos || _lampSwayId) return;
  _lampSwayBase = { x: _lampPos.x, y: _lampPos.y };
  var t0 = performance.now();
  var _swayLastTs = 0;
  function tick(ts) {
    if (!document.body.classList.contains('detective-active') || _lampDragging) {
      _lampSwayId = null; return;
    }
    if (!document.hidden && (_powerMode === 'max' || ts - _swayLastTs >= 42)) {
      _swayLastTs = ts;
      var elapsed = (ts - t0) * 0.001;
      var amp  = Math.min(1, elapsed / 3) * 20;
      var sway = Math.sin(elapsed * 1.1) * amp;
      setLampPosition(_lampSwayBase.x + sway, _lampSwayBase.y);
    }
    _lampSwayId = requestAnimationFrame(tick);
  }
  _lampSwayId = requestAnimationFrame(tick);
}

function _stopLampSway() {
  if (_lampSwayId) { cancelAnimationFrame(_lampSwayId); _lampSwayId = null; }
  _lampSwayBase = null;
}

function initLampInteraction() {
  var lamp = document.getElementById('detective-lamp');
  if (!lamp) return;
  var startY = null, didDrag = false;

  lamp.addEventListener('mousedown', function(e) {
    if (!document.body.classList.contains('lights-off')) return;
    if (document.body.classList.contains('detective-active')) return;
    startY = e.clientY; didDrag = false;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (startY === null) return;
    if (e.clientY - startY > 26) { activateDetective(); startY = null; didDrag = true; }
  });
  document.addEventListener('mouseup', function() {
    if (startY === null) return;
    if (!didDrag) activateDetective();
    startY = null; didDrag = false;
  });

  // Touch
  lamp.addEventListener('touchstart', function(e) {
    if (!document.body.classList.contains('lights-off')) return;
    if (document.body.classList.contains('detective-active')) return;
    startY = e.touches[0].clientY; didDrag = false;
  }, { passive:true });
  document.addEventListener('touchmove', function(e) {
    if (startY === null) return;
    if (e.touches[0].clientY - startY > 26) { activateDetective(); startY = null; didDrag = true; }
  }, { passive:true });
  document.addEventListener('touchend', function() {
    if (startY === null) return;
    if (!didDrag) activateDetective();
    startY = null; didDrag = false;
  });
}

// ── Detective: Typewriter Sound ───────────────────────────────────────────────
var _typeCtx = null;
var _TYPE_SKIP = ['Shift','Control','Alt','Meta','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','CapsLock','Tab','Escape','Enter','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Home','End','PageUp','PageDown','Insert','Delete','Backspace'];
function initTypewriterSound() {
  document.addEventListener('keydown', function(e) {
    if (!document.body.classList.contains('detective-active')) return;
    var tag = (e.target||{}).tagName||'';
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
    if (_TYPE_SKIP.indexOf(e.key) !== -1) return;
    try {
      if (!_typeCtx) _typeCtx = new AudioContext();
      var ctx = _typeCtx;
      var bufLen = Math.floor(ctx.sampleRate * 0.015);
      var buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      var src  = ctx.createBufferSource(); src.buffer = buf;
      var filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 3000;
      var gain = ctx.createGain(); gain.gain.value = 0.06;
      src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      src.start();
    } catch(ex) {}
  });
}

// ── Power mode (min = throttled, max = full quality) ─────────────────────────
var _powerMode = localStorage.getItem('mt_power_mode') || 'min';
function togglePowerMode() {
  _powerMode = _powerMode === 'min' ? 'max' : 'min';
  localStorage.setItem('mt_power_mode', _powerMode);
  var btn = document.getElementById('power-mode-btn');
  if (btn) { btn.textContent = _powerMode === 'min' ? '⚡︎ Min' : '⚡︎ Max'; }
  if (document.body.classList.contains('detective-active')) { stopRain(); startRain(); }
  renderSettings();
}

// ── Detective: Rain on Window ─────────────────────────────────────────────────
var _rainAnimId = null;
var _rainDrops  = [];
function _resizeRainCanvas() {
  var canvas = document.getElementById('rain-canvas');
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth  || Math.max(1, window.innerWidth - 240);
  canvas.height = canvas.offsetHeight || window.innerHeight;
}
function startRain() {
  var canvas = document.getElementById('rain-canvas');
  if (!canvas) return;
  _resizeRainCanvas();
  var W = canvas.width, H = canvas.height;
  _rainDrops = [];
  var dropCount = _powerMode === 'min' ? 55 : 90;
  for (var i = 0; i < dropCount; i++) {
    _rainDrops.push({ x:Math.random()*W, y:Math.random()*H, len:8+Math.random()*10, speed:6+Math.random()*8, op:0.08+Math.random()*0.10 });
  }
  var angle = 0.22;
  var ctx2 = canvas.getContext('2d');
  var _rainLastTs = 0;
  function frame(ts) {
    if (!canvas) return;
    if (document.hidden || (_powerMode === 'min' && ts - _rainLastTs < 42)) {
      if (document.body.classList.contains('detective-active')) _rainAnimId = requestAnimationFrame(frame);
      return;
    }
    var dt = Math.min((ts - _rainLastTs) / 16.67, 3);
    _rainLastTs = ts;
    W = canvas.width; H = canvas.height;
    ctx2.clearRect(0,0,W,H);
    // Faint window-pane grid
    ctx2.strokeStyle = 'rgba(160,140,100,0.04)'; ctx2.lineWidth = 1;
    for (var c=1;c<3;c++){ctx2.beginPath();ctx2.moveTo(W*c/3,0);ctx2.lineTo(W*c/3,H);ctx2.stroke();}
    for (var r=1;r<2;r++){ctx2.beginPath();ctx2.moveTo(0,H*r/2);ctx2.lineTo(W,H*r/2);ctx2.stroke();}
    for (var i=0;i<_rainDrops.length;i++){
      var d=_rainDrops[i];
      ctx2.beginPath();
      ctx2.strokeStyle='rgba(160,185,210,'+d.op+')'; ctx2.lineWidth=0.8;
      ctx2.moveTo(d.x, d.y);
      ctx2.lineTo(d.x + d.len*Math.sin(angle), d.y + d.len*Math.cos(angle));
      ctx2.stroke();
      d.y += d.speed * dt; d.x += d.speed * dt * Math.sin(angle);
      if (d.y > H+d.len) { d.y=-d.len; d.x=Math.random()*W; }
      if (d.x > W+d.len) { d.x=-d.len; d.y=Math.random()*H; }
    }
    if (document.body.classList.contains('detective-active')) _rainAnimId = requestAnimationFrame(frame);
  }
  if (_rainAnimId) cancelAnimationFrame(_rainAnimId);
  _rainAnimId = requestAnimationFrame(frame);
  window.addEventListener('resize', _resizeRainCanvas);
}
function stopRain() {
  if (_rainAnimId) { cancelAnimationFrame(_rainAnimId); _rainAnimId = null; }
  window.removeEventListener('resize', _resizeRainCanvas);
  var canvas = document.getElementById('rain-canvas');
  if (canvas) { var ctx2=canvas.getContext('2d'); ctx2.clearRect(0,0,canvas.width,canvas.height); }
}

// ── Detective: Pipe Smoke ─────────────────────────────────────────────────────
var _smokeInterval = null;
function _emitSmokePuff() {
  if (!document.body.classList.contains('detective-active')) { stopSmoke(); return; }
  var container = document.getElementById('smoke-container');
  if (!container) return;
  var puff = document.createElement('div');
  puff.className = 'smoke-puff';
  // Emit from pipe bowl area (roughly 16px from left, 24px from bottom of container)
  puff.style.left = (8 + Math.random()*18)+'px';
  puff.style.bottom = '24px';
  puff.style.animationDuration = (5+Math.random()*3)+'s';
  // Brighter/denser when pipe is lit
  if (_pipeLit) puff.style.opacity = '0.6';
  container.appendChild(puff);
  puff.addEventListener('animationend', function(){ puff.remove(); });
}
function startSmoke() {
  if (document.getElementById('smoke-container')) return;
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  var container = document.createElement('div');
  container.id = 'smoke-container';
  // Position smoke at pipe bowl location (bottom 26% + a bit up)
  container.style.cssText = 'position:absolute;bottom:26%;left:0;width:60px;height:220px;pointer-events:none;z-index:15;overflow:visible;';
  sidebar.appendChild(container);
  _smokeInterval = setInterval(_emitSmokePuff, _smokeIntervalMs);
}
function stopSmoke() {
  if (_smokeInterval) { clearInterval(_smokeInterval); _smokeInterval = null; }
  var c = document.getElementById('smoke-container'); if (c) c.remove();
}

// ── Detective: Ambient Sound (vinyl crackle) ─────────────────────────────────
var _detectiveAudio = null;
function startDetectiveAmbience() {
  if (_detectiveAudio) return;
  try {
    var ctx3 = new AudioContext();
    var master = ctx3.createGain(); master.gain.value = 0.4; master.connect(ctx3.destination);
    var sr = ctx3.sampleRate;
    // Low rumble
    var rumble = ctx3.createOscillator(); rumble.type='sine'; rumble.frequency.value=55;
    var rumGain = ctx3.createGain(); rumGain.gain.value=0.03;
    rumble.connect(rumGain); rumGain.connect(master); rumble.start();
    // Vinyl crackle
    function schedCrackle() {
      if (!_detectiveAudio) return;
      var delay = 2+Math.random()*4, when = ctx3.currentTime+delay;
      var cLen = Math.floor(sr*0.03);
      var cBuf = ctx3.createBuffer(1,cLen,sr), cData = cBuf.getChannelData(0);
      for (var j=0;j<cLen;j++) cData[j] = Math.random()*2-1;
      var cSrc = ctx3.createBufferSource(); cSrc.buffer = cBuf;
      var cFilt = ctx3.createBiquadFilter(); cFilt.type='highpass'; cFilt.frequency.value=4000;
      var cGain = ctx3.createGain(); cGain.gain.value=0.08;
      cSrc.connect(cFilt); cFilt.connect(cGain); cGain.connect(master);
      cSrc.start(when); cSrc.onended = schedCrackle;
    }
    schedCrackle();
    _detectiveAudio = { ctx: ctx3, master: master };
  } catch(e) {}
}
function stopDetectiveAmbience() {
  if (!_detectiveAudio) return;
  try { _detectiveAudio.ctx.close(); } catch(e) {}
  _detectiveAudio = null;
}

// ── Detective: Clock Tick (Pomodoro) ─────────────────────────────────────────
var _tickInterval = null;
function startDetectiveTick() {
  if (_tickInterval) return;
  _tickInterval = setInterval(function() {
    if (!document.body.classList.contains('detective-active') || !timerState.running || timerState.paused) { stopDetectiveTick(); return; }
    try {
      if (!_detectiveAudio) return;
      var ctx4 = _detectiveAudio.ctx;
      var osc = ctx4.createOscillator(); osc.type='square'; osc.frequency.value=280;
      var gain = ctx4.createGain();
      gain.gain.setValueAtTime(0.05, ctx4.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx4.currentTime+0.02);
      osc.connect(gain); gain.connect(_detectiveAudio.master);
      osc.start(ctx4.currentTime); osc.stop(ctx4.currentTime+0.025);
    } catch(e) {}
  }, 1000);
}
function stopDetectiveTick() {
  if (_tickInterval) { clearInterval(_tickInterval); _tickInterval = null; }
}

// ── NPC Sofa System ───────────────────────────────────────────────────────────
var NPC_QUOTES = [
  // motivational
  "Still studying? I respect that. A lot.",
  "Your future self at CU Med thanks you. Probably.",
  "Another session down. Keep going.",
  "One Pomodoro at a time. You've got this.",
  "The OSCE won't know what hit it.",
  "Physics + Medicine dual-track? You're built different.",
  "Brain go brrr. Keep feeding it.",
  "Small sessions compound. Trust the process.",
  "You logged a session today. That already puts you ahead.",
  "Consistency beats intensity. Show up tomorrow too.",
  "Each topic you tick off is one less thing to fear on exam day.",
  "You're not just studying — you're becoming the person who passes.",
  // trolling
  "266 days left. Easy. (It's not easy. Study.)",
  "Go drink water. I'll wait. ...Still waiting.",
  "The exam doesn't care about your feelings. But I do. A little.",
  "Motivation loading... ...still loading... study in the meantime.",
  "I'm not saying you're falling behind. But also... check the schedule.",
  "Bro just study. I'll stop trolling. ...Maybe.",
  "You know who's NOT resting? Your competition. Just saying.",
  "If you quit now I'll tell the bookshelf. And it WILL judge you.",
  "Great work today! (I haven't actually been watching. But statistically.)",
  "Stop clicking me and go read a chapter. I'm serious. Sort of.",
  "You clicked me again. Really? ...Go study.",
  "I dodged. You didn't. That's a metaphor for your revision schedule.",
  "lol you thought clicking me was more productive than Anki.",
  "ok I moved. now YOU move — to your desk.",
  "Every time you click me instead of studying, a flashcard cries.",
  "Sir/Ma'am this is a study tracker not a Claude clicker.",
  "I am literally just sitting here. Why are you like this.",
  "Caught in 4K: procrastinating by clicking the NPC.",
];
var WATSON_QUOTES = [
  "Remarkable. You've maintained focus for another session. Most extraordinary.",
  "The game is afoot, and your revision schedule confirms it.",
  "I've recorded your progress in my notes. Impressive, even by your standards.",
  "A keen mind applied consistently. The evidence speaks for itself.",
  "You've tackled another subject. The case file grows ever more favourable.",
  "I observe you've been at it again. Consistency is the mark of a true detective.",
  "One does not simply pass TCAS without persistent investigation. Well done.",
  "Your dedication rivals that of any case I've witnessed. Keep at it.",
  "The data suggests you are ahead of the curve. Do not let your guard down.",
  "Every session logged is another clue solved. You're closing in.",
  "I must say, your commitment to the investigation is quite commendable.",
  "Elementary, my dear student — consistent effort leads to mastery.",
  "The game is never truly won until the exam is passed. Onward.",
  "A fine day's work. Even Holmes would be impressed with your focus.",
  "The fog may be thick outside, but your study path remains clear.",
  "Another entry in the casebook. The evidence mounts in your favour.",
  "My records show consistent improvement. Watson does not lie.",
  "You've shown remarkable deductive reasoning in your study approach.",
  "The final exam is the last piece of the puzzle. You're solving it well.",
  "I've been keeping a careful eye on your progress. You would not disappoint.",
];
var _npcHideTimer = null;

function showNpcMessage(msg) {
  var bubble = document.getElementById('npc-bubble');
  if (!bubble) return;
  bubble.style.display = 'none';
  bubble.classList.remove('show');
  var _pool = document.body.classList.contains('detective-active') ? WATSON_QUOTES : NPC_QUOTES;
  bubble.textContent = msg || _pool[Math.floor(Math.random() * _pool.length)];
  void bubble.offsetWidth;
  bubble.style.display = 'block';
  requestAnimationFrame(function() { bubble.classList.add('show'); });
  clearTimeout(_npcHideTimer);
  _npcHideTimer = setTimeout(function() {
    bubble.classList.remove('show');
    setTimeout(function() { bubble.style.display = 'none'; }, 450);
  }, 9000);
}

// ── Sofa Summoning System ─────────────────────────────────────────────────────
var SCENE_ACTIVE = false;
// ── Claude Canvas Pixel-Art System ────────────────────────────────────────────
var _claudeOutfitIdx = 0;
var _activeSitterStop = null;
var _OUTFITS = ['original','english','doctor','engineer','pilot','lawyer'];
var _CC = {
  bd:'#d97757', hi:'#e5967a', sh:'#b25f42', dk:'#2a1206',
  ht:'#1a1008', wh:'#f0ede6', cr:'#e8d8b8', nv:'#1e2848',
  yw:'#e0b830', br:'#7a4a18', gr:'#6a7080', rd:'#c02020',
  sk:'#6ab0d8', wg:'#e8e4d8', lb:'#3a3060', ac:'#c9f24d'
};

function _drawClaude(ctx, t, outfit, walkPhase) {
  var C = _CC;
  ctx.clearRect(0, 0, 16, 20);
  var blink = (Math.floor(t / 60) % 100 < 3);
  // 1px body bob at step rate while walking (row 19 is spare, so bobbing down never clips)
  var bob = (typeof walkPhase === 'number' && Math.sin(walkPhase * 2) > 0) ? 1 : 0;
  ctx.save();
  ctx.translate(0, bob);
  function px(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}

  var bc = C.bd;

  // ── HAT y=0-4 (5 clean rows above body) ─────────────────────────────
  switch(outfit) {
    case 'original':
      // Tall magician top hat: 4-row shaft + full-width brim + white hat band
      px(4,0,8,1,C.ht);         // crown top (8px)
      px(4,1,8,1,C.ht);         // shaft
      px(4,2,8,1,C.ht);         // shaft
      px(4,3,8,1,C.ht);         // shaft + overwrite with volt band below
      px(5,3,6,1,C.ac);         // volt-lime hat band (Meridian accent)
      px(1,4,14,1,C.ht); break;  // wide brim (14px = near-full width)
    case 'english':
      // British top hat in light gray, dark band
      px(4,0,8,1,C.wg);
      px(4,1,8,1,C.wg);
      px(4,2,8,1,C.wg);
      px(4,3,8,1,C.gr);          // darker gray hat band
      px(1,4,14,1,C.wg); break;  // wide brim
    case 'doctor':
      // white medic cap with red cross
      px(4,1,8,1,C.wh);
      px(3,2,10,1,C.wh);
      px(2,3,12,1,C.wh);
      px(1,4,14,1,'#d8d4cc');      // cap rim, slightly shaded
      px(7,2,2,2,C.rd); break;     // red medic mark, centered
    case 'engineer':
      px(4,2,8,1,C.yw);           // hard hat dome top
      px(2,3,12,1,C.yw);          // hat body
      px(1,4,14,1,'#c8a020'); break; // gold visor brim
    case 'pilot':
      px(5,2,6,1,C.br);           // cap top
      px(3,3,10,1,C.br);          // cap body
      px(1,4,14,1,C.br); break;   // wide visor brim
    case 'lawyer':
      // Big billowing barrister wig, tapers from narrow top to full width
      px(4,0,8,1,C.wg);
      px(2,1,12,1,C.wg);
      px(1,2,14,1,C.wg);
      px(1,3,14,1,C.wg);
      px(1,4,14,1,C.wg); break;
  }

  // ── BODY: face zone y=5-9 only ──────────────────────────────────────
  px(1, 5, 14, 5, bc);

  // ── SHIRT BASE: distinct colour per outfit, y=10-14 ──────────────────
  var sc = ({english:C.cr, doctor:C.wh, engineer:C.gr, pilot:C.cr, lawyer:'#080810'})[outfit] || C.bd;
  px(1, 10, 14, 5, sc);

  // lawyer wig sides span both zones
  if (outfit==='lawyer') {
    px(1,5,1,5,C.wg); px(14,5,1,5,C.wg);
    px(1,10,1,5,C.wg); px(14,10,1,5,C.wg);
  }

  // ── SHIRT DETAILS ────────────────────────────────────────────────────
  switch(outfit) {
    case 'original':
      break;                          // plain coral blob — like the real Claude

    case 'english':
      px(1,10,4,5,C.nv);              // left navy jacket panel over cream base
      px(11,10,4,5,C.nv);             // right navy jacket panel
      px(2,11,1,1,C.yw);              // gold button, left lapel
      px(13,11,1,1,C.yw);             // gold button, right lapel
      px(7,11,2,4,'#e02828'); break;  // red tie in cream centre, brighter

    case 'doctor':
      px(3,10,1,5,'#c8c4be');         // left coat seam
      px(12,10,1,5,'#c8c4be');        // right coat seam
      px(4,11,8,1,C.gr);              // stethoscope
      px(7,12,2,3,C.rd);              // cross vertical
      px(6,13,4,1,C.rd); break;       // cross horizontal

    case 'engineer':
      px(2,10,2,2,C.yw);              // left pocket
      px(12,10,2,2,C.yw);             // right pocket
      px(1,12,14,2,C.br);             // belt
      px(7,12,2,2,C.yw); break;       // buckle

    case 'pilot':
      px(1,10,2,5,C.br);              // left jacket side over cream
      px(13,10,2,5,C.br);             // right jacket side
      px(3,10,10,1,C.wh);             // white aviator scarf around the neck
      px(10,11,2,1,C.wh);             // scarf tail flicked to the right
      px(1,12,14,1,C.yw);             // rank stripe
      px(7,13,2,1,C.yw);              // badge
      px(4,14,8,1,C.yw); break;       // wings

    case 'lawyer':
      px(5,10,6,2,C.wh);              // white collar bands y=10-11
      px(7,12,2,3,C.wh);              // jabot centre y=12-14
      px(6,12,4,1,'#d8d4cc');         // pleat decoration
      px(6,14,4,1,'#d8d4cc'); break;  // pleat decoration
  }

  // ── ROUNDED SILHOUETTE — clip body corners so the blob reads like the real Claude
  function cl(x,y,w,h){ctx.clearRect(x,y,w,h);}
  cl(1,5,2,1);  cl(13,5,2,1);   // top corners: 2px chamfer for a dome
  cl(1,6,1,1);  cl(14,6,1,1);
  cl(1,14,1,1); cl(14,14,1,1);  // bottom corners: 1px clip

  // ── EYES — tall standing rectangle (2 wide × 3 tall, drawn last) ────
  if (!blink) {
    if (outfit==='pilot') {
      px(3,7,4,4,C.dk);  px(4,8,2,2,C.wh);   // left glasses: dark frame + white lens
      px(9,7,4,4,C.dk);  px(10,8,2,2,C.wh);  // right glasses: dark frame + white lens
    } else {
      px(4,7,2,3,C.dk); px(10,7,2,3,C.dk);
    }
  }

  // ── 4 LEGS y=15-18 ──────────────────────────────────────────────────
  if (walkPhase === 'tuck') {
    // airborne — all legs tucked up
    px(2,15,2,2,C.bd); px(5,15,2,2,C.bd); px(9,15,2,2,C.bd); px(12,15,2,2,C.bd);
  } else if (typeof walkPhase === 'number') {
    // trot gait — diagonal pairs alternate: lifted foot shortens + strides forward
    var s1 = Math.sin(walkPhase), s2 = -s1;
    var legs = [[2,s1],[5,s2],[9,s1],[12,s2]];
    for (var li = 0; li < 4; li++) {
      var sw   = legs[li][1];
      var lift = sw > 0.25 ? 1 : 0;
      var dx   = Math.round(sw * 1.2);
      px(legs[li][0] + dx, 15, 2, 4 - lift, C.bd);
    }
  } else {
    px(2,  15, 2, 4, C.bd);
    px(5,  15, 2, 4, C.bd);
    px(9,  15, 2, 4, C.bd);
    px(12, 15, 2, 4, C.bd);
  }
  ctx.restore();
}

function makeClaudeCanvas(outfit, scale) {
  var c = document.createElement('canvas');
  c.width = 16; c.height = 20;
  c.className = 'claude-sprite';
  c.style.cssText = 'width:'+(16*scale)+'px;height:'+(20*scale)+'px;image-rendering:pixelated;image-rendering:crisp-edges;display:block;';
  var ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  var raf = null, t0 = performance.now();
  c._mode = 'idle'; // 'idle' | 'walk' | 'run' | 'tuck' — drives the leg animation
  (function loop(){
    var t = performance.now() - t0;
    var wp = null;
    if (c._mode === 'walk')      wp = t * 0.012;
    else if (c._mode === 'run')  wp = t * 0.022;
    else if (c._mode === 'tuck') wp = 'tuck';
    _drawClaude(ctx, t, outfit, wp);
    raf = requestAnimationFrame(loop);
  })();
  c._stopAnim = function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } };
  return c;
}

// Pixel-art coffee cup SVG (static, no canvas needed)
var CUP_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 11 12" shape-rendering="crispEdges">'+
  '<rect x="1" y="0" width="1" height="3" fill="rgba(210,220,240,.7)"/>'+
  '<rect x="3" y="0" width="1" height="2" fill="rgba(210,220,240,.55)"/>'+
  '<rect x="5" y="0" width="1" height="3" fill="rgba(210,220,240,.65)"/>'+
  '<rect x="0" y="3" width="7" height="1" fill="#9a6530"/>'+
  '<rect x="0" y="4" width="7" height="1" fill="#2a1206"/>'+
  '<rect x="0" y="5" width="7" height="5" fill="#5e2e10"/>'+
  '<rect x="0" y="10" width="8" height="1" fill="#8a5220"/>'+
  '<rect x="7" y="5" width="1" height="1" fill="#5e2e10"/>'+
  '<rect x="8" y="6" width="1" height="3" fill="#5e2e10"/>'+
  '<rect x="7" y="9" width="1" height="1" fill="#5e2e10"/>'+
  '</svg>';

// Doctor: red apple
var APPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 7 9" shape-rendering="crispEdges">'+
  '<rect x="3" y="0" width="1" height="1" fill="#5a3010"/>'+
  '<rect x="3" y="1" width="2" height="1" fill="#30a830"/>'+
  '<rect x="2" y="2" width="3" height="1" fill="#d82020"/>'+
  '<rect x="1" y="3" width="5" height="3" fill="#d82020"/>'+
  '<rect x="2" y="6" width="3" height="1" fill="#d82020"/>'+
  '<rect x="2" y="3" width="1" height="2" fill="#f05050"/>'+
  '<rect x="1" y="5" width="5" height="1" fill="#a01818"/>'+
  '</svg>';

// Lawyer: law book (dark navy cover, gold lines, cream pages)
var BOOK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 11 12" shape-rendering="crispEdges">'+
  '<rect x="0" y="0" width="2" height="10" fill="#0d0c28"/>'+
  '<rect x="2" y="0" width="6" height="10" fill="#1a1848"/>'+
  '<rect x="8" y="1" width="2" height="8" fill="#e8d8b8"/>'+
  '<rect x="8" y="0" width="1" height="1" fill="#c8b890"/>'+
  '<rect x="8" y="9" width="1" height="1" fill="#c8b890"/>'+
  '<rect x="2" y="2" width="5" height="1" fill="#d4a020"/>'+
  '<rect x="2" y="4" width="4" height="1" fill="#d4a020"/>'+
  '<rect x="2" y="6" width="5" height="1" fill="#d4a020"/>'+
  '</svg>';

// Engineer: folded newspaper (white with dark header + text lines)
var NEWS_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 11 12" shape-rendering="crispEdges">'+
  '<rect x="0" y="0" width="11" height="10" fill="#e8e4d8"/>'+
  '<rect x="0" y="0" width="11" height="2" fill="#1a1a1a"/>'+
  '<rect x="1" y="3" width="9" height="1" fill="#2a2a2a"/>'+
  '<rect x="1" y="5" width="8" height="1" fill="#6a6a6a"/>'+
  '<rect x="1" y="7" width="6" height="1" fill="#6a6a6a"/>'+
  '<rect x="0" y="9" width="11" height="1" fill="#c0bca8"/>'+
  '</svg>';

// Magician: magic wand (dark shaft, white tip, volt-lime sparkles)
var WAND_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 11 12" shape-rendering="crispEdges">'+
  '<rect x="5" y="4" width="1" height="8" fill="#2a2018"/>'+
  '<rect x="5" y="2" width="1" height="2" fill="#f0ede6"/>'+
  '<rect x="5" y="0" width="1" height="1" fill="#c9f24d"/>'+
  '<rect x="3" y="1" width="1" height="1" fill="#c9f24d"/>'+
  '<rect x="7" y="1" width="1" height="1" fill="#c9f24d"/>'+
  '<rect x="2" y="4" width="1" height="1" fill="#c9f24d"/>'+
  '<rect x="8" y="3" width="1" height="1" fill="#c9f24d"/>'+
  '</svg>';

// English: proper teacup on a saucer (gold trim, milky tea, steam)
var TEA_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 11 12" shape-rendering="crispEdges">'+
  '<rect x="3" y="0" width="1" height="2" fill="rgba(210,220,240,.6)"/>'+
  '<rect x="5" y="1" width="1" height="2" fill="rgba(210,220,240,.5)"/>'+
  '<rect x="1" y="4" width="7" height="1" fill="#f0ede6"/>'+
  '<rect x="2" y="4" width="5" height="1" fill="#b06a20"/>'+
  '<rect x="1" y="5" width="7" height="2" fill="#f0ede6"/>'+
  '<rect x="1" y="7" width="7" height="1" fill="#d4a020"/>'+
  '<rect x="8" y="5" width="1" height="1" fill="#f0ede6"/>'+
  '<rect x="9" y="5" width="1" height="2" fill="#f0ede6"/>'+
  '<rect x="8" y="7" width="1" height="1" fill="#f0ede6"/>'+
  '<rect x="0" y="8" width="10" height="1" fill="#e8e4d8"/>'+
  '<rect x="1" y="9" width="8" height="1" fill="#c8c4b0"/>'+
  '</svg>';

// Pilot: paper plane banking right
var PLANE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" class="claude-sprite" width="22" height="24" viewBox="0 0 11 12" shape-rendering="crispEdges">'+
  '<rect x="1" y="2" width="9" height="1" fill="#f0ede6"/>'+
  '<rect x="10" y="2" width="1" height="1" fill="#ffffff"/>'+
  '<rect x="2" y="3" width="7" height="1" fill="#e8e4d8"/>'+
  '<rect x="3" y="4" width="5" height="1" fill="#d8d4c8"/>'+
  '<rect x="4" y="5" width="3" height="1" fill="#c8c4b8"/>'+
  '<rect x="5" y="6" width="2" height="1" fill="#b8b4a8"/>'+
  '<rect x="2" y="3" width="1" height="3" fill="#a8a498"/>'+
  '</svg>';

function _itemSvg(outfit) {
  if (outfit==='doctor')   return APPLE_SVG;
  if (outfit==='lawyer')   return BOOK_SVG;
  if (outfit==='engineer') return NEWS_SVG;
  if (outfit==='original') return WAND_SVG;
  if (outfit==='english')  return TEA_SVG;
  if (outfit==='pilot')    return PLANE_SVG;
  return CUP_SVG;
}

// ── Motion helpers — rAF tweens (skip straight to end state under reduced motion)
var _REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function _easeOutQuart(p){ return 1 - Math.pow(1-p, 4); }
function _easeOutBackS(p){ var c = 1.2; return 1 + (c+1)*Math.pow(p-1,3) + c*Math.pow(p-1,2); }
function _tween(dur, ease, onFrame, onDone) {
  if (_REDUCED) { onFrame(1, 1); if (onDone) onDone(); return; }
  var t0 = performance.now();
  (function step(){
    var p = Math.min(1, (performance.now() - t0) / dur);
    onFrame(ease ? ease(p) : p, p);
    if (p < 1) requestAnimationFrame(step); else if (onDone) onDone();
  })();
}

// ── FX canvas — ONE layer for every pixel-particle effect (replaces DOM particle divs)
var _fxParts = [], _fxRaf = null, _fxCanvas = null;
function _fxSpawn(x, y, o) {
  if (_REDUCED) return;
  o = o || {};
  var n    = Math.round((o.n || 12) * (_powerMode === 'min' ? 0.6 : 1));
  var cols = o.colors || ['#c9f24d','#d97757','#f2b04d','#e8e4d8'];
  for (var i = 0; i < n; i++) {
    var ang = o.up ? (-Math.PI/2 + (Math.random()-0.5)*1.6) : Math.random()*Math.PI*2;
    var spd = (o.speed || 90) * (0.35 + Math.random()*0.8);
    _fxParts.push({
      x: x + (o.spreadX ? (Math.random()-0.5)*o.spreadX : 0),
      y: y + (o.spreadY ? (Math.random()-0.5)*o.spreadY : 0),
      vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd,
      g: (o.gravity !== undefined ? o.gravity : 260),
      life: (o.life || 0.7) * (0.6 + Math.random()*0.7), age: 0,
      s: 2 + Math.random()*(o.size || 4),
      c: cols[Math.floor(Math.random()*cols.length)]
    });
  }
  if (!_fxRaf) _fxLoop();
}
function _fxLoop() {
  if (!_fxCanvas) {
    _fxCanvas = document.createElement('canvas');
    _fxCanvas.id = 'fx-canvas';
    _fxCanvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9998;';
    document.body.appendChild(_fxCanvas);
  }
  if (_fxCanvas.width !== window.innerWidth || _fxCanvas.height !== window.innerHeight) {
    _fxCanvas.width = window.innerWidth; _fxCanvas.height = window.innerHeight;
  }
  var ctx = _fxCanvas.getContext('2d');
  var last = performance.now();
  _fxRaf = requestAnimationFrame(function frame(now) {
    var dt = Math.min(0.05, (now - last)/1000); last = now;
    ctx.clearRect(0, 0, _fxCanvas.width, _fxCanvas.height);
    _fxParts = _fxParts.filter(function(p) {
      p.age += dt; if (p.age >= p.life) return false;
      p.vy += p.g*dt; p.x += p.vx*dt; p.y += p.vy*dt;
      var k = 1 - p.age/p.life;
      ctx.globalAlpha = Math.min(1, k*1.6);
      ctx.fillStyle = p.c;
      var s = Math.max(1, Math.round(p.s*k));
      ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s); // square pixels — matches the sprite
      return true;
    });
    ctx.globalAlpha = 1;
    if (_fxParts.length) { _fxRaf = requestAnimationFrame(frame); }
    else { _fxRaf = null; ctx.clearRect(0, 0, _fxCanvas.width, _fxCanvas.height); }
  });
}

function summomClaude() {
  var scene   = document.getElementById('claude-scene');
  var sofa    = document.getElementById('the-sofa');
  var table   = document.getElementById('the-table');
  var sitter  = document.getElementById('claude-sitter');
  var drinkEl = document.getElementById('table-drink');

  if (SCENE_ACTIVE) { dismissClaude(); return; }

  var badgeIcon = document.getElementById('claude-badge-icon');
  if (!badgeIcon) return;

  var _curOutfit = _OUTFITS[_claudeOutfitIdx % _OUTFITS.length];
  _claudeOutfitIdx++;

  var _entrances = ['walk','run','pop','fly'];
  var _entrance  = _entrances[Math.floor(Math.random() * _entrances.length)];

  // ① Shrink badge + drop sofa/table
  badgeIcon.style.transition = 'transform .2s ease';
  badgeIcon.style.transform  = 'scale(0)';
  sofa.classList.add('summoned');
  table.classList.add('summoned');

  // ② Build the sitter ONCE — the same canvas walks in and sits down (no swap flicker)
  var _bbl = document.getElementById('npc-bubble');
  var head = document.createElement('div');
  head.className = 'sitter-head'; head.onclick = claudeDodge; head.title = 'Click me!';
  var cv = makeClaudeCanvas(_curOutfit, 4);
  _activeSitterStop = cv._stopAnim;
  head.appendChild(cv);
  var sd = document.createElement('span');
  sd.className = 'sitter-drink'; sd.id = 'sitter-drink';
  sitter.innerHTML = '';
  sitter._dodging = false;
  sitter.style.cssText = 'opacity:0;right:86px;bottom:20px;transform:none;';
  sitter.appendChild(head);
  sitter.appendChild(sd);
  if (_bbl) sitter.appendChild(_bbl);

  function seat() {
    cv._mode = 'idle';
    badgeIcon.style.transform = '';
    head.style.transform = '';
    sitter.classList.add('seated');
    scene.classList.add('active');
    SCENE_ACTIVE = true;
    setTimeout(function(){ sitter.classList.add('idling'); }, 400);
    // Item on table
    setTimeout(function() {
      if (drinkEl) { drinkEl.innerHTML = _itemSvg(_curOutfit); drinkEl.classList.add('visible'); }
    }, 700);
    // Claude picks it up — vanishes from table, appears in hand
    setTimeout(function() {
      if (drinkEl) drinkEl.classList.remove('visible');
      var sdEl = document.getElementById('sitter-drink');
      if (sdEl) { sdEl.innerHTML = _itemSvg(_curOutfit); sdEl.classList.add('picking-up'); }
      showNpcMessage();
    }, 1500);
  }

  // Landing squash shared by the ground entrances
  function settle() {
    _tween(200, _easeOutQuart, function(e) {
      var sx = 1.12 - 0.12*e, sy = 0.86 + 0.14*e;
      head.style.transform = 'scale('+sx.toFixed(3)+','+sy.toFixed(3)+')';
    }, seat);
  }

  // ── WALK — strolls in from the right, legs actually walking ──────────────
  if (_entrance === 'walk') {
    setTimeout(function() {
      sitter.style.opacity = '1';
      cv._mode = 'walk';
      _tween(1150, _easeOutQuart, function(e, p) {
        var x   = 210 * (1 - e);
        var hop = -Math.abs(Math.sin(p * Math.PI * 4.5)) * 2 * (1 - e*0.6);
        head.style.transform = 'translate('+x.toFixed(1)+'px,'+hop.toFixed(1)+'px)';
      }, function() { cv._mode = 'idle'; settle(); });
    }, 550);

  // ── RUN — sprints in leaning forward, skids to a stop ────────────────────
  } else if (_entrance === 'run') {
    setTimeout(function() {
      sitter.style.opacity = '1';
      cv._mode = 'run';
      _tween(520, _easeOutQuart, function(e, p) {
        var x    = 240 * (1 - e);
        var hop  = -Math.abs(Math.sin(p * Math.PI * 3)) * 5 * (1 - e*0.5);
        var lean = -8 * (1 - e);
        head.style.transform = 'translate('+x.toFixed(1)+'px,'+hop.toFixed(1)+'px) rotate('+lean.toFixed(1)+'deg)';
      }, function() {
        cv._mode = 'idle';
        var r = head.getBoundingClientRect();
        _fxSpawn(r.left + r.width/2, r.bottom - 4, {n:8, up:true, speed:80, gravity:300, life:.45, size:4, spreadX:34, colors:['#8a5a30','#999','#c8a060']});
        settle();
      });
    }, 380);

  // ── POP — materialises with a pixel spark ring ────────────────────────────
  } else if (_entrance === 'pop') {
    setTimeout(function() {
      sitter.style.opacity = '1';
      var r = head.getBoundingClientRect();
      _fxSpawn(r.left + r.width/2, r.top + r.height/2, {n:18, speed:150, gravity:60, life:.6, size:5});
      _tween(460, _easeOutBackS, function(e) {
        head.style.transform = 'scale('+Math.max(0,e).toFixed(3)+') rotate('+(-14*(1-e)).toFixed(1)+'deg)';
      }, seat);
    }, 350);

  // ── FLY — swoops across the screen trailing pixel sparks ─────────────────
  } else {
    var rect  = badgeIcon.getBoundingClientRect();
    var destX = window.innerWidth  - 110;
    var destY = window.innerHeight - 70;
    var flyer = document.createElement('div');
    flyer.className = 'claude-flyer';
    var fcv = makeClaudeCanvas(_curOutfit, 5);
    flyer.appendChild(fcv);
    flyer.style.cssText = 'left:'+(rect.left+rect.width/2-40)+'px;top:'+(rect.top+rect.height/2-50)+'px;';
    document.body.appendChild(flyer);

    var TRAIL_COLORS = ['#c9f24d','#d97757','#2cb4e8','#f2b04d','#e8e4d8','#c06aff'];
    var trailTimer = setInterval(function() {
      if (!document.body.contains(flyer)) { clearInterval(trailTimer); return; }
      var fr = flyer.getBoundingClientRect();
      _fxSpawn(fr.left+fr.width/2, fr.top+fr.height/2, {n:2, colors:TRAIL_COLORS, speed:40, gravity:30, life:.5, size:5, spreadX:20, spreadY:20});
    }, 34);

    var flyStyles = [
      function(){ flyer.style.transition='all 1.1s cubic-bezier(.22,1,.36,1)'; flyer.style.transform='scale(1.8) rotate(540deg)'; },
      function(){ flyer.style.transition='all 1.15s cubic-bezier(.34,1.56,.64,1)'; flyer.style.transform='scale(1.5) rotate(-400deg) translateY(-40px)'; },
      function(){ flyer.style.transition='all .98s cubic-bezier(.55,0,.1,1)'; flyer.style.transform='scale(2.1) rotate(180deg)'; },
    ];
    setTimeout(function() {
      flyer.style.filter = 'drop-shadow(0 0 14px rgba(218,119,86,1)) drop-shadow(0 0 32px rgba(218,100,50,.8))';
      flyer.style.left   = (destX-40)+'px';
      flyer.style.top    = (destY-50)+'px';
      flyStyles[Math.floor(Math.random()*flyStyles.length)]();
    }, 60);

    setTimeout(function() {
      clearInterval(trailTimer);
      fcv._stopAnim();
      if (flyer.parentNode) flyer.remove();
      // Pixel burst instead of emoji confetti
      _fxSpawn(destX, destY, {n:26, colors:TRAIL_COLORS, speed:190, gravity:120, life:.8, size:5});
      var fl = document.createElement('div'); fl.className = 'snap-flash';
      fl.style.cssText = 'left:'+(destX-36)+'px;top:'+(destY-36)+'px;';
      document.body.appendChild(fl);
      setTimeout(function(){ if (fl.parentNode) fl.remove(); }, 680);

      sitter.style.opacity = '1';
      sitter.classList.add('conjuring');
      setTimeout(function() {
        sitter.classList.remove('conjuring');
        seat();
      }, 900);
    }, 1400);
  }
}

function spawnSofaDust(el) {
  var rect = el.getBoundingClientRect();
  _fxSpawn(rect.left + rect.width/2, rect.top + rect.height*0.55, {
    n:38, up:true, speed:170, gravity:320, life:.8, size:5,
    spreadX:rect.width, spreadY:rect.height*0.6,
    colors:['#d82020','#f04040','#a01010','#e83030','#c8a060','#8a5a30','#999','#555']
  });
}

function dismissClaude() {
  var scene     = document.getElementById('claude-scene');
  var sofa      = document.getElementById('the-sofa');
  var table     = document.getElementById('the-table');
  var sitter    = document.getElementById('claude-sitter');
  var drinkEl   = document.getElementById('table-drink');
  var bubble    = document.getElementById('npc-bubble');
  var badgeIcon = document.getElementById('claude-badge-icon');

  SCENE_ACTIVE = false;
  if (bubble) bubble.classList.remove('show');
  if (_activeSitterStop) { _activeSitterStop(); _activeSitterStop = null; }
  sitter.classList.remove('idling');

  // ① Claude snaps his fingers
  sitter.classList.add('claude-snapping');

  // ② Snap flash at Claude's hand + sofa crumbles into dust
  setTimeout(function() {
    var sr = sitter.getBoundingClientRect();
    var fl = document.createElement('div');
    fl.className = 'snap-flash';
    fl.style.cssText = 'left:'+(sr.right - 22)+'px;top:'+(sr.bottom - 26)+'px;';
    document.body.appendChild(fl);
    setTimeout(function(){ if(fl.parentNode) fl.remove(); }, 680);

    if (drinkEl) drinkEl.classList.remove('visible');
    spawnSofaDust(sofa);
    spawnSofaDust(table);

    sofa.style.transition  = 'opacity .28s ease, transform .28s ease';
    sofa.style.opacity     = '0';
    sofa.style.transform   = 'scale(0.9)';
    table.style.transition = 'opacity .22s ease, transform .22s ease';
    table.style.opacity    = '0';
    table.style.transform  = 'scale(0.9)';
  }, 380);

  // ③ Claude walks away sadly after the snap — real gait, fading out
  setTimeout(function() {
    sitter.classList.remove('claude-snapping');
    sitter.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,.5))';
    var head = sitter.querySelector('.sitter-head');
    var cv   = head && head.querySelector('canvas');
    if (cv) cv._mode = 'walk';
    if (head) {
      _tween(1900, null, function(e, p) {
        var hop = -Math.abs(Math.sin(p * Math.PI * 7)) * 2;
        head.style.transform = 'translate('+(-175*p).toFixed(1)+'px,'+hop.toFixed(1)+'px) scaleX(-1)';
        head.style.opacity   = String(Math.max(0, 1 - p*p*1.1));
      });
    }
  }, 520);

  // ④ Full cleanup
  setTimeout(function() {
    sitter.classList.remove('seated','idling','claude-snapping');
    sitter.innerHTML = '';
    sitter._dodging = false;
    sitter.style.cssText = '';
    if (bubble) sitter.appendChild(bubble);

    sofa.style.transition = ''; sofa.style.opacity = ''; sofa.style.transform = '';
    sofa.classList.remove('summoned');
    table.style.transition = ''; table.style.opacity = ''; table.style.transform = '';
    table.classList.remove('summoned');
    if (drinkEl) drinkEl.classList.remove('visible');

    scene.classList.remove('active');

    if (badgeIcon) {
      badgeIcon.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)';
      badgeIcon.style.transform  = 'scale(0)';
      setTimeout(function() {
        badgeIcon.style.transform = 'scale(1)';
        setTimeout(function(){ badgeIcon.style.transition = ''; badgeIcon.style.transform = ''; }, 500);
      }, 30);
    }
  }, 2700);
}

function claudeDodge() {
  var sitter = document.getElementById('claude-sitter');
  var bubble = document.getElementById('npc-bubble');
  if (!sitter || !SCENE_ACTIVE || sitter._dodging) return;
  var head = sitter.querySelector('.sitter-head');
  var cv   = head && head.querySelector('canvas');
  if (!head) return;
  sitter._dodging = true;

  if (bubble) bubble.classList.remove('show');

  // Pick a new sofa position different from current
  var SPOTS = [58, 74, 92, 110];
  var cur = parseInt(sitter.style.right) || 86;
  var choices = SPOTS.filter(function(p){ return Math.abs(p - cur) > 12; });
  if (!choices.length) choices = SPOTS;
  var newRight = choices[Math.floor(Math.random() * choices.length)];
  var dx = cur - newRight; // translate offset until we commit the new right

  sitter.classList.remove('idling');

  // ① anticipation crouch
  _tween(90, _easeOutQuart, function(e) {
    head.style.transform = 'scale('+(1+0.10*e).toFixed(3)+','+(1-0.16*e).toFixed(3)+')';
  }, function() {
    // ② airborne hop — legs tucked, stretching through the arc
    if (cv) cv._mode = 'tuck';
    _tween(400, null, function(e, p) {
      var y  = -34 * Math.sin(Math.PI * p);
      var x  = dx * (p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2); // easeInOutQuad
      var st = 1 + 0.12 * Math.sin(Math.PI * p);
      head.style.transform = 'translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+(2-st).toFixed(3)+','+st.toFixed(3)+')';
    }, function() {
      // commit position in the same frame the translate is dropped — no visual jump
      sitter.style.right = newRight + 'px';
      head.style.transform = 'scale(1.14,0.84)';
      if (cv) cv._mode = 'idle';
      var r = head.getBoundingClientRect();
      _fxSpawn(r.left + r.width/2, r.bottom - 4, {n:10, up:true, speed:90, gravity:300, life:.5, size:4, spreadX:30, colors:['#d82020','#8a5a30','#999','#c8a060']});
      // ③ landing squash → settle back to idle
      _tween(200, _easeOutQuart, function(e) {
        head.style.transform = 'scale('+(1.14-0.14*e).toFixed(3)+','+(0.84+0.16*e).toFixed(3)+')';
      }, function() {
        head.style.transform = '';
        sitter._dodging = false;
        sitter.classList.add('idling');
        showNpcMessage();
      });
    });
  });
}

function initNPC() {
  // Pulse badge icon after 25s as a hint it's clickable
  setTimeout(function() {
    var icon = document.getElementById('claude-badge-icon');
    if (icon && !SCENE_ACTIVE) {
      icon.style.animation = 'claude-glow 0.5s ease 4';
      setTimeout(function(){ if(icon) icon.style.animation = ''; }, 2500);
    }
  }, 25000);
  // Every 30 minutes if seated, send a new quote + sip
  setInterval(function() {
    if (SCENE_ACTIVE) {
      var sd = document.getElementById('sitter-drink');
      if (sd) { sd.classList.remove('picking-up'); void sd.offsetWidth; sd.classList.add('picking-up'); }
      showNpcMessage();
    }
  }, 1800000);
}
