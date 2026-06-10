# Mechanical splitter: medtrack.html -> index.html + css/ + js/
# Every line of the original goes to exactly one output file, in original order.
$ErrorActionPreference = 'Stop'
$root = 'C:\Users\weopk\Downloads\medtrack-app'
$src = Get-Content "$root\medtrack.html" -Encoding UTF8

# (file, startLine, endLine) 1-based inclusive
$manifest = @(
  @('css/styles.css',                 14, 1149),
  @('js/data/exam-data.js',         1366, 1394),
  @('js/data/subjects.js',          1395, 1483),
  @('js/data/strings.js',           1484, 1909),
  @('js/core/i18n.js',              1910, 1952),
  @('js/core/storage.js',           1953, 2065),
  @('js/core/state.js',             2066, 2076),
  @('js/data/achievements-data.js', 2077, 2092),
  @('js/core/helpers.js',           2093, 2120),
  @('js/core/router.js',            2121, 2146),
  @('js/pages/schedule.js',         2147, 2541),
  @('js/pages/dashboard.js',        2542, 2834),
  @('js/pages/timer.js',            2835, 3049),
  @('js/pages/subjects.js',         3050, 3145),
  @('js/pages/analytics.js',        3146, 3297),
  @('js/pages/tasks.js',            3298, 3357),
  @('js/pages/diagrams.js',         3358, 3629),
  @('js/pages/settings.js',         3630, 3725),
  @('js/pages/insights.js',         3726, 3891),
  @('js/pages/journey.js',          3892, 3992),
  @('js/pages/vault.js',            3993, 4189),
  @('js/features/focus-mode.js',    4190, 4404),
  @('js/features/achievements.js',  4405, 4583),
  @('js/features/notes-mistakes.js',4584, 4691),
  @('js/features/flashcards.js',    4692, 4729),
  @('js/features/media-notify.js',  4730, 4861),
  @('js/app.js',                    4862, 4983),
  @('js/features/ambient-effects.js',4984, 6264),
  @('js/boot.js',                   6265, 6266)
)

$utf8 = New-Object System.Text.UTF8Encoding $false
foreach ($m in $manifest) {
  $path = Join-Path $root ($m[0] -replace '/', '\')
  New-Item -ItemType Directory -Force (Split-Path $path) | Out-Null
  $body = ($src[($m[1]-1)..($m[2]-1)] -join "`n") + "`n"
  [IO.File]::WriteAllText($path, $body, $utf8)
}

# Assemble index.html
$out = New-Object System.Collections.Generic.List[string]
$out.AddRange([string[]]$src[0..11])                       # lines 1-12 head
$out.Add('<link rel="stylesheet" href="css/styles.css">')
$out.Add($src[1150])                                       # line 1151 </head>
$out.AddRange([string[]]$src[1151..1363])                  # lines 1152-1364 body markup
foreach ($m in $manifest) {
  if ($m[0] -like 'js/*') { $out.Add(('<script src="{0}"></script>' -f $m[0])) }
}
$out.Add($src[6267])                                       # line 6268 JSON data island
$out.AddRange([string[]]$src[6268..6269])                  # </body></html>
[IO.File]::WriteAllText("$root\index.html", (($out -join "`n") + "`n"), $utf8)

# Integrity check: concatenated JS modules must equal original script body exactly
$origJs = ($src[1365..6265] -join "`n") + "`n"
$rebuilt = ''
foreach ($m in $manifest) {
  if ($m[0] -like 'js/*') { $rebuilt += [IO.File]::ReadAllText((Join-Path $root ($m[0] -replace '/','\'))) }
}
$origCss = ($src[13..1148] -join "`n") + "`n"
$cssFile = [IO.File]::ReadAllText("$root\css\styles.css")
"JS  identical: " + ($rebuilt -ceq $origJs)
"CSS identical: " + ($cssFile -ceq $origCss)
"JS files: " + ($manifest | Where-Object { $_[0] -like 'js/*' }).Count
"index.html lines: " + (Get-Content "$root\index.html").Count
