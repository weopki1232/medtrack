// ── Flashcard Mode ─────────────────────────────────────────────────────────────
function startVaultFlash() {
  var formulas = Storage.getFormulas();
  if (formulas.length === 0) { toast(t('no_formulas'), 'warning'); return; }
  // Shuffle
  vaultFlashList = formulas.slice().sort(function(){return Math.random()-.5;});
  vaultFlashIdx = 0;
  vaultRevealed = new Set();
  vaultFlashMode = true;
  renderVault();
}

function flashNext() {
  vaultFlashIdx = (vaultFlashIdx + 1) % vaultFlashList.length;
  vaultRevealed = new Set();
  renderVault();
}

function flashRate(rating) {
  if (rating === 'hard') {
    // Push current card to a later position
    var cur = vaultFlashList.splice(vaultFlashIdx, 1)[0];
    var insertAt = Math.min(vaultFlashList.length, vaultFlashIdx + 3);
    vaultFlashList.splice(insertAt, 0, cur);
  } else {
    // 'know' — remove from deck
    vaultFlashList.splice(vaultFlashIdx, 1);
    if (vaultFlashList.length === 0) {
      vaultFlashMode = false; vaultFlashIdx = 0;
      toast('🎉 All cards done! Great work.', 'success');
      renderVault(); return;
    }
  }
  if (vaultFlashIdx >= vaultFlashList.length) vaultFlashIdx = 0;
  vaultRevealed = new Set();
  renderVault();
}

