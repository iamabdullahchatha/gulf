# GULF NEXT website

The React/Vite website is in `web/`. Install and run it from this project root:

```sh
npm i
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). The root-level
HTML pages are a separate static version; to serve those directly:

```sh
ruby -run -e httpd . -p 8000      # then visit http://localhost:8000
```

## Scroll-scrubbed films (React app)

The home, About, Services and Industries heroes and the homepage refinery
section are driven by scroll. They render on a `<canvas>` through
`web/src/lib/frameEngine.ts`: the clip is demuxed in memory
(`web/src/lib/mp4.ts`), decoded with WebCodecs a GOP at a time around the
playhead, and the exact frame for the scroll position is drawn every
animation frame, blended with the next frame so 24 fps footage moves
smoothly at 60/120 Hz. Browsers without WebCodecs (or a decode error) fall
back to seeking `<video>` elements on the same frame. The clips themselves
are unchanged and still come from `tools/build-media.sh`; keep the 8-frame
GOP and no B-frames, which the engine relies on.

## Cinematic media integration

The static site and its media tooling are documented below.

## Asset audit (2026-11-08)

All filenames below were checked on disk. The originals in the project root are never modified.

| Scene | Original file (exact name) | Source | Web id | Used in |
|---|---|---|---|---|
| 01 | `Scene 01 — Homepage opening.mp4` | 1920×1080, 8.0s, 31.2 MB | `scene-01-homepage-opening` | Homepage hero |
| 02 | `Scene 02 — Oil extraction.mp4` | 1280×720, 8.0s, 10.6 MB | `scene-02-oil-extraction` | Homepage, chapter 2 |
| 03 | `Scene 03 — Offshore extraction.mp4` | 1920×1080, 8.0s, 25.5 MB | `scene-03-offshore-extraction` | Homepage, chapter 3 |
| 04 | `scene-4-oonshore.mp4` | 1920×1080, 8.0s, 20.8 MB | `scene-04-onshore` | Homepage, chapter 4 |
| 05 | `Scene 05 — Mechanical engineering.mp4` | 1920×1080, 8.0s, 21.7 MB | `scene-05-mechanical-engineering` | Homepage, chapter 5. Also the interim Services hero |
| 09 | `Scene 09  About Us.mp4` (two spaces) | 1920×1080, 7.0s, 16.3 MB | `scene-09-about-us` | Homepage, chapter 6 (About teaser) |
| 10 | `Scene 10 — About Us.mp4` | 1920×1080, 8.0s, 22.2 MB | `scene-10-about-us` | About Us hero |
| 11 | **not found** | | `scene-11-services` | Services hero (Scene 05 stands in) |
| 12 | `Scene 12 — Industries.mp4` | 1920×1080, 8.0s, 24.7 MB | `scene-12-industries` | Industries hero |
| none | `scene about us home.mp4` | 1920×1080, 7.0s, 14.5 MB | not encoded | **Unassigned.** Awaiting a decision |

The code mapping lives in `assets/js/media-map.js`. Pages refer to section keys such as `about.hero`, never to file paths.

## Web media

`tools/build-media.sh` produces these using only built-in macOS tools:

| Output | Path | Notes |
|---|---|---|
| Desktop video | `assets/media/video/1080/<id>.mp4` | H.264, fast-start, about 10 MB each |
| Mobile video | `assets/media/video/720/<id>.mp4` | Used at 900px wide or less, or on 3G |
| Poster | `assets/media/posters/<id>.jpg` | Exact first frame, 1920px |
| Mobile poster | `assets/media/posters/<id>-sm.jpg` | 960px |

## Adding Scene 11 later

1. Save the render in the project root as `Scene 11 — Services.mp4`.
2. Run `zsh tools/build-media.sh`.
3. In `assets/js/media-map.js`, set `available: true` on `scene-11` and fill in its metadata.
4. In `tools/build-pages.rb`, change the Services `poster:` to `scene-11-services`, then run `ruby tools/build-pages.rb`.

## Editing pages

Page bodies live in `tools/pages/*.html`. The shared head, header and footer are in `tools/build-pages.rb`. Run `ruby tools/build-pages.rb` after any change. Do not edit the generated root `*.html` files directly.

## `<cinematic-hero>`

The full list of props is documented at the top of `assets/js/cinematic-hero.js`.

```html
<cinematic-hero section="about.hero" loading="eager"
  align="left" overlay="medium" height="full" mobile-focal="60% 50%"
  eyebrow="About GULF NEXT" heading="…" description="…"
  primary-label="Our services" primary-href="services.html"
  secondary-label="Industries" secondary-href="industries.html"></cinematic-hero>
```

```js
document.body.append(CinematicHero.create({
  src: 'clip.mp4', srcSd: 'clip-720.mp4', poster: 'clip.jpg',
  heading: '…', align: 'center', overlay: 0.6,
  primary: { label: 'Contact', href: '#contact' },
  responsive: { height: 'tall', mobileAlign: 'left', mobileFocal: '40% 50%', mobileVideo: 'off' }
}));
```

### Loading behaviour

- **Reserved space.** Each hero reserves its height in CSS before the script runs, so nothing shifts.
- **Poster first.** The poster is an `<img>` placed under the video. It shows while the video loads and stays as the fallback.
- **Lazy video.** Video bytes are fetched only within about one viewport of the screen. Heroes marked `loading="eager"` start immediately.
- **Visible-only playback.** Video plays only while on screen and pauses in background tabs.
- **Poster only.** No video plays when Save-Data is on, on a 2G connection, or after a load error or 15-second stall. `mobile-video="off"` also gives poster only on phones.
- **Reduced motion.** With `prefers-reduced-motion`, the hero shows its poster plus a play button.
- **Pause control.** Every playing hero has a pause and play button.
- **Cleanup.** Removing a hero disconnects its observers and listeners and releases the media buffer.
- **Interim badge.** The yellow "interim footage" badge appears only on localhost and `file://`.
