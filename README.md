# OpenReel

A free, legal "movie app" that runs in the browser. No backend, no paid tools.

- **Free films:** public domain movies from the Internet Archive, playable on the page.
- **New films:** optional TMDB key adds trailers and "where to watch legally" for any film (by country).
- Netflix-style rows, search, poster cards, modal player.

OpenReel hosts no videos and does not touch DRM or paid content. New films are not
free here because they are copyrighted. The app shows where they are legally available
(including free ad-supported services where they exist).

## Run

Open `index.html` in a browser (or use any static server). Free films work without any key.

## Optional: new films (trailers + where to watch)

1. Make a free account on themoviedb.org and request an API key.
2. Put it in `config.js` (`TMDB_KEY`) and set your `REGION` (e.g. `PK`).

## Deploy free on GitHub Pages

Push this folder to a repo, then Settings > Pages > Deploy from branch > `main` / root.

Note: a key in `config.js` is visible to visitors. Use a free key only.

## Credits

Films: Internet Archive. Film data and availability: TMDB (this product uses the TMDB API
but is not endorsed or certified by TMDB). Availability data by JustWatch.

License: MIT
