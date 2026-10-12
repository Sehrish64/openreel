const IA = "https://archive.org";
const TMDB = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";
const KEY = (window.CONFIG && window.CONFIG.TMDB_KEY) || "";
const REGION = (window.CONFIG && window.CONFIG.REGION) || "US";

const ROWS = [
  { title: "Popular classics", q: "collection:feature_films AND mediatype:movies" },
  { title: "Sci-Fi", q: "collection:feature_films AND mediatype:movies AND subject:(sci-fi OR science fiction)" },
  { title: "Horror", q: "collection:feature_films AND mediatype:movies AND subject:horror" },
  { title: "Comedy", q: "collection:feature_films AND mediatype:movies AND subject:comedy" },
  { title: "Film Noir", q: "collection:feature_films AND mediatype:movies AND subject:(film noir OR noir)" },
  { title: "Silent films", q: "collection:feature_films AND mediatype:movies AND subject:silent" }
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
    <div class="overlay">${esc(d.title)}</div>
    <p class="caption">${esc(d.title)}<br><small>${esc(d.year || "")}</small></p>`;
  el.onclick = () => openFree(d);
  return el;
}

function newCard(m) {
  const el = document.createElement("div");
  el.className = "card";
  const img = m.poster_path ? `${TMDB_IMG}${m.poster_path}` : "";
  el.innerHTML = `<img loading="lazy" src="${img}" alt="">
    <div class="overlay">${esc(m.title)}</div>
    <p class="caption">${esc(m.title)}<br><small>${esc((m.release_date || "").slice(0, 4))}</small></p>`;
  el.onclick = () => openNew(m);
  return el;
}

function skelRow(rowEl, n = 8) {
  rowEl.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const s = document.createElement("div");
    s.className = "skel";
    s.innerHTML = '<div class="skel-img"></div><div class="skel-line"></div><div class="skel-line short"></div>';
    rowEl.appendChild(s);
  }
}

function fill(rowEl, items, make) {
  rowEl.innerHTML = "";
  if (!items.length) { rowEl.innerHTML = '<div class="msg">Nothing found.</div>'; return; }
  items.forEach((i) => rowEl.appendChild(make(i)));
}

async function loadRows() {
  const host = $("rows");
  for (const r of ROWS) {
    const h = document.createElement("h2");
    h.className = "row-title";
    h.textContent = r.title;
    const row = document.createElement("div");
    row.className = "row";
    skelRow(row);
    host.append(h, row);
    try { fill(row, await ia(r.q, 20), freeCard); }
    catch (e) { row.innerHTML = `<div class="msg">Could not load (${esc(e.message)}).</div>`; }
  }
}

async function loadHero() {
  try {
    const docs = await ia(ROWS[0].q, 5);
    if (!docs.length) return;
    const d = docs[Math.floor(Math.random() * docs.length)];
    $("heroBg").style.backgroundImage =
      `url("${IA}/services/img/${encodeURIComponent(d.identifier)}")`;
    $("heroTitle").textContent = d.title;
    $("heroMeta").textContent =
      `${d.year ? d.year + "  ·  " : ""}Public domain classic · free forever`;
    $("heroPlay").onclick = () => openFree(d);
    $("heroInfo").onclick = () => openInfo(d);
    $("hero").hidden = false;
  } catch (e) { /* hero stays hidden, rows still work */ }
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

function openInfo(d) {
  openModal(d.title, `
    <img src="${IA}/services/img/${encodeURIComponent(d.identifier)}" alt=""
      style="width:180px;border-radius:8px;float:left;margin:0 16px 12px 0;">
    <p class="overview"><strong style="color:#fff">${esc(d.title)}</strong><br>
      ${d.year ? "Released: " + esc(d.year) + "<br>" : ""}
      A public domain classic from the Internet Archive — free to watch, forever.<br>
      <a href="${IA}/details/${encodeURIComponent(d.identifier)}" target="_blank" rel="noopener">View on archive.org</a></p>
    <div class="btn-row" style="clear:both;">
      <button class="btn-play" id="infoPlay">&#9654; Play now</button>
    </div>`);
  $("infoPlay").onclick = () => openFree(d);
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
  $("hero").hidden = true;
  $("resultsTitle").textContent = `Results for "${term}"`;
  $("newTitle").hidden = $("newRow").hidden = !KEY;
  $("freeTitle").hidden = false;
  $("freeRow").innerHTML = '<div class="msg">Searching...</div>';
  const safe = term.replace(/["\\]/g, " ");
  const jobs = [
    ia(`collection:feature_films AND mediatype:movies AND title:(${safe})`, 30)
      .then((x) => fill($("freeRow"), x, freeCard))
      .catch((e) => { $("freeRow").innerHTML = `<div class="msg">${esc(e.message)}` + "</div>"; })
  ];
  if (KEY) {
    $("newRow").innerHTML = '<div class="msg">Searching...</div>';
    jobs.push(
      tmdb("/search/movie", { query: term })
        .then((x) => fill($("newRow"), x.results.slice(0, 12), newCard))
        .catch((e) => { $("newRow").innerHTML = `<div class="msg">${esc(e.message)}` + "</div>"; })
    );
  }
  await Promise.all(jobs);
}

$("searchForm").onsubmit = (e) => {
  e.preventDefault();
  const t = $("q").value.trim();
  if (!t) {
    $("results").hidden = true;
    $("rows").hidden = false;
    if ($("heroTitle").textContent) $("hero").hidden = false;
    return;
  }
  search(t);
};

$("logo").onclick = () => {
  $("q").value = "";
  $("results").hidden = true;
  $("rows").hidden = false;
  if ($("heroTitle").textContent) $("hero").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.addEventListener("scroll", () => {
  $("topnav").classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

loadHero();
loadRows();
