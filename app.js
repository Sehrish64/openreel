const IA = "https://archive.org";
const TMDB = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
const KEY = (window.CONFIG && window.CONFIG.TMDB_KEY) || "";
const REGION = (window.CONFIG && window.CONFIG.REGION) || "US";

const ROWS = [
  { title: "Popular classics", q: "collection:feature_films" },
  { title: "Sci-Fi", q: "collection:feature_films AND subject:(sci-fi OR science fiction)" },
  { title: "Horror", q: "collection:feature_films AND subject:horror" },
  { title: "Comedy", q: "collection:feature_films AND subject:comedy" },
  { title: "Film Noir", q: "collection:feature_films AND subject:(film noir OR noir)" },
  { title: "Silent films", q: "collection:feature_films AND subject:silent" }
];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function ia(query, rows = 20) {
  const p = new URLSearchParams();
  p.set("q", query);
  ["identifier", "title", "year"].forEach((f) => p.append("fl[]", f));
  p.append("sort[]", "downloads desc");
  p.set("rows", rows);
  p.set("output", "json");
  const r = await fetch(`${IA}/advancedsearch.php?${p}`);
  if (!r.ok) throw new Error("Internet Archive error " + r.status);
  const j = await r.json();
  return j.response.docs;
}

function freeCard(d) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `<img loading="lazy" src="${IA}/services/img/${encodeURIComponent(d.identifier)}" alt="">
    <p>${esc(d.title)}<br><small>${esc(d.year || "")}</small></p>`;
  el.onclick = () => openFree(d);
  return el;
}

function newCard(m) {
  const el = document.createElement("div");
  el.className = "card";
  const img = m.poster_path ? `${TMDB_IMG}${m.poster_path}` : "";
  el.innerHTML = `<img loading="lazy" src="${img}" alt="">
    <p>${esc(m.title)}<br><small>${esc((m.release_date || "").slice(0, 4))}</small></p>`;
  el.onclick = () => openNew(m);
  return el;
}

function fill(rowEl, items, make) {
  rowEl.innerHTML = "";
  if (!items.length) { rowEl.innerHTML = '<div class="msg">Nothing found.</div>'; return; }
  items.forEach((i) => rowEl.appendChild(make(i)));
}

async function loadRows() {
  const host = $("rows");
  for (const r of ROWS) {
    const h = document.createElement("h2"); h.textContent = r.title;
    const row = document.createElement("div"); row.className = "row";
    row.innerHTML = '<div class="msg">Loading...</div>';
    host.append(h, row);
    try { fill(row, await ia(r.q, 20), freeCard); }
    catch (e) { row.innerHTML = `<div class="msg">Could not load (${esc(e.message)}).</div>`; }
  }
}

function openModal(title, html) {
  $("mTitle").textContent = title;
  $("mBody").innerHTML = html;
  $("modal").hidden = false;
}
function closeModal() { $("modal").hidden = true; $("mBody").innerHTML = ""; }
$("close").onclick = closeModal;
$("modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function openFree(d) {
  openModal(d.title, `
    <iframe class="player" allowfullscreen
      src="${IA}/embed/${encodeURIComponent(d.identifier)}"></iframe>
    <p class="overview">Public domain film hosted by the Internet Archive.
      <a href="${IA}/details/${encodeURIComponent(d.identifier)}" target="_blank" rel="noopener">Open on archive.org</a></p>`);
}

async function tmdb(path, params = {}) {
  const p = new URLSearchParams({ api_key: KEY, ...params });
  const r = await fetch(`${TMDB}${path}?${p}`);
  if (!r.ok) throw new Error("TMDB error " + r.status);
  return r.json();
}

async function openNew(m) {
  openModal(m.title, '<div class="msg">Loading...</div>');
  try {
    const d = await tmdb(`/movie/${m.id}`, { append_to_response: "videos,watch/providers" });
    const reg = (d["watch/providers"].results || {})[REGION] || {};
    const tags = (list, cls) => (list || []).map((p) => `<span class="tag ${cls}">${esc(p.provider_name)}</span>`).join("") || "";
    const free = tags(reg.free, "free") + tags(reg.ads, "free");
    const sub = tags(reg.flatrate, "");
    const rent = tags(reg.rent, "") + tags(reg.buy, "");
    const trailer = (d.videos.results || []).find((v) => v.site === "YouTube" && v.type === "Trailer");
    openModal(d.title, `
      ${trailer ? `<iframe class="player" allowfullscreen src="https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}"></iframe>` : ""}
      <p class="overview">${esc(d.overview || "")}</p>
      <h3>Free (with ads) in ${esc(REGION)}</h3>${free || '<span class="msg">Not free anywhere in this region right now.</span>'}
      <h3>With subscription</h3>${sub || '<span class="msg">None listed.</span>'}
      <h3>Rent / buy</h3>${rent || '<span class="msg">None listed.</span>'}
      <p class="msg">Availability data by TMDB / JustWatch. Region: ${esc(REGION)} (change in config.js).</p>`);
  } catch (e) {
    $("mBody").innerHTML = `<div class="msg">Could not load details (${esc(e.message)}).</div>`;
  }
}

async function search(term) {
  $("results").hidden = false;
  $("rows").hidden = true;
  $("resultsTitle").textContent = `Results for "${term}"`;
  $("newTitle").hidden = $("newRow").hidden = !KEY;
  $("freeTitle").hidden = false;
  $("freeRow").innerHTML = '<div class="msg">Searching...</div>';
  const safe = term.replace(/["\\]/g, " ");
  const jobs = [
    ia(`collection:feature_films AND title:(${safe})`, 30)
      .then((x) => fill($("freeRow"), x, freeCard))
      .catch((e) => { $("freeRow").innerHTML = `<div class="msg">${esc(e.message)}</div>`; })
  ];
  if (KEY) {
    $("newRow").innerHTML = '<div class="msg">Searching...</div>';
    jobs.push(
      tmdb("/search/movie", { query: term })
        .then((x) => fill($("newRow"), x.results.slice(0, 12), newCard))
        .catch((e) => { $("newRow").innerHTML = `<div class="msg">${esc(e.message)}</div>`; })
    );
  }
  await Promise.all(jobs);
}

$("searchForm").onsubmit = (e) => {
  e.preventDefault();
  const t = $("q").value.trim();
  if (!t) { $("results").hidden = true; $("rows").hidden = false; return; }
  search(t);
};

loadRows();
