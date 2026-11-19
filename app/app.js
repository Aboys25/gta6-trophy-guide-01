// Leonida Legend — GTA VI trophy guide and tracker.
// Loads the official trophy list and the roadmap from local JSON files only,
// keeps earned trophies in localStorage, and never makes a network request.
const STORAGE_KEY = 'leonida-legend-earned-v1';
const SPOILER_KEY = 'leonida-legend-spoiler-v1';

const trophyList = document.getElementById('trophyList');
const emptyNote = document.getElementById('emptyNote');
const countLine = document.getElementById('countLine');
const statusLine = document.getElementById('statusLine');
const searchInput = document.getElementById('search');
const kindSelect = document.getElementById('kind');
const gradeSelect = document.getElementById('grade');
const missableOnlyBox = document.getElementById('missableOnly');
const hideEarnedBox = document.getElementById('hideEarned');
const spoilerBox = document.getElementById('spoiler');

let earned = new Set(readStoredNames(STORAGE_KEY));
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';
spoilerBox.checked = spoilerOn;

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;

function readStoredNames(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function kindLabel(kind) {
  return { story: 'Story', stranger: 'Strangers', collectible: 'Collectibles', activity: 'Activities', robbery: 'Robbery', exploration: 'Exploration', cleanup: 'Cleanup' }[kind] ?? kind;
}

function renderRoadmap() {
  document.getElementById('roadmapTitle').textContent = roadmapDoc.title;
  document.getElementById('roadmapSubtitle').textContent = roadmapDoc.subtitle;
  document.getElementById('missableTitle').textContent = roadmapDoc.missable.title;
  document.getElementById('missableBody').textContent = roadmapDoc.missable.body;
  document.getElementById('missableSource').textContent = 'Source: ' + roadmapDoc.missable.source + '.';
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const stage of roadmapDoc.stages) {
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    const body = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = stage.title;
    const detail = document.createElement('p');
    detail.textContent = stage.detail;
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = stage.warning;
    body.append(title, detail, warn);
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = stage.trophies + (stage.trophies === 1 ? ' trophy' : ' trophies');
    li.append(num, body, count);
    list.append(li);
  }
  const rules = document.getElementById('rulesList');
  rules.replaceChildren();
  for (const rule of roadmapDoc.rules) {
    const li = document.createElement('li');
    li.textContent = rule;
    rules.append(li);
  }
  document.getElementById('rulesSource').textContent = 'Source: ' + roadmapDoc.rulesSource + '.';
  const sources = document.getElementById('sourcesList');
  sources.replaceChildren();
  for (const source of trophiesDoc.sources) {
    const li = document.createElement('li');
    li.textContent = source;
    sources.append(li);
  }
}

function trophyIsHiddenFromSpoilers(trophy) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

function matchesFilters(trophy) {
  const query = searchInput.value.trim().toLowerCase();
  if (query && !(trophy.name.toLowerCase().includes(query) || trophy.description.toLowerCase().includes(query))) return false;
  if (kindSelect.value !== 'all' && trophy.kind !== kindSelect.value) return false;
  if (gradeSelect.value !== 'all' && trophy.grade !== gradeSelect.value) return false;
  if (missableOnlyBox.checked && !trophy.missable) return false;
  if (hideEarnedBox.checked && earned.has(trophy.name)) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('progressText').textContent = done + ' of ' + total + ' earned';
  document.getElementById('progressPct').textContent = Math.round((done / total) * 100) + '%';
  document.getElementById('progressFill').style.width = (done / total) * 100 + '%';
  document.getElementById('stickyProgress').textContent = done + ' of ' + total + ' earned · Platinum ' + (earned.has('Vice Got a Price!') ? 'earned' : 'not yet');
  document.getElementById('stickyFill').style.width = (done / total) * 100 + '%';
  const byGrade = {};
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earned.has(t.name)).length;
    byGrade[grade] = got + '/' + inGrade.length;
  }
  document.getElementById('progressGrades').textContent =
    'Platinum ' + byGrade.platinum + ' · Gold ' + byGrade.gold + ' · Silver ' + byGrade.silver + ' · Bronze ' + byGrade.bronze +
    ' · ' + trophies.filter((t) => t.hidden).length + ' hidden · 1 missable';
}

