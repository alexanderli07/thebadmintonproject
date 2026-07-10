(function () {
  'use strict';

  var docEl = document.documentElement;
  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_IO = 'IntersectionObserver' in window;

  /* NodeList helper — older browsers lacking IntersectionObserver also lack
     NodeList.forEach, and this file must never throw in them */
  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  /* Small observer factory: adds a class once when an element enters view;
     falls back to applying it immediately when IO is unavailable */
  function onceInView(elements, className, threshold, beforeAdd) {
    if (!HAS_IO) {
      each(elements, function (el) { el.classList.add(className); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          if (beforeAdd) beforeAdd(entry.target);
          else entry.target.classList.add(className);
        }
      });
    }, { threshold: threshold });
    each(elements, function (el) { io.observe(el); });
  }

  /* ==================== The Overture: entrance choreography ==================== */

  var heroServeEls = document.querySelectorAll('.hero .ornament[data-serve], .page-hero .ornament[data-serve]');

  function skipEntrance() {
    docEl.classList.remove('entering');
    each(heroServeEls, function (el) { el.classList.add('is-served'); });
  }

  if (docEl.classList.contains('entering')) {
    if (REDUCED || window.scrollY > window.innerHeight * 0.4) {
      /* reduced motion (stale cache) or arrived mid-page: no ceremony */
      skipEntrance();
    } else {
      docEl.style.setProperty('--hdr-delay', document.querySelector('.page-hero') ? '0.9s' : '1.9s');
      try {
        if (!sessionStorage.getItem('tbp-hdr')) {
          docEl.classList.add('hdr-enter');
          sessionStorage.setItem('tbp-hdr', '1');
        }
      } catch (err) {}
      var entered = false;
      var enterNow = function () {
        if (entered) return;
        entered = true;
        requestAnimationFrame(function () { docEl.classList.add('entered'); });
        var serveDelay = document.querySelector('.page-hero') ? 550 : 1400;
        setTimeout(function () {
          each(heroServeEls, function (el) { el.classList.add('is-served'); });
        }, serveDelay);
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(enterNow, enterNow);
      setTimeout(enterNow, 600); /* never gate the page on a slow font */
    }
  }

  /* Page-transition arrival: clear the veil class once its animation is done */
  if (docEl.classList.contains('pt-in')) {
    setTimeout(function () { docEl.classList.remove('pt-in'); }, 900);
  }

  /* Header: solid background once the page is scrolled */
  var header = document.querySelector('[data-header]');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Scroll progress hairline */
  var progress = document.querySelector('[data-progress]');
  if (progress) {
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)).toFixed(4) + ')';
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  /* Mobile menu */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  function setPageInert(on) {
    var regions = [document.getElementById('main'), document.querySelector('.site-footer')];
    for (var i = 0; i < regions.length; i++) {
      var region = regions[i];
      if (!region) continue;
      if ('inert' in region) region.inert = on;
      if (on) region.setAttribute('aria-hidden', 'true');
      else region.removeAttribute('aria-hidden');
    }
  }

  function setMenuOpen(open) {
    if (!toggle || !menu) return;
    if (menu.classList.contains('is-open') === open) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    setPageInert(open);
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      toggle.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    each(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () { setMenuOpen(false); });
    });
    var brand = document.querySelector('.brand');
    if (brand) brand.addEventListener('click', function () { setMenuOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenuOpen(false);
    });
    /* Close if the viewport grows past the breakpoint that hides the toggle */
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 1001px)');
      var onBreakpoint = function (e) { if (e.matches) setMenuOpen(false); };
      if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
      else if (mq.addListener) mq.addListener(onBreakpoint);
    }
  }

  /* Scroll reveal.
     Once an element has finished its entrance, the reveal classes are removed
     entirely — the `html.js .reveal` transition would otherwise out-specify
     component hover transitions (.program, .btn) for the life of the page. */
  function releaseReveal(el) {
    el.classList.remove('reveal');
    el.classList.remove('is-visible');
    el.style.removeProperty('--d');
  }

  function revealEl(el) {
    el.classList.add('is-visible');
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      releaseReveal(el);
    }
    el.addEventListener('transitionend', function handler(e) {
      if (e.target === el && e.propertyName === 'opacity') {
        el.removeEventListener('transitionend', handler);
        finish();
      }
    });
    setTimeout(finish, 1600); /* fallback: 0.9s transition + max 0.4s delay + slack */
  }

  var revealEls = document.querySelectorAll('.reveal');
  if (HAS_IO) {
    var io = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) {
          io.unobserve(entry.target);
          revealEl(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    each(revealEls, function (el) { io.observe(el); });
  } else {
    each(revealEls, releaseReveal);
  }

  /* ==================== Anchor navigation ==================== */

  /* Land anchored sections fully in view (so e.g. the Join button is visible
     immediately on any screen height) and play their reveals right away */
  var HEADER_OFFSET = 96;

  function sectionScrollTop(el) {
    var top = el.getBoundingClientRect().top + window.scrollY;
    var bottom = top + el.offsetHeight;
    if (el.offsetHeight <= window.innerHeight - HEADER_OFFSET) {
      /* the section fits below the header: bottom-align it */
      return Math.max(0, bottom - window.innerHeight);
    }
    return Math.max(0, top - HEADER_OFFSET);
  }

  function revealSection(el) {
    each(el.querySelectorAll('.reveal'), function (r) { revealEl(r); });
  }

  each(document.querySelectorAll('a[href^="#"]'), function (link) {
    var id = link.getAttribute('href').slice(1);
    if (!id || id === 'top' || id === 'main') return; /* keep native skip/top behaviour */
    link.addEventListener('click', function (e) {
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: sectionScrollTop(target), behavior: REDUCED ? 'auto' : 'smooth' });
      revealSection(target);
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  });

  if (location.hash && location.hash.length > 1) {
    var hashTarget = document.getElementById(location.hash.slice(1));
    if (hashTarget && location.hash !== '#top' && location.hash !== '#main') {
      /* after the browser's own hash jump: re-align so the section's end
         (e.g. the Join button) is on screen, and play its reveals */
      setTimeout(function () {
        window.scrollTo(0, sectionScrollTop(hashTarget));
        revealSection(hashTarget);
      }, 80);
    }
  }

  /* ==================== Signature scroll moments ==================== */

  if (!REDUCED) {
    /* The serve: ornaments outside the heroes assemble when they scroll in */
    var scrollServe = [];
    each(document.querySelectorAll('[data-serve]'), function (el) {
      if (el.closest && (el.closest('.hero') || el.closest('.page-hero'))) return; /* timed by the overture */
      scrollServe.push(el);
    });
    onceInView(scrollServe, 'is-served', 0.5);

    /* Chalk lines: structural rules draw themselves */
    onceInView(document.querySelectorAll('.values li, .course, .coach-ach, .footer-grid, .program-rule'), 'is-ruled', 0.2);

    /* The steward's stamp: quote-band signature settles in */
    onceInView(document.querySelectorAll('.band figcaption'), 'is-stamped', 0.6);

    /* Framing the moment: inject a drawable gold frame around each print */
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var momentFigs = document.querySelectorAll('.moment');
    each(momentFigs, function (fig) {
      var svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'frame');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      var rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', '0.5');
      rect.setAttribute('y', '0.5');
      rect.setAttribute('width', '99');
      rect.setAttribute('height', '99');
      rect.setAttribute('pathLength', '1');
      rect.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(rect);
      fig.appendChild(svg);
      fig.classList.add('has-frame');
    });
    onceInView(momentFigs, 'is-framed', 0.3);

    /* Scoreboard roll: 01/02/03 roll up like manual scoreboard plates */
    each(document.querySelectorAll('.program-no'), function (el, idx) {
      var target = el.textContent.replace(/\s+/g, '');
      if (!/^\d{2}$/.test(target)) return;
      var prev = ('0' + idx).slice(-2);
      var markup = '';
      for (var d = 0; d < 2; d++) {
        markup += '<span class="roll"><span class="roll-track"><span>' + prev.charAt(d) + '</span><span>' + target.charAt(d) + '</span></span></span>';
      }
      el.innerHTML = markup;
    });
    onceInView(document.querySelectorAll('.program'), 'x-roll', 0.3, function (card) {
      var numeral = card.querySelector('.program-no');
      if (numeral) setTimeout(function () { numeral.classList.add('is-rolled'); }, 350);
    });
  }

  /* ==================== Changing ends: page transitions ==================== */

  if (!REDUCED) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!link || link.target || link.hasAttribute('download')) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return; /* in-page anchor */
      e.preventDefault();
      try { sessionStorage.setItem('tbp-nav', '1'); } catch (err) {}
      docEl.classList.add('pt-out');
      setTimeout(function () { location.href = url.href; }, 300);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        docEl.classList.remove('pt-out');
        docEl.classList.remove('pt-in');
      }
    });
  }

  /* ==================== Moments gallery ==================== */

  /* Hide any photo that has not been added yet (and the whole section when it
     has none); develop each print in as it loads */
  var moments = document.querySelector('[data-moments]');
  if (moments) {
    var figures = moments.querySelectorAll('figure');
    var liveCount = figures.length;
    each(figures, function (figure) {
      var img = figure.querySelector('img');
      if (!img) return;
      var retried = false;
      function fail() {
        if (!retried) {
          /* one cache-busted retry, in case the browser cached a miss from
             before the photo file was added */
          retried = true;
          img.src = img.getAttribute('src').split('?')[0] + '?retry=1';
          return;
        }
        figure.style.display = 'none';
        liveCount--;
        if (liveCount === 0) moments.style.display = 'none';
      }
      function develop() { img.classList.add('is-developed'); }
      img.addEventListener('error', fail);
      img.addEventListener('load', develop);
      if (img.complete && img.naturalWidth === 0) fail();
      else if (img.complete && img.naturalWidth > 0) develop();
    });
  }

  /* ==================== Parallax ==================== */

  /* Layered scroll depth on the green sections. 'top' mode drifts hero-level
     elements relative to page scroll; 'center' mode drifts elements relative
     to their distance from the viewport center. Targets are never .reveal
     elements, so the two transforms cannot fight. */
  if (!REDUCED) {
    var targets = [];
    var addParallax = function (selector, factor, mode, base, cap) {
      each(document.querySelectorAll(selector), function (el) {
        el.style.willChange = 'transform';
        targets.push({ el: el, factor: factor, mode: mode, base: base || '', cap: cap || 0, applied: 0 });
      });
    };
    addParallax('.hero-inner', 0.28, 'top');
    addParallax('.hero-court', 0.14, 'top', 'translate(-50%, -50%)');
    addParallax('.page-hero .container', 0.26, 'top');
    addParallax('.page-court', 0.12, 'top', 'translate(-50%, -50%)');
    addParallax('.band blockquote', -0.12, 'center', '', 44);
    addParallax('.moments-grid', 0.11, 'center', '', 56);
    addParallax('.gallery-grid', 0.09, 'center', '', 48);

    if (targets.length) {
      var ticking = false;
      var applyParallax = function () {
        ticking = false;
        var vh = window.innerHeight;
        for (var i = 0; i < targets.length; i++) {
          var t = targets[i];
          var y;
          if (t.mode === 'top') {
            if (window.scrollY > vh * 1.6) continue; /* long gone off-screen */
            y = window.scrollY * t.factor;
          } else {
            var rect = t.el.getBoundingClientRect();
            /* subtract what we already applied so the layout position drives it */
            var centerOffset = (rect.top - t.applied + rect.height / 2) - vh / 2;
            y = centerOffset * t.factor;
            if (t.cap) y = Math.max(-t.cap, Math.min(t.cap, y));
          }
          t.applied = y;
          t.el.style.transform = (t.base ? t.base + ' ' : '') + 'translateY(' + y.toFixed(1) + 'px)';
        }
      };
      var queueParallax = function () {
        if (!ticking) { ticking = true; requestAnimationFrame(applyParallax); }
      };
      applyParallax();
      window.addEventListener('scroll', queueParallax, { passive: true });
      window.addEventListener('resize', queueParallax);
    }
  }

  /* ==================== Hero media ==================== */

  /* Background video when assets/video/hero.mp4 exists, otherwise an animated
     shuttlecock rally line drawn on canvas */
  var heroMedia = document.querySelector('[data-hero-media]');
  if (heroMedia) {
    var video = heroMedia.querySelector('[data-hero-video]');
    var canvas = heroMedia.querySelector('[data-rally]');
    if (REDUCED) {
      if (video) video.remove();
      if (canvas) canvas.remove();
    } else {
      var rallyStarted = false;
      var startRally = function () {
        if (rallyStarted || !canvas || heroMedia.classList.contains('has-video')) return;
        rallyStarted = true;
        initRally(canvas, heroMedia);
      };
      var useVideo = function () {
        heroMedia.classList.add('has-video');
        var playing = video.play();
        if (playing && playing.catch) playing.catch(function () {});
      };
      if (video) {
        var source = video.querySelector('source');
        var onFail = function () { video.remove(); startRally(); };
        if (source) source.addEventListener('error', onFail);
        video.addEventListener('error', onFail);
        video.addEventListener('canplay', useVideo);
        if (video.readyState >= 3) useVideo();
        /* if the video hasn't shown up quickly, draw the rally in the meantime */
        setTimeout(startRally, 700);
      } else {
        startRally();
      }
    }
  }

  function initRally(canvas, media) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function resize() {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.max(1, W * dpr);
      canvas.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var GOLD = '#C9A649';
    var TRAIL_MS = 1500;
    var trail = [];
    var shot = null;
    var fromLeft = true;
    var pauseUntil = 0;
    var visible = true;

    if (HAS_IO) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(canvas);
    }

    function newShot(t) {
      var xa = fromLeft ? W * 0.10 : W * 0.90;
      var xb = fromLeft ? W * (0.60 + Math.random() * 0.30) : W * (0.10 + Math.random() * 0.30);
      var ya = H * (0.50 + Math.random() * 0.30);
      var yb = H * (0.50 + Math.random() * 0.30);
      fromLeft = !fromLeft;
      return {
        xa: xa, ya: ya, xb: xb, yb: yb,
        cx: (xa + xb) / 2,
        cy: H * (0.14 + Math.random() * 0.22),
        dur: 1500 + Math.random() * 800,
        start: t
      };
    }

    function frame(t) {
      if (media.classList.contains('has-video')) {
        ctx.clearRect(0, 0, W, H); /* video took over — stop drawing */
        return;
      }
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      if (!shot && t > pauseUntil) shot = newShot(t);
      if (shot) {
        var k = Math.min(1, (t - shot.start) / shot.dur);
        var inv = 1 - k;
        trail.push({
          x: inv * inv * shot.xa + 2 * inv * k * shot.cx + k * k * shot.xb,
          y: inv * inv * shot.ya + 2 * inv * k * shot.cy + k * k * shot.yb,
          t: t
        });
        if (k === 1) {
          shot = null;
          pauseUntil = t + 280 + Math.random() * 320;
        }
      }
      while (trail.length && t - trail[0].t > TRAIL_MS) trail.shift();

      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      for (var i = 1; i < trail.length; i++) {
        ctx.globalAlpha = (1 - (t - trail[i].t) / TRAIL_MS) * 0.5;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
      if (shot && trail.length) {
        var head = trail[trail.length - 1];
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = GOLD;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }

  /* Footer year */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
