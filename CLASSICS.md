# OpenReel — Verified Classics Record

Curated 2026-10-13. Every film below passed BOTH checks from a live VM:
1. `https://archive.org/metadata/<identifier>` → HTTP 200 with at least one
   playable video file (mp4/ogv/webm).
2. `https://archive.org/embed/<identifier>` → HTTP 200.

Click → modal opens instantly with the archive.org player autoplaying
(`?autoplay=1` is honored by the embed player — its player config contains
`"autoplay":true` when the param is present; the opening click counts as the
user gesture, so playback starts with one click).

## 🌟 All-Time Classics (24)

| # | Film | Year | archive.org identifier | Notes |
|---|------|------|------------------------|-------|
| 1 | Night of the Living Dead | 1968 | `Night.Of.The.Living.Dead_1080p` | |
| 2 | Charade | 1963 | `turner_video_341` | the famous public-domain Hepburn/Grant film |
| 3 | His Girl Friday | 1940 | `his_girl_friday` | |
| 4 | The General | 1926 | `The_General_Buster_Keaton` | Buster Keaton |
| 5 | The Kid | 1921 | `Brzdac1921` | Chaplin; metadata title is Polish "Brzdąc" |
| 6 | Nosferatu | 1922 | `Nosferatu_most_complete_version_93_mins.` | most complete 93-min version |
| 7 | Metropolis | 1927 | `metropolis-1927-giorgio-moroders-edition-1080p-blu-ray-remux-avc-dts-hd-ma-5.1` | Giorgio Moroder 1984 edition — chosen because it is AVC/h264 (plays in every browser); the top-downloaded copy was HEVC/x265, which fails on Chrome/Android |
| 8 | Detour | 1945 | `Detour` | |
| 9 | D.O.A. | 1949 | `doa_ipod` | classic noir; has mp4 + ogv + 512kb mp4 |
| 10 | House on Haunted Hill | 1959 | `house_on_haunted_hill_ipod` | Vincent Price |
| 11 | The 39 Steps | 1935 | `The.39.Steps.1935.ITA.ENG.960x720p.BRrip` | Hitchcock; first candidate `The39Steps_1935` had no playable video — replaced with this verified rip |
| 12 | The Hitch-Hiker | 1953 | `Hitch_Hiker` | Ida Lupino noir |
| 13 | Suddenly | 1954 | `suddenly` | Sinatra |
| 14 | The Last Man on Earth | 1964 | `last-man-on-earth-4-k` | Vincent Price; colorized 4K version |
| 15 | Carnival of Souls | 1962 | `CarnivalofSouls` | |
| 16 | Plan 9 from Outer Space | 1959 | `plan.-9.-from.-outer.-space.-1957` | |
| 17 | Sherlock Holmes: Dressed to Kill | 1946 | `dressed_to_kill` | Rathbone/Bruce |
| 18 | The Brain That Wouldn't Die | 1962 | `TheBrainThatWouldntDie_165` | |
| 19 | White Zombie | 1932 | `white_zombie` | Bela Lugosi |
| 20 | The Phantom of the Opera | 1925 | `ThePhantomoftheOpera` | Chaney |
| 21 | Safety Last! | 1923 | `safety-last-1923-silent-film-noir-comedy-short` | Harold Lloyd |
| 22 | The Circus | 1928 | `the-circus-1928-remastered-bluray-1080p-flac-1.0-x264-sinners` | Chaplin; remastered x264 (plays everywhere) |
| 23 | Beat the Devil | 1953 | `BeatTheDevil1953` | Bogart |
| 24 | A Star Is Born | 1937 | `AStarIsBorn` | Janet Gaynor version |

## 🇮🇳 Indian Classics (8)

| # | Film | Year | archive.org identifier | Notes |
|---|------|------|------------------------|-------|
| 1 | Sant Tukaram | 1936 | `sant-tukaram-1936_202604` | Prabhat Film Company |
| 2 | Neecha Nagar | 1946 | `neecha-nagar-chetan-anand-1946-vidomon` | Cannes Grand Prix winner |
| 3 | Chandralekha | 1948 | `ChetanPatilChandralekha` | |
| 4 | Awaara | 1951 | `awaara.-1951.1080p.-web-dl.-avc.-aac.-ddr` | Raj Kapoor; AVC web-dl |
| 5 | Do Bigha Zamin | 1953 | `do.-bigha.-zamin.-1953.576p.-mubi.-web-dl.x-264` | Bimal Roy; x264 |
| 6 | Pyaasa | 1957 | `pyaasa-1957-guru-dutt-hindi-dvd-rip-xvid-smeet` | Guru Dutt |
| 7 | Mother India | 1957 | `mother-india-1957-hindi-classic-film` | Oscar-nominated |
| 8 | Kaagaz Ke Phool | 1959 | `kagaz-ke-phool` | Guru Dutt; DVD VTS rips, embed picks the feature |

## Dropped (honest)

- **Alam Ara (1931)** — the actual 1931 film is lost (no print survives). The only
  archive.org result is `dli.MoI.DastanEAlamAra_Musical`, a 1981 *documentary about*
  Alam Ara — including it would mislead viewers. Dropped.
- **Shree 420 (1955)** — the only archive.org result is a YouTube song clip
  (`youtube-oXLzfldeDcM`, "Pyar Hua Ikrar Hua"), not the film. Dropped.
- **The 39 Steps (1935)** — first candidate `The39Steps_1935` had no playable
  video file; recovered via alternate verified rip (see row 11 above).

## Wrong-match corrections during verification

Title search alone matched the wrong item for three films; each was re-searched
with year/creator qualifiers and replaced:
- "The Kid" → first hit was the 1938 western *Billy the Kid Returns*; replaced
  with Chaplin's *The Kid* (1921).
- "Metropolis" → first hit was the unrelated 1961 *The Giant of Metropolis*;
  replaced with *Metropolis* (1927) — AVC edition for browser playback.
- "The Circus" → first hit was the 1938 *Peck's Bad Boy with the Circus*;
  replaced with Chaplin's *The Circus* (1928).

## Autoplay

`GET https://archive.org/embed/Detour?autoplay=1` returns HTTP 200 and the
embed page's player config contains `"autoplay":true`. The app appends
`?autoplay=1` to every film iframe and sets `allow="autoplay; fullscreen"`.
