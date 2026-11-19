// Leonida — GTA VI trophy guide & tracker.
// All 55 trophies come from data/trophies.json (official names, descriptions and
// grades as published on PlayStation Network; guides written for this entry, each
// citing its sources). The roadmap comes from data/roadmap.json.
// Progress is saved in this browser only (localStorage) and can be exported to a
// file and imported back. No network request is made at run time.
const KEY = 'leonida-gta6-trophy-progress-v1';
const DEMO_EARNED = [2, 3, 15, 21, 28, 35];

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robberies',
  side: 'Side quests',
  platinum: 'Platinum',
};
const STAGE_NAMES = { 1: 'Stage 1 — Story first', 2: 'Stage 2 — 100% checklist', 3: 'Stage 3 — Strangers & cleanup' };

const params = new URLSearchParams(location.search);
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
if (params.get('demo') === '1' && !localStorage.getItem(KEY)) earned = new Set(DEMO_EARNED);

const doc = await (await fetch('data/trophies.json')).json();
const road = await (await fetch('data/roadmap.json')).json();
const trophies = doc.trophies;

let kindFilter = params.get('kind') || 'all';
let gradeFilter = 'all';
let query = '';
let spoilerOn = params.get('spoiler') === 'on';
const openIds = new Set();
if (params.get('trophy')) openIds.add(Number(params.get('trophy')));
if (params.get('open')) openIds.add(Number(params.get('open')));

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function firstSentence(text) {
  // The collapsed preview shows the start of the guide. One-word openers like
  // "Automatic." carry nothing on their own, so when the first sentence is
  // short, include the next one too.
  const first = text.indexOf('. ');
  if (first === -1) return text;
  if (first < 100) {
    const second = text.indexOf('. ', first + 2);
    return second === -1 ? text : text.slice(0, second + 1);
  }
  return text.slice(0, first + 1);
}

function isHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.id);
}

function renderFacts() {
  const c = doc.counts;
  const facts = [
    `<b>${c.total}</b> trophies`,
    `<b>${c.platinum}</b> platinum`,
    `<b>${c.gold}</b> gold`,
    `<b>${c.silver}</b> silver`,
    `<b>${c.bronze}</b> bronze`,
    `<b>${c.online}</b> online`,
    `~<b>${c.platinumHours}</b> to platinum`,
    `Difficulty <b>${c.difficulty}</b>`,
  ];
  $('facts').innerHTML = facts.map((f) => `<span>${f}</span>`).join('');
}

function renderRoadmap() {
  $('stages').replaceChildren(...road.stages.map((s) => {
    const card = document.createElement('article');
    card.className = 'stage-card';
    const h = document.createElement('h3');
    h.textContent = `Stage ${s.stage} — ${s.name}`;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = s.hours;
    const sum = document.createElement('p');
    sum.textContent = s.summary;
    const ul = document.createElement('ul');
    for (const item of s.items) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.append(li);
    }
    card.append(h, hours, sum, ul);
    return card;
  }));
  $('checklistNote').textContent = road.checklist_note;
  $('warnings').replaceChildren(...road.warnings.map((w) => {
    const li = document.createElement('li');
    li.textContent = w;
    return li;
  }));
}

function renderKinds() {
  const kinds = ['all', ...new Set(trophies.map((t) => t.kind))];
  $('kinds').replaceChildren(...kinds.map((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = k === 'all' ? 'All' : KIND_LABELS[k];
    b.setAttribute('aria-pressed', String(kindFilter === k));
    b.addEventListener('click', () => {
      kindFilter = k;
      renderKinds();
      renderCards();
    });
    return b;
  }));
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  $('progressText').textContent = `${n} of ${total} earned — ${Math.round((n / total) * 100)}% to the platinum`;
  $('progressFill').style.width = `${(n / total) * 100}%`;
}

function cardFor(t) {
  const hidden = isHidden(t);
  const article = document.createElement('article');
  article.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  article.dataset.id = String(t.id);

  const tick = document.createElement('label');
  tick.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderProgress();
    renderCards();
  });
  tick.append(box);

  const body = document.createElement('div');
  body.className = 'card-body';

  const head = document.createElement('div');
  head.className = 'card-head';
  const name = document.createElement('h3');
  name.textContent = hidden ? 'Hidden story trophy' : t.name;
  const grade = document.createElement('span');
  grade.className = `grade ${t.grade}`;
  grade.textContent = t.grade;
  head.append(name, grade);
  const kind = document.createElement('span');
  kind.className = 'kind-chip';
  kind.textContent = KIND_LABELS[t.kind];
  head.append(kind);
  if (t.missable) {
    const miss = document.createElement('span');
    miss.className = 'miss-badge';
    miss.textContent = 'MISSABLE';
    head.append(miss);
  }

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden
    ? 'Story trophy — earn it in game to reveal its name and description.'
    : t.description;

  const preview = document.createElement('p');
  preview.className = 'preview';
  if (!hidden) preview.textContent = firstSentence(t.guide);

  const detail = document.createElement('div');
  detail.className = 'detail';
  if (!hidden && openIds.has(t.id)) {
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.textContent = 'Sources: ';
    t.sources.forEach((s, i) => {
      if (i > 0) sources.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      sources.append(a);
    });
    const stage = document.createElement('p');
    stage.className = 'stage-line';
    stage.textContent = `Roadmap: ${STAGE_NAMES[t.stage]}`;
    detail.append(guide, sources, stage);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'toggle';
  if (hidden) {
    toggle.textContent = 'Earn it to reveal the guide';
    toggle.disabled = true;
  } else {
    toggle.textContent = openIds.has(t.id) ? 'Hide guide' : 'Guide + sources';
    toggle.addEventListener('click', () => {
      if (openIds.has(t.id)) openIds.delete(t.id);
      else openIds.add(t.id);
      renderCards();
    });
  }

  body.append(head, desc);
  if (!hidden) body.append(preview);
  body.append(detail, toggle);
  article.append(tick, body);
  return article;
}

function renderCards() {
  const q = query.trim().toLowerCase();
  const list = trophies.filter((t) => {
    if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABELS[t.kind]}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  $('cards').replaceChildren(...list.map(cardFor));
  $('empty').hidden = list.length > 0;
}

$('search').addEventListener('input', (e) => {
  query = e.target.value;
  renderCards();
});
$('grade').addEventListener('change', (e) => {
  gradeFilter = e.target.value;
  renderCards();
});
$('spoiler').checked = spoilerOn;
$('spoiler').addEventListener('change', (e) => {
  spoilerOn = e.target.checked;
  renderCards();
});
$('export').addEventListener('click', () => {
  const payload = { version: 1, earned: [...earned].sort((a, b) => a - b), exported: new Date().toISOString() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(Number(id))).map(Number));
    save();
    renderProgress();
    renderCards();
  } catch {
    alert('That file is not a valid Leonida progress export.');
  }
  e.target.value = '';
});
$('showMissable').addEventListener('click', () => {
  kindFilter = 'missable';
  query = '';
  $('search').value = '';
  openIds.add(28);
  renderKinds();
  renderCards();
  document.querySelector('[data-id="28"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

renderFacts();
renderRoadmap();
renderKinds();
renderProgress();
renderCards();

if (params.get('trophy')) {
  document.querySelector(`[data-id="${params.get('trophy')}"]`)?.scrollIntoView({ block: 'center' });
} else if (location.hash) {
  // Scroll after the first render, so the target sits where it belongs even
  // though the roadmap and cards above it are rendered by JavaScript.
  document.querySelector(location.hash)?.scrollIntoView();
}
