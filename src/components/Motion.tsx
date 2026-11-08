'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { animate, createDrawable, createScope, onScroll, splitText, stagger, utils } from 'animejs';

/*
 * The clinic's motion. Lenis gives the page its weighted, unhurried scroll; anime.js does the rest,
 * driven by data attributes so pages stay server components:
 *
 *   [data-split]      a heading rises word by word from a clipped line (the hero's plays at once)
 *   [data-reveal]     fades up as it enters; [data-stagger] does the same for its children in turn
 *   [data-unveil]     a picture opens from the bottom like a curtain, and settles from a slight zoom
 *   [data-parallax=n] drifts against the scroll by n of its height, scrubbed to the scroll
 *   [data-words]      a statement whose words light up one by one as it is read
 *   [data-draw]       SVG paths inside draw themselves along the scroll (gold threads)
 *   [data-count]      a number counts up when it comes into view
 *   [data-marquee]    an endless band whose speed follows the scroll's velocity
 *
 * Content is hidden only once <html> has the "anim" class, which an inline script adds before the
 * first paint when motion is allowed: without JavaScript, or with reduced motion, every page is
 * complete and still.
 */

export const ANIM_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim')}catch(e){}`;

declare global { interface Window { __lenis?: Lenis } }

const EASE = 'outExpo';

/** Nothing must stay hidden: if an entrance has not run well after it should, show the element. */
function failsafe(els: Element[], ms = 4000) {
  return window.setTimeout(() => els.forEach((el) => {
    const h = el as HTMLElement;
    if (getComputedStyle(h).opacity === '0') { h.style.opacity = '1'; h.style.transform = 'none'; }
  }), ms);
}

export function Motion() {
  const path = usePathname();

  // Lenis, once for the life of the app
  useEffect(() => {
    if (!document.documentElement.classList.contains('anim')) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false, anchors: { offset: -96 } });
    window.__lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    // menus and the booking sheet lock the page with a class on <html>; Lenis follows
    const root = document.documentElement;
    const mo = new MutationObserver(() => (root.classList.contains('is-locked') ? lenis.stop() : lenis.start()));
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); lenis.destroy(); window.__lenis = undefined; };
  }, []);

  // each new page starts at the top, without gliding there from the last one
  useEffect(() => { window.__lenis?.scrollTo(0, { immediate: true, force: true }); }, [path]);

  // the page's choreography
  useEffect(() => {
    if (!document.documentElement.classList.contains('anim')) return;
    const timers: number[] = [];
    const stops: (() => void)[] = [];
    const scope = createScope({ root: document.body }).add(() => {
      const $ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T & Element>(s)] as T[];

      $('[data-split]').forEach((h, i) => {
        const { words } = splitText(h, { words: { wrap: 'clip' } });
        const now = h.hasAttribute('data-now');
        animate(words, {
          y: ['110%', '0%'], rotate: [3, 0], duration: 1400, ease: EASE,
          delay: stagger(60, { start: now ? 250 + i * 80 : 0 }),
          autoplay: now ? true : onScroll({ target: h, enter: '92% top', repeat: false }),
        });
        h.style.visibility = 'visible';
      });

      const reveals = $('[data-reveal]');
      reveals.forEach((el) => {
        const now = el.hasAttribute('data-now');
        animate(el, {
          opacity: [0, 1], y: [36, 0], duration: 1300, ease: EASE, delay: Number(el.dataset.delay || 0) + (now ? 500 : 0),
          autoplay: now ? true : onScroll({ target: el, enter: '90% top', repeat: false }),
        });
      });
      const staggers = $('[data-stagger]');
      staggers.forEach((list) => {
        animate(list.children, {
          opacity: [0, 1], y: [40, 0], duration: 1200, ease: EASE, delay: stagger(90),
          autoplay: onScroll({ target: list, enter: '88% top', repeat: false }),
        });
      });
      timers.push(failsafe([...reveals, ...staggers.flatMap((s) => [...s.children])]));

      $('[data-unveil]').forEach((el) => {
        const img = el.querySelector('img, video');
        const now = el.hasAttribute('data-now');
        const play = now ? true : onScroll({ target: el, enter: '85% top', repeat: false });
        animate(el, { clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], duration: 1800, delay: now ? 300 : 0, ease: 'inOutQuart', autoplay: play });
        if (img) animate(img, { scale: [1.25, 1], duration: 2400, delay: now ? 300 : 0, ease: EASE, autoplay: now ? true : onScroll({ target: el, enter: '85% top', repeat: false }) });
      });

      $('[data-parallax]').forEach((el) => {
        const amt = Number(el.dataset.parallax || 0.12) * 100;
        animate(el, { y: [`${-amt}%`, `${amt}%`], ease: 'linear', autoplay: onScroll({ target: el.parentElement ?? el, enter: 'bottom top', leave: 'top bottom', sync: 0.25 }) });
      });

      $('[data-words]').forEach((el) => {
        const { words } = splitText(el, { words: true });
        animate(words, {
          opacity: [0.14, 1], ease: 'linear', delay: stagger(40),
          autoplay: onScroll({ target: el, enter: '80% top', leave: '35% bottom', sync: 0.4 }),
        });
      });

      $('[data-draw]').forEach((svgEl) => {
        const paths = createDrawable(svgEl.querySelectorAll('path, line, polyline, circle'));
        const scrub = svgEl.dataset.draw === 'scrub';
        animate(paths, {
          draw: ['0 0', '0 1'], ease: scrub ? 'linear' : 'inOutQuad', duration: scrub ? 1000 : 2600, delay: scrub ? 0 : stagger(200),
          autoplay: scrub
            ? onScroll({ target: svgEl, enter: '90% top', leave: '30% bottom', sync: 0.5 })
            : onScroll({ target: svgEl, enter: '90% top', repeat: false }),
        });
      });

      $('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count);
        const n = { v: 0 };
        el.textContent = '0';
        animate(n, {
          v: to, duration: 2200, ease: 'outQuart', modifier: utils.round(0),
          onUpdate: () => { el.textContent = String(n.v); },
          autoplay: onScroll({ target: el, enter: '90% top', repeat: false }),
        });
      });

      // [data-rail]: a tall section whose sticky track slides sideways as it is scrolled through
      if (matchMedia('(min-width: 900px)').matches) {
        $('[data-rail]').forEach((rail) => {
          const p = { v: 0 };
          animate(p, {
            v: [0, 1], ease: 'linear', duration: 1000,
            onUpdate: () => rail.style.setProperty('--p', p.v.toFixed(4)),
            autoplay: onScroll({ target: rail, enter: 'top top', leave: 'bottom bottom', sync: 0.35 }),
          });
          stops.push(() => rail.style.removeProperty('--p'));
        });
      }

      // the marquee runs on its own and leans into the scroll: faster as you scroll, reversing with it
      $('[data-marquee]').forEach((band) => {
        const track = band.firstElementChild as HTMLElement | null;
        if (!track) return;
        let x = 0, boost = 0, live = true;
        const base = Number(band.dataset.marquee || 0.35);
        const tick = () => {
          if (!live) return;
          const v = window.__lenis?.velocity ?? 0;
          boost += (v * 0.12 - boost) * 0.08;
          x -= base + boost;
          const w = track.scrollWidth / 2;
          if (x <= -w) x += w;
          if (x > 0) x -= w;
          track.style.transform = `translate3d(${x}px,0,0)`;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        stops.push(() => { live = false; track.style.transform = ''; });
      });
    });
    return () => { timers.forEach(clearTimeout); stops.forEach((s) => s()); scope.revert(); };
  }, [path]);

  return null;
}
