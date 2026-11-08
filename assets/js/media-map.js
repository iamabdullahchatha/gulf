/**
 * GULF NEXT — Media asset map
 * ---------------------------------------------------------------------------
 * Single source of truth connecting every cinematic scene to its website
 * section. Pages never hard-code video paths; they reference a section key
 * (e.g. "about.hero") and the CinematicHero component resolves it here.
 *
 * Audit date: 2026-11-08. All `original` filenames below were verified on disk
 * (project root) — note the irregular spellings, they are the real names.
 *
 * Web versions are produced by `zsh tools/build-media.sh` (H.264, fast-start):
 *   assets/media/video/1080/<id>.mp4   desktop
 *   assets/media/video/720/<id>.mp4    mobile / slow connections
 *   assets/media/posters/<id>.jpg      first frame, 1920px
 *   assets/media/posters/<id>-sm.jpg   first frame, 960px
 *
 * Classic script (no ES modules) so the site also works opened from file://.
 */
(function (global) {
  'use strict';

  var VIDEO = 'assets/media/video/';
  var POSTER = 'assets/media/posters/';

  function asset(id, meta) {
    var a = {
      id: id,
      available: meta.available !== false,
      sources: { hd: VIDEO + '1080/' + id + '.mp4', sd: VIDEO + '720/' + id + '.mp4' },
      poster: POSTER + id + '.jpg',
      posterSmall: POSTER + id + '-sm.jpg'
    };
    for (var k in meta) a[k] = meta[k];
    return Object.freeze(a);
  }

  /* ---------------------------------------------------------------------- */
  /* 1. ASSETS — every scene found in the audit                              */
  /* ---------------------------------------------------------------------- */
  var assets = {
    'scene-01': asset('scene-01-homepage-opening', {
      scene: '01', title: 'Homepage opening',
      original: 'Scene 01 — Homepage opening.mp4',
      content: 'Night aerial of a riverside refinery complex, city skyline beyond.',
      sourceResolution: '1920x1080', duration: 8.04, sourceMB: 31.2
    }),
    'scene-02': asset('scene-02-oil-extraction', {
      scene: '02', title: 'Oil extraction',
      original: 'Scene 02 — Oil extraction.mp4',
      content: 'Onshore drilling rig on open desert under clear daylight.',
      sourceResolution: '1280x720', duration: 8.04, sourceMB: 10.6
    }),
    'scene-03': asset('scene-03-offshore-extraction', {
      scene: '03', title: 'Offshore extraction',
      original: 'Scene 03 — Offshore extraction.mp4',
      content: 'Aerial of an offshore production platform with helideck, open sea.',
      sourceResolution: '1920x1080', duration: 8.04, sourceMB: 25.5
    }),
    'scene-04': asset('scene-04-onshore', {
      scene: '04', title: 'Onshore production',
      original: 'scene-4-oonshore.mp4',
      content: 'Wide aerial of a desert onshore processing facility and tank farm.',
      sourceResolution: '1920x1080', duration: 8.04, sourceMB: 20.8
    }),
    'scene-05': asset('scene-05-mechanical-engineering', {
      scene: '05', title: 'Mechanical engineering',
      original: 'Scene 05 — Mechanical engineering.mp4',
      content: 'Crane lifting equipment over plant pipework at golden hour.',
      sourceResolution: '1920x1080', duration: 8.04, sourceMB: 21.7
    }),
    'scene-09': asset('scene-09-about-us', {
      scene: '09', title: 'About Us (homepage)',
      original: 'Scene 09  About Us.mp4',
      content: 'Refinery at dusk, lit columns and rising steam.',
      sourceResolution: '1920x1080', duration: 7.04, sourceMB: 16.3
    }),
    'scene-10': asset('scene-10-about-us', {
      scene: '10', title: 'About Us — company identity',
      original: 'Scene 10 — About Us.mp4',
      content: 'Twilight gas-processing plant with pipeline corridors and flares.',
      sourceResolution: '1920x1080', duration: 8.04, sourceMB: 22.2
    }),
    'scene-11': asset('scene-11-services', {
      scene: '11', title: 'Services — industrial capabilities',
      original: null,
      available: false,
      // NOT FOUND in the audit. Until the render is added, the Services hero
      // borrows Scene 05 (read-only reuse; the homepage is unaffected).
      // To connect: save it as "Scene 11 — Services.mp4" in the project root,
      // run `zsh tools/build-media.sh`, then set available: true.
      fallback: 'scene-05'
    }),
    'scene-12': asset('scene-12-industries', {
      scene: '12', title: 'Industries showcase',
      original: 'Scene 12 — Industries.mp4',
      content: 'Aerial of an offshore platform on a calm, sunlit sea.',
      sourceResolution: '1920x1080', duration: 8.04, sourceMB: 24.7
    })
  };

  /* ---------------------------------------------------------------------- */
  /* 2. SECTIONS — where each scene is used                                  */
  /* ---------------------------------------------------------------------- */
  var sections = {
    // Homepage: the six approved scenes, in storyboard order.
    'home.opening':     { asset: 'scene-01', page: 'index.html',      label: 'Homepage hero' },
    'home.extraction':  { asset: 'scene-02', page: 'index.html',      label: 'Oil extraction chapter' },
    'home.offshore':    { asset: 'scene-03', page: 'index.html',      label: 'Offshore chapter' },
    'home.onshore':     { asset: 'scene-04', page: 'index.html',      label: 'Onshore chapter' },
    'home.engineering': { asset: 'scene-05', page: 'index.html',      label: 'Mechanical engineering chapter' },
    'home.about':       { asset: 'scene-09', page: 'index.html',      label: 'About teaser' },
    // Inner pages.
    'about.hero':       { asset: 'scene-10', page: 'about.html',      label: 'About Us hero' },
    'services.hero':    { asset: 'scene-11', page: 'services.html',   label: 'Services hero' },
    'industries.hero':  { asset: 'scene-12', page: 'industries.html', label: 'Industries hero' }
  };

  /* ---------------------------------------------------------------------- */
  /* 3. Files found on disk that are not wired to any section                */
  /* ---------------------------------------------------------------------- */
  var unassigned = [
    {
      original: 'scene about us home.mp4',
      content: 'Petrochemical plant framed through a steel structure, daylight.',
      sourceResolution: '1920x1080', duration: 7.04, sourceMB: 14.5,
      note: 'Not in the approved six-scene homepage list. Looks like an alternate ' +
            'homepage About take (Scene 09 already fills that slot). Awaiting a decision.'
    }
  ];

  /**
   * Resolve a section key to a playable asset, following `fallback` when the
   * mapped scene is not available yet. Returns null for unknown keys.
   */
  function resolve(sectionKey) {
    var section = sections[sectionKey];
    if (!section) return null;
    var a = assets[section.asset];
    var seen = {};
    while (a && !a.available && a.fallback && !seen[a.fallback]) {
      seen[a.fallback] = true;
      a = assets[a.fallback];
    }
    if (!a || !a.available) return null;
    return { section: section, asset: a, isFallback: a !== assets[section.asset] };
  }

  global.GULF_MEDIA = Object.freeze({
    assets: assets,
    sections: sections,
    unassigned: unassigned,
    resolve: resolve
  });
})(window);
