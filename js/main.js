(function () {
  'use strict';

  /* NodeList helper — older browsers lacking IntersectionObserver also lack
     NodeList.forEach, and this file must never throw in them */
  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  /* Header: solid background once the page is scrolled */
  var header = document.querySelector('[data-header]');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
  if ('IntersectionObserver' in window) {
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

  /* Moments gallery: hide any photo that has not been added yet; hide the
     whole section while it has no photos to show */
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
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
    if (liveCount === 0) moments.style.display = 'none';
  }

  /* Footer year */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
