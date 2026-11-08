/**
 * GULF NEXT — <cinematic-hero> component
 * ---------------------------------------------------------------------------
 * A full-bleed section with a background video and real HTML content above it.
 * The video is decoration only (aria-hidden, muted, no text burned in).
 *
 * PROPS (HTML attribute  |  JS config key)
 *   section            | section          Media-map key, e.g. "about.hero". Supplies
 *                                          src / srcSd / poster / posterSmall.
 *   src                | src              Video URL (desktop). Overrides section.
 *   src-sd             | srcSd            Video URL for small screens / slow networks.
 *   poster             | poster           Poster image (desktop).
 *   poster-sm          | posterSmall      Poster image (mobile).
 *   eyebrow            | eyebrow          Small label above the heading.
 *   heading            | heading          Main heading text.
 *   heading-level      | headingLevel     1 (page hero, default) or 2 (chapter).
 *   description        | description      Supporting paragraph.
 *   primary-label/-href    | primary   {label, href}
 *   secondary-label/-href  | secondary {label, href}
 *   align              | align            left | center | right  (default left)
 *   overlay            | overlay          0–1, or light | medium | strong (default medium)
 *   loading            | loading          eager (above the fold) | lazy (default)
 *   RESPONSIVE         | responsive {...}
 *   mobile-align       |   mobileAlign    Alignment at ≤768px (default: align)
 *   height             |   height         full | tall | medium (default full)
 *   mobile-height      |   mobileHeight   full | tall | medium (default: height)
 *   focal              |   focal          CSS object-position, e.g. "50% 40%"
 *   mobile-focal       |   mobileFocal    object-position at ≤768px
 *   mobile-video       |   mobileVideo    on | off — off = poster only on phones
 *
 * USAGE
 *   <cinematic-hero section="about.hero" heading="..." ...></cinematic-hero>
 *   or: document.body.append(CinematicHero.create({ section: 'about.hero', ... }))
 *
 * BEHAVIOUR
 *   - No video bytes are requested until the hero is within ~1 viewport of the
 *     screen (preload="none" + lazy src). Only `loading="eager"` heroes start
 *     at once.
 *   - Plays only while visible; pauses off-screen and in background tabs.
 *   - Poster-only when: Save-Data, 2G, prefers-reduced-motion (user can still
 *     press play), mobile-video="off" on phones, or the video fails/stalls.
 *   - Full teardown on removal: observers, listeners and the media buffer.
 */
