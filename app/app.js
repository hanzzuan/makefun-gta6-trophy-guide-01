// VICE — GTA VI trophy guide and tracker.
// Loads the trophy list and the roadmap, renders the checklist, and saves
// progress in the browser. Everything is local: no network request at run time.
const STORE_KEY = 'vice-gta6-trophy-progress-v1';
const SPOILER_KEY = 'vice-gta6-spoiler-v1';

const cardsEl = document.getElementById('cards');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const kindsEl = document.getElementById('kinds');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const earnedOnlyEl = document.getElementById('earnedOnly');

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'));
let kindFilter = 'all';
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';
spoilerEl.checked = spoilerOn;

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function renderRoadmap() {
  document.getElementById('roadmapTitle').textContent = roadmapDoc.title;
  document.getElementById('roadmapMeta').textContent =
    `${roadmapDoc.hours} · difficulty ${roadmapDoc.difficulty} · ${roadmapDoc.note}`;
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const s of roadmapDoc.stages) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${s.stage} — ${s.name}`;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = s.hours;
    const text = document.createElement('p');
    text.textContent = s.text;
    const count = document.createElement('p');
    count.className = 'count';
    const done = s.trophy_ids.filter((id) => earned.has(id)).length;
    count.textContent = `${done} of ${s.trophies} earned in this stage`;
    div.append(h, hours, text, count);
    stagesEl.append(div);
  }
}

function trophyVisible(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindFilter === 'missable') {
    if (!t.missable) return false;
  } else if (kindFilter !== 'all' && t.kind !== kindFilter) {
    return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
  return true;
}

function renderCards() {
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!trophyVisible(t)) continue;
    shown++;
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
    card.id = `trophy-${t.id}`;

    const title = document.createElement('h3');
    const desc = document.createElement('p');
    desc.className = 'desc';
    const spoil = spoilerOn && t.kind === 'story' && !earned.has(t.id);
    if (spoil) {
      title.textContent = 'Hidden story trophy';
      desc.textContent = 'Hidden on PlayStation until earned — earn it to reveal the name and description.';
    } else {
      title.textContent = t.name;
      desc.textContent = t.description;
    }

    const meta = document.createElement('p');
    meta.className = 'meta';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `badge ${t.grade}`;
    gradeBadge.textContent = gradeLabel(t.grade);
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge';
    kindBadge.textContent = t.kind;
    meta.append(gradeBadge, kindBadge);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge missable';
      m.textContent = 'Missable';
      meta.append(m);
    }
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'badge hidden';
      h.textContent = 'Hidden';
      meta.append(h);
    }
    const stageBadge = document.createElement('span');
    stageBadge.className = 'badge';
    stageBadge.textContent = `Stage ${t.stage}`;
    meta.append(stageBadge);

    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;

    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = 'Sources: ' + t.sources.join(' · ');

    const earn = document.createElement('label');
    earn.className = 'earn';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      persist();
      renderAll();
    });
    earn.append(box, document.createTextNode(earned.has(t.id) ? 'Earned' : 'Mark earned'));

    card.append(title, desc, meta, guide, src, earn);
    cardsEl.append(card);
  }
  emptyEl.hidden = shown > 0;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressRing').style.background =
    `conic-gradient(var(--accent) ${pct * 3.6}deg, var(--line) 0deg)`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${gradeLabel(g)} ${got}/${all}`;
  });
  document.getElementById('gradeCounts').textContent = counts.join(' · ');
}

function renderKinds() {
  kindsEl.replaceChildren();
  const kinds = [
    ['all', 'All'],
    ['story', 'Story'],
    ['collectibles', 'Collectibles'],
    ['activities', 'Activities'],
    ['missable', 'Missable'],
  ];
  for (const [value, label] of kinds) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (kindFilter === value) b.classList.add('active');
    b.addEventListener('click', () => {
      kindFilter = value;
      renderKinds();
      renderCards();
    });
    kindsEl.append(b);
  }
}

function renderAll() {
  renderRoadmap();
  renderCards();
  renderProgress();
}

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vice-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    persist();
    renderAll();
  } catch {
    alert('That file is not a VICE progress export.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    persist();
    renderAll();
  }
});
document.getElementById('showMissable').addEventListener('click', () => {
  kindFilter = 'missable';
  searchEl.value = '';
  gradeEl.value = 'all';
  earnedOnlyEl.checked = false;
  renderKinds();
  renderAll();
  document.getElementById('trophy-28')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
searchEl.addEventListener('input', renderCards);
gradeEl.addEventListener('change', renderCards);
earnedOnlyEl.addEventListener('change', renderCards);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  persist();
  renderCards();
});

renderKinds();
renderAll();
