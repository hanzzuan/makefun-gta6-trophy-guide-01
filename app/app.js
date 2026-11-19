// Leonida — GTA VI trophy guide & tracker.
// Plain script (no modules, no network): reads the two local JSON files,
// keeps the earned set in localStorage, and renders the roadmap + list.
(function () {
  "use strict";

  var STORE_KEY = "leonida-earned-v1";
  var listEl = document.getElementById("trophy-list");
  var emptyEl = document.getElementById("empty-state");
  var countEl = document.getElementById("result-count");

  var trophies = [];
  var roadmap = null;
  var earned = new Set(loadStored());

  var searchEl = document.getElementById("search");
  var kindEl = document.getElementById("kind-filter");
  var gradeEl = document.getElementById("grade-filter");
  var stageEl = document.getElementById("stage-filter");
  var spoilerEl = document.getElementById("spoiler-toggle");
  var earnedOnlyEl = document.getElementById("earned-only");

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(earned).sort(function (a, b) { return a - b; })));
    } catch (e) { /* storage full or blocked — the list still works in memory */ }
  }

  function gradeLabel(g) {
    return g.charAt(0).toUpperCase() + g.slice(1);
  }

  function kindLabel(k) {
    return k.charAt(0).toUpperCase() + k.slice(1);
  }

  function stageLabel(s) {
    return s === 1 ? "Stage 1 — Story" : s === 2 ? "Stage 2 — Cleanup" : "Stage 3 — Mop-up";
  }

  function fillSelect(select, values, allLabel, labelFn) {
    select.innerHTML = "";
    var all = document.createElement("option");
    all.value = "all";
    all.textContent = allLabel;
    select.appendChild(all);
    values.forEach(function (v) {
      var opt = document.createElement("option");
      opt.value = String(v);
      opt.textContent = labelFn(v);
      select.appendChild(opt);
    });
  }

  function renderProgress() {
    var total = trophies.length;
    var done = trophies.filter(function (t) { return earned.has(t.id); }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("earned-count").textContent = String(done);
    document.getElementById("total-count").textContent = String(total);
    document.getElementById("progress-pct").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-ring").style.background =
      "conic-gradient(#ffd166 " + (pct * 3.6) + "deg, rgba(255,255,255,0.18) 0deg)";
    var grades = ["platinum", "gold", "silver", "bronze"];
    document.getElementById("grade-counts").textContent = grades.map(function (g) {
      var n = trophies.filter(function (t) { return t.grade === g && earned.has(t.id); }).length;
      var tot = trophies.filter(function (t) { return t.grade === g; }).length;
      return gradeLabel(g) + " " + n + "/" + tot;
    }).join(" · ");
  }

  function renderRoadmap() {
    if (!roadmap) return;
    document.getElementById("roadmap-overview").textContent = roadmap.overview || "";
    document.getElementById("missable-warning").textContent = roadmap.missable_warning || "";
    var grid = document.getElementById("stage-grid");
    grid.innerHTML = "";
    roadmap.stages.forEach(function (stage) {
      var card = document.createElement("article");
      card.className = "stage-card";
      var title = document.createElement("h3");
      title.textContent = stage.title;
      var meta = document.createElement("p");
      meta.className = "stage-meta";
      meta.textContent = "Stage " + stage.n + " · " + stage.hours + " · " + stage.trophy_ids.length + " trophies";
      var summary = document.createElement("p");
      summary.textContent = stage.summary;
      var tips = document.createElement("ul");
      (stage.tips || []).forEach(function (tip) {
        var li = document.createElement("li");
        li.textContent = tip;
        tips.appendChild(li);
      });
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(summary);
      card.appendChild(tips);
      grid.appendChild(card);
    });
  }

  function renderSources() {
    var ul = document.getElementById("source-list");
    ul.innerHTML = "";
    var seen = {};
    trophies.forEach(function (t) {
      (t.sources || []).forEach(function (s) {
        if (seen[s.url]) return;
        seen[s.url] = true;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = s.url;
        a.textContent = s.name;
        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  }

  function matches(t) {
    var q = searchEl.value.trim().toLowerCase();
    if (q) {
      var hay = (t.name + " " + t.description + " " + t.guide + " " + t.kind).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (kindEl.value !== "all" && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== "all" && t.grade !== gradeEl.value) return false;
    if (stageEl.value !== "all" && String(t.stage) !== stageEl.value) return false;
    if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
    return true;
  }

  function renderList() {
    listEl.innerHTML = "";
    var shown = trophies.filter(matches);
    countEl.textContent = shown.length + " of " + trophies.length + " trophies shown";
    emptyEl.hidden = shown.length !== 0;
    shown.forEach(function (t) {
      var li = document.createElement("li");
      li.className = "trophy" + (earned.has(t.id) ? " earned" : "");

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = earned.has(t.id);
      box.setAttribute("aria-label", "Mark " + t.name + " as earned");
      box.addEventListener("change", function () {
        if (box.checked) earned.add(t.id);
        else earned.delete(t.id);
        persist();
        renderProgress();
        renderList();
      });

      var body = document.createElement("div");
      var head = document.createElement("div");
      head.className = "trophy-head";
      var name = document.createElement("h3");
      var badge = document.createElement("span");
      badge.className = "badge " + t.grade;
      badge.textContent = gradeLabel(t.grade);
      var kindTag = document.createElement("span");
      kindTag.className = "tag";
      kindTag.textContent = kindLabel(t.kind);
      var stageTag = document.createElement("span");
      stageTag.className = "tag";
      stageTag.textContent = stageLabel(t.stage);
      head.appendChild(badge);
      head.appendChild(kindTag);
      head.appendChild(stageTag);
      if (t.kind === "missable") {
        var miss = document.createElement("span");
        miss.className = "tag missable";
        miss.textContent = "Missable";
        head.appendChild(miss);
      }

      var hiddenBySpoiler = spoilerEl.checked && t.hidden && !earned.has(t.id);
      if (hiddenBySpoiler) {
        name.textContent = "Hidden trophy";
        var note = document.createElement("p");
        note.className = "spoiler-note";
        note.textContent = "A story trophy — its name and description stay hidden until you earn it. Uncheck “Hide story spoilers” to reveal it.";
        body.appendChild(head);
        body.appendChild(name);
        body.appendChild(note);
      } else {
        name.textContent = t.name;
        var desc = document.createElement("p");
        desc.className = "trophy-desc";
        desc.textContent = t.description;
        var guide = document.createElement("p");
        guide.className = "trophy-guide";
        guide.textContent = t.guide;
        var src = document.createElement("p");
        src.className = "trophy-sources";
        src.textContent = "Source: ";
        (t.sources || []).forEach(function (s, i) {
          if (i > 0) src.appendChild(document.createTextNode(" · "));
          var a = document.createElement("a");
          a.href = s.url;
          a.textContent = s.name;
          src.appendChild(a);
        });
        body.appendChild(head);
        body.appendChild(name);
        body.appendChild(desc);
        body.appendChild(guide);
        body.appendChild(src);
      }

      li.appendChild(box);
      li.appendChild(body);
      listEl.appendChild(li);
    });
  }

  function renderAll() {
    renderProgress();
    renderRoadmap();
    renderSources();
    renderList();
  }

  // Toolbar wiring
  searchEl.addEventListener("input", renderList);
  kindEl.addEventListener("change", renderList);
  gradeEl.addEventListener("change", renderList);
  stageEl.addEventListener("change", renderList);
  spoilerEl.addEventListener("change", renderList);
  earnedOnlyEl.addEventListener("change", renderList);

  document.getElementById("export-btn").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ earned: Array.from(earned).sort(function (a, b) { return a - b; }), exported_at: new Date().toISOString() }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-trophy-progress.json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  var importFile = document.getElementById("import-file");
  document.getElementById("import-btn").addEventListener("click", function () { importFile.click(); });
  importFile.addEventListener("change", function () {
    var file = importFile.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(ids)) throw new Error("bad file");
        earned = new Set(ids.filter(function (id) { return trophies.some(function (t) { return t.id === id; }); }));
        persist();
        renderAll();
      } catch (e) {
        alert("That file could not be imported — it does not look like a Leonida progress export.");
      }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    if (!confirm("Clear all earned trophies?")) return;
    earned = new Set();
    persist();
    renderAll();
  });

  // Boot: load the data, build the filter options, render.
  Promise.all([
    fetch("data/trophies.json").then(function (r) { return r.json(); }),
    fetch("data/roadmap.json").then(function (r) { return r.json(); })
  ]).then(function (results) {
    trophies = results[0].trophies;
    roadmap = results[1];
    var kinds = [];
    trophies.forEach(function (t) { if (kinds.indexOf(t.kind) === -1) kinds.push(t.kind); });
    fillSelect(kindEl, kinds, "All kinds", kindLabel);
    fillSelect(gradeEl, ["platinum", "gold", "silver", "bronze"], "All grades", gradeLabel);
    fillSelect(stageEl, [1, 2, 3], "All stages", stageLabel);
    renderAll();
  }).catch(function (err) {
    listEl.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.textContent = "Could not load the trophy data. Open this guide from its own folder (it reads data/trophies.json and data/roadmap.json next to it).";
  });
})();