(function (global) {
  'use strict';

  var MOBILE_MQ = '(max-width: 768px)';
  var SD_MQ = '(max-width: 900px)';
  var OVERLAYS = { light: 0.35, medium: 0.55, strong: 0.75 };
  var STALL_TIMEOUT_MS = 15000;
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';

  function mq(q) { return global.matchMedia ? global.matchMedia(q).matches : false; }

  function connection() {
    return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  }

  function networkTier() {
    var c = connection();
    if (!c) return 'fast';
    if (c.saveData) return 'none';
    if (c.effectiveType === 'slow-2g' || c.effectiveType === '2g') return 'none';
    if (c.effectiveType === '3g') return 'slow';
    return 'fast';
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* One shared observer pair for every hero on the page. */
  var instances = new Map();
  var nearObserver = null;
  var viewObserver = null;

  function observers() {
    if (nearObserver || !('IntersectionObserver' in global)) return;
    nearObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var h = instances.get(e.target);
        if (h && e.isIntersecting) h._attachSource();
      });
    }, { rootMargin: '100% 0px 100% 0px' });
    viewObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var h = instances.get(e.target);
        if (!h) return;
        h._inView = e.isIntersecting && e.intersectionRatio >= 0.15;
        h._sync();
      });
    }, { threshold: [0, 0.15, 0.5] });
  }

  document.addEventListener('visibilitychange', function () {
    instances.forEach(function (h) { h._sync(); });
  });

  class CinematicHero extends HTMLElement {
    constructor() {
      super();
      this._config = null;
      this._built = false;
      this._inView = false;
      this._userPaused = false;
      this._state = 'idle'; // idle | loading | playing | paused | poster | fallback
    }

    /** Programmatic props. Setting this (re)renders the hero. */
    set config(value) {
      this._config = value || {};
      if (this.isConnected) { this._teardown(); this._build(); }
    }
    get config() { return this._props(); }

    connectedCallback() {
      if (!this._built) this._build();
    }

    disconnectedCallback() {
      this._teardown();
    }

    /* ---------------- props ---------------- */

    _props() {
      var c = this._config || {};
      var r = c.responsive || {};
      var a = function (name) { return this.getAttribute(name); }.bind(this);
      var p = {
        section: c.section || a('section'),
        src: c.src || a('src'),
        srcSd: c.srcSd || a('src-sd'),
        poster: c.poster || a('poster'),
        posterSmall: c.posterSmall || a('poster-sm'),
        eyebrow: c.eyebrow != null ? c.eyebrow : a('eyebrow'),
        heading: c.heading != null ? c.heading : a('heading'),
        headingLevel: Number(c.headingLevel || a('heading-level') || 1) === 2 ? 2 : 1,
        description: c.description != null ? c.description : a('description'),
        primary: c.primary || (a('primary-label') ? { label: a('primary-label'), href: a('primary-href') || '#' } : null),
        secondary: c.secondary || (a('secondary-label') ? { label: a('secondary-label'), href: a('secondary-href') || '#' } : null),
        align: c.align || a('align') || 'left',
        overlay: c.overlay != null ? c.overlay : (a('overlay') || 'medium'),
        loading: c.loading || a('loading') || 'lazy',
        mobileAlign: r.mobileAlign || a('mobile-align'),
        height: r.height || a('height') || 'full',
        mobileHeight: r.mobileHeight || a('mobile-height'),
        focal: r.focal || a('focal') || '50% 50%',
        mobileFocal: r.mobileFocal || a('mobile-focal'),
        mobileVideo: (r.mobileVideo || a('mobile-video') || 'on') !== 'off',
        isFallback: false,
        assetId: null
      };
      // Media-map lookup fills anything not given explicitly.
      if (p.section && global.GULF_MEDIA) {
        var hit = global.GULF_MEDIA.resolve(p.section);
        if (hit) {
          p.src = p.src || hit.asset.sources.hd;
          p.srcSd = p.srcSd || hit.asset.sources.sd;
          p.poster = p.poster || hit.asset.poster;
          p.posterSmall = p.posterSmall || hit.asset.posterSmall;
          p.isFallback = hit.isFallback;
          p.assetId = hit.asset.id;
        } else if (global.console) {
          console.warn('[cinematic-hero] No playable media for section "' + p.section + '"');
        }
      }
      p.srcSd = p.srcSd || p.src;
      p.posterSmall = p.posterSmall || p.poster;
      var ov = OVERLAYS[p.overlay];
      p.overlayValue = ov != null ? ov : Math.min(1, Math.max(0, parseFloat(p.overlay) || 0.55));
      return p;
    }

    /* ---------------- render ---------------- */

    _build() {
      var p = this._p = this._props();
      this._abort = new AbortController();
      this.innerHTML = '';
      this.classList.add('ch');
      this.dataset.align = p.align;
      this.dataset.mobileAlign = p.mobileAlign || p.align;
      this.dataset.height = p.height;
      this.dataset.mobileHeight = p.mobileHeight || p.height;
      if (p.assetId) this.dataset.asset = p.assetId;
      if (p.isFallback) this.dataset.interim = 'true';
      this.style.setProperty('--ch-overlay', p.overlayValue);
      this.style.setProperty('--ch-focal', p.focal);
      this.style.setProperty('--ch-focal-mobile', p.mobileFocal || p.focal);

      // Media layer: poster <img> sits under the <video>, so it is both the
      // loading placeholder and the permanent fallback if playback fails.
      var media = el('div', 'ch-media', { 'aria-hidden': 'true' });
      if (p.poster) {
        var pic = el('picture', 'ch-poster');
        pic.appendChild(el('source', null, { media: MOBILE_MQ, srcset: p.posterSmall }));
        var img = el('img', null, {
          src: p.poster, alt: '', decoding: 'async',
          loading: p.loading === 'eager' ? 'eager' : 'lazy',
          fetchpriority: p.loading === 'eager' ? 'high' : 'auto',
          width: '1920', height: '1080'
        });
        pic.appendChild(img);
        media.appendChild(pic);
      }
      var video = this._video = el('video', 'ch-video', {
        muted: '', playsinline: '', 'webkit-playsinline': '', loop: '',
        preload: 'none', disablepictureinpicture: '', disableremoteplayback: '',
        tabindex: '-1'
      });
      video.muted = true;          // attribute alone is not enough for autoplay
      video.defaultMuted = true;
      video.playsInline = true;
      media.appendChild(video);
      media.appendChild(el('div', 'ch-overlay'));
      media.appendChild(el('div', 'ch-progress'));
      this.appendChild(media);

      // Content layer — real, selectable, accessible HTML.
      var inner = el('div', 'ch-inner');
      var content = el('div', 'ch-content');
      if (p.eyebrow) { var eb = el('p', 'ch-eyebrow'); eb.textContent = p.eyebrow; content.appendChild(eb); }
      if (p.heading) { var h = el('h' + p.headingLevel, 'ch-heading'); h.textContent = p.heading; content.appendChild(h); }
      if (p.description) { var d = el('p', 'ch-description'); d.textContent = p.description; content.appendChild(d); }
      if (p.primary || p.secondary) {
        var actions = el('div', 'ch-actions');
        if (p.primary) { var b1 = el('a', 'btn btn-primary', { href: p.primary.href }); b1.textContent = p.primary.label; actions.appendChild(b1); }
        if (p.secondary) { var b2 = el('a', 'btn btn-ghost', { href: p.secondary.href }); b2.textContent = p.secondary.label; actions.appendChild(b2); }
        content.appendChild(actions);
      }
      inner.appendChild(content);
      this.appendChild(inner);

      // Pause/play control (WCAG 2.2.2) — hidden until a video is involved.
      var toggle = this._toggle = el('button', 'ch-toggle', { type: 'button', hidden: '' });
      toggle.addEventListener('click', this._onToggle.bind(this), { signal: this._abort.signal });
      this.appendChild(toggle);

      this._bindVideo();
      this._built = true;
      this._setState('idle');

      this._mode = this._decideMode();
      if (this._mode === 'none') { this._setState('poster'); return; }
      if (this._mode === 'manual') { this._setState('poster'); this._showToggle(false); }

      instances.set(this, this);
      observers();
      if (!nearObserver) { this._inView = true; this._attachSource(); this._sync(); return; }
      if (p.loading === 'eager') this._attachSource();
      nearObserver.observe(this);
      viewObserver.observe(this);
    }

    /** auto = autoplay | manual = poster + play button | none = poster only */
    _decideMode() {
      var p = this._p;
      if (!p.src) return 'none';
      if (networkTier() === 'none') return 'none';
      if (!p.mobileVideo && mq(MOBILE_MQ)) return 'none';
      if (mq('(prefers-reduced-motion: reduce)')) return 'manual';
      return 'auto';
    }

    _bindVideo() {
      var v = this._video, self = this, opt = { signal: this._abort.signal };
      v.addEventListener('playing', function () {
        self._clearStall();
        if (!self._wanted()) { v.pause(); return; } // scrolled away while starting
        self._setState('playing');
      }, opt);
      v.addEventListener('pause', function () { if (self._state === 'playing') self._setState('paused'); }, opt);
      v.addEventListener('waiting', function () { self.classList.add('is-buffering'); }, opt);
      v.addEventListener('canplay', function () { self.classList.remove('is-buffering'); }, opt);
      v.addEventListener('error', function () { self._fail('error'); }, opt);
    }

    _attachSource() {
      // Only 'auto' fetches; 'manual' waits for the play button (sets 'auto').
      if (this._attached || !this._video || this._mode !== 'auto') return;
      var p = this._p;
      var useSd = mq(SD_MQ) || networkTier() === 'slow';
      var src = useSd ? p.srcSd : p.src;
      if (this._video.canPlayType && !this._video.canPlayType('video/mp4')) { this._fail('unsupported'); return; }
      this._attached = true;
      this._video.preload = this._p.loading === 'eager' ? 'auto' : 'metadata';
      this._video.src = src;
      if (nearObserver) nearObserver.unobserve(this);
      this._sync();
    }

    /** Reconcile desired vs. actual playback. Called on every state change. */
    _sync() {
      if (!this._attached || this._failed) return;
      var want = this._wanted();
      var v = this._video;
      if (want && v.paused) {
        if (this._state !== 'playing') this._setState('loading');
        this._armStall();
        var pr = v.play();
        var self = this;
        if (pr && pr.catch) pr.catch(function (err) {
          if (err && err.name === 'AbortError') return; // superseded by a pause
          if (self._failed || !self._video) return;      // error/teardown already handled
          if (err && err.name === 'NotSupportedError') { self._fail('unsupported'); return; }
          // Autoplay blocked (e.g. iOS Low Power Mode): keep poster, offer play.
          self._clearStall();
          self._mode = 'manual';
          self._setState('poster');
          self._showToggle(false);
        });
      } else if (!want) {
        this._clearStall();
        // Also cancels a play() still pending (its promise rejects with AbortError).
        if (!v.paused || this._state === 'loading') v.pause();
        if (this._state === 'loading') this._setState('idle');
      }
    }

    _wanted() {
      return this._mode === 'auto' && this._inView && !this._userPaused && !document.hidden;
    }

    _onToggle() {
      if (this._failed) return;
      var v = this._video;
      if (!v.paused) {
        this._userPaused = true;
        v.pause();
        this._setState('paused');
      } else {
        this._userPaused = false;
        this._mode = 'auto';
        if (!this._attached) this._attachSource();
        this._inView = true;
        this._sync();
      }
    }

    _armStall() {
      var self = this;
      this._clearStall();
      this._stall = setTimeout(function () {
        if (self._state !== 'playing') self._fail('stalled');
      }, STALL_TIMEOUT_MS);
    }

    _clearStall() { if (this._stall) { clearTimeout(this._stall); this._stall = null; } }

    _fail(reason) {
      if (this._failed) return;
      this._failed = true;
      this._clearStall();
      this._releaseVideo();
      this._setState('fallback');
      if (this._toggle) this._toggle.hidden = true;
      this.dataset.fallbackReason = reason;
    }

    _setState(s) {
      this._state = s;
      this.dataset.state = s;
      this.classList.toggle('is-loading', s === 'loading');
      this.classList.toggle('is-playing', s === 'playing' || s === 'paused');
      if (s === 'playing') this._showToggle(true);
      if (s === 'paused') this._showToggle(false);
    }

    _showToggle(playing) {
      var t = this._toggle;
      if (!t) return;
      t.hidden = false;
      t.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      t.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
      t.setAttribute('aria-pressed', playing ? 'false' : 'true');
    }

    /* ---------------- cleanup ---------------- */

    _releaseVideo() {
      var v = this._video;
      if (!v) return;
      try { v.pause(); } catch (e) { /* noop */ }
      v.removeAttribute('src');
      try { v.load(); } catch (e) { /* frees the decoder + buffer */ }
    }

    _teardown() {
      this._clearStall();
      if (nearObserver) { nearObserver.unobserve(this); viewObserver.unobserve(this); }
      instances.delete(this);
      if (this._abort) this._abort.abort();
      this._releaseVideo();
      this._video = null;
      this._toggle = null;
      this._attached = false;
      this._failed = false;
      this._built = false;
    }
  }

  /** Factory for programmatic use. */
  CinematicHero.create = function (props) {
    var n = document.createElement('cinematic-hero');
    n.config = props;
    return n;
  };

  if (!customElements.get('cinematic-hero')) customElements.define('cinematic-hero', CinematicHero);
  global.CinematicHero = CinematicHero;
})(window);
