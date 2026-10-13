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

// Curated, hand-verified: every identifier below was checked on 2026-10-13 —
// archive.org metadata returns a playable video file AND /embed/<id> is HTTP 200.
// See CLASSICS.md for the verification record.
const CLASSICS = [
  { id: "Night.Of.The.Living.Dead_1080p", name: "Night of the Living Dead", year: "1968" },
  { id: "turner_video_341", name: "Charade", year: "1963" },
  { id: "his_girl_friday", name: "His Girl Friday", year: "1940" },
  { id: "The_General_Buster_Keaton", name: "The General", year: "1926" },
  { id: "Brzdac1921", name: "The Kid", year: "1921" },
  { id: "Nosferatu_most_complete_version_93_mins.", name: "Nosferatu", year: "1922" },
  { id: "metropolis-1927-giorgio-moroders-edition-1080p-blu-ray-remux-avc-dts-hd-ma-5.1", name: "Metropolis", year: "1927" },
  { id: "Detour", name: "Detour", year: "1945" },
  { id: "doa_ipod", name: "D.O.A.", year: "1949" },
  { id: "house_on_haunted_hill_ipod", name: "House on Haunted Hill", year: "1959" },
  { id: "The.39.Steps.1935.ITA.ENG.960x720p.BRrip", name: "The 39 Steps", year: "1935" },
  { id: "Hitch_Hiker", name: "The Hitch-Hiker", year: "1953" },
  { id: "suddenly", name: "Suddenly", year: "1954" },
  { id: "last-man-on-earth-4-k", name: "The Last Man on Earth", year: "1964" },
  { id: "CarnivalofSouls", name: "Carnival of Souls", year: "1962" },
  { id: "plan.-9.-from.-outer.-space.-1957", name: "Plan 9 from Outer Space", year: "1959" },
  { id: "dressed_to_kill", name: "Sherlock Holmes: Dressed to Kill", year: "1946" },
  { id: "TheBrainThatWouldntDie_165", name: "The Brain That Wouldn't Die", year: "1962" },
  { id: "white_zombie", name: "White Zombie", year: "1932" },
  { id: "ThePhantomoftheOpera", name: "The Phantom of the Opera", year: "1925" },
  { id: "safety-last-1923-silent-film-noir-comedy-short", name: "Safety Last!", year: "1923" },
  { id: "the-circus-1928-remastered-bluray-1080p-flac-1.0-x264-sinners", name: "The Circus", year: "1928" },
  { id: "BeatTheDevil1953", name: "Beat the Devil", year: "1953" },
  { id: "AStarIsBorn", name: "A Star Is Born", year: "1937" }
];

const INDIAN_CLASSICS = [
  { id: "sant-tukaram-1936_202604", name: "Sant Tukaram", year: "1936" },
  { id: "neecha-nagar-chetan-anand-1946-vidomon", name: "Neecha Nagar", year: "1946" },
  { id: "ChetanPatilChandralekha", name: "Chandralekha", year: "1948" },
  { id: "awaara.-1951.1080p.-web-dl.-avc.-aac.-ddr", name: "Awaara", year: "1951" },
  { id: "do.-bigha.-zamin.-1953.576p.-mubi.-web-dl.x-264", name: "Do Bigha Zamin", year: "1953" },
  { id: "pyaasa-1957-guru-dutt-hindi-dvd-rip-xvid-smeet", name: "Pyaasa", year: "1957" },
  { id: "mother-india-1957-hindi-classic-film", name: "Mother India", year: "1957" },
  { id: "kagaz-ke-phool", name: "Kaagaz Ke Phool", year: "1959" }
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

function addCuratedRow(host, title, list) {
  const h = document.createElement("h2");
  h.className = "row-title";
  h.textContent = title;
  const row = document.createElement("div");
  row.className = "row";
  host.append(h, row);
  // curated lists need no network fetch — cards build instantly from verified ids
  fill(row, list.map((c) => ({ identifier: c.id, title: c.name, year: c.year })), freeCard);
}

async function loadRows() {
  const host = $("rows");
  addCuratedRow(host, "\u{1F31F} All-Time Classics", CLASSICS);
  addCuratedRow(host, "\u{1F1EE}\u{1F1F3} Indian Classics", INDIAN_CLASSICS);
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

function loadHero() {
  // hero always features a verified classic — shows instantly, no fetch needed
  const c = CLASSICS[Math.floor(Math.random() * CLASSICS.length)];
  const d = { identifier: c.id, title: c.name, year: c.year };
  $("heroBg").style.backgroundImage =
    `url("${IA}/services/img/${encodeURIComponent(d.identifier)}")`;
  $("heroTitle").textContent = d.title;
  $("heroMeta").textContent = `${d.year}  \u00B7  Public domain classic \u00B7 free forever`;
  $("heroPlay").onclick = () => openFree(d);
  $("heroInfo").onclick = () => openInfo(d);
  $("hero").hidden = false;
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
  // ?autoplay=1 is honored by the archive.org embed player (verified 2026-10-13:
  // the embed page's player config contains "autoplay":true with the param).
  // The click that opens this modal counts as a user gesture, so playback
  // starts immediately — one click, no extra steps.
  openModal(d.title, `
    <iframe class="player" allowfullscreen allow="autoplay; fullscreen"
      src="${IA}/embed/${encodeURIComponent(d.identifier)}?autoplay=1"></iframe>
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