function renderTrophies() {
  const visible = trophies.filter(matchesFilters);
  trophyList.replaceChildren();
  for (const trophy of visible) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '');
    li.id = 't' + trophy.id;
    const row = document.createElement('div');
    row.className = 'trophy-row';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', 'Earned: ' + trophy.name);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderTrophies();
    });
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    if (trophyIsHiddenFromSpoilers(trophy)) {
      name.textContent = 'Hidden story trophy — earn it to reveal';
      name.classList.add('spoiler-mask');
      desc.textContent = 'Spoiler-safe mode hides this story trophy until you earn it. Untick the spoiler setting above to see it.';
      desc.classList.add('spoiler-mask');
    } else {
      name.textContent = trophy.name;
      desc.textContent = trophy.description;
    }
    const tags = document.createElement('div');
    tags.className = 'tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = 'tag ' + trophy.grade;
    gradeTag.textContent = trophy.grade;
    tags.append(gradeTag);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = kindLabel(trophy.kind);
    tags.append(kindTag);
    if (trophy.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden';
      hiddenTag.textContent = 'Hidden';
      tags.append(hiddenTag);
    }
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'Missable';
      tags.append(missTag);
    }
    if (trophy.count !== null && trophy.count !== undefined) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = 'Count: ' + trophy.count.toLocaleString('en-US');
      tags.append(countTag);
    }
    head.append(name, desc, tags);
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = 'Show guide + sources';
    const guideBody = document.createElement('div');
    guideBody.className = 'guide-body';
    guideBody.hidden = true;
    const guideText = document.createElement('p');
    guideText.textContent = trophy.guide;
    const guideSource = document.createElement('p');
    guideSource.className = 'source';
    guideSource.textContent = 'Source: ' + trophy.sources.join('; ') + '.';
    guideBody.append(guideText, guideSource);
    toggle.addEventListener('click', () => {
      guideBody.hidden = !guideBody.hidden;
      toggle.textContent = guideBody.hidden ? 'Show guide + sources' : 'Hide guide';
    });
    head.append(toggle, guideBody);
    row.append(box, head);
    li.append(row);
    trophyList.append(li);
  }
  emptyNote.hidden = visible.length !== 0;
  countLine.textContent = 'Showing ' + visible.length + ' of ' + trophies.length + ' trophies' +
    (earned.size ? ' · ' + earned.size + ' earned' : '') + '.';
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  statusLine.textContent = 'Progress exported (' + earned.size + ' earned).';
}

async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveEarned();
    renderProgress();
    renderTrophies();
    statusLine.textContent = 'Progress imported (' + earned.size + ' earned).';
  } catch {
    statusLine.textContent = 'Import failed: that file is not a Leonida Legend progress export.';
  }
}

document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => importProgress(event.target.files[0]));
document.getElementById('resetBtn').addEventListener('click', () => {
  earned = new Set();
  saveEarned();
  renderProgress();
  renderTrophies();
  statusLine.textContent = 'Progress reset.';
});
for (const control of [searchInput, kindSelect, gradeSelect, missableOnlyBox, hideEarnedBox]) {
  control.addEventListener('input', renderTrophies);
  control.addEventListener('change', renderTrophies);
}
spoilerBox.addEventListener('change', () => {
  spoilerOn = spoilerBox.checked;
  saveSpoiler();
  renderTrophies();
});

renderRoadmap();
renderProgress();
renderTrophies();

// Deep link: #t<id> opens that trophy's guide, e.g. #t28 for Positive Mental Attitude.
const match = window.location.hash.match(/^#t(\d+)$/);
if (match) {
  const target = document.getElementById('t' + match[1]);
  if (target) {
    const toggle = target.querySelector('.guide-toggle');
    const body = target.querySelector('.guide-body');
    if (toggle && body) {
      body.hidden = false;
      toggle.textContent = 'Hide guide';
    }
    target.scrollIntoView({ block: 'center' });
  }
}
