'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { animate, createScope, onScroll, splitText, stagger, utils } from 'animejs';

/*
 * The clinic's motion: Lenis for a weighted, unhurried scroll, and anime.js for a few authored
 * moments, driven by data attributes so pages stay server components.
 *
 *   [data-hero]       the signature: the photograph opens from an inset frame to the full screen
 *                     as the page is scrolled, and its caption arrives
 *   [data-fill]       a sentence whose words fill in from grey to ink as it is read
 *   [data-reveal]     fades up once as it arrives; [data-stagger] does the same for its children
 *   [data-now]        plays on load instead of on arrival (the opening headline)
 *   [data-parallax=n] drifts by n of its height across the scroll
 *   [data-count]      a number counts up once
 *
 * Content is hidden only once <html> has the "anim" class, which an inline script adds before
 * the first paint when motion is allowed. Without JavaScript, or with reduced motion, every page
 * is complete and still.
 */

export const ANIM_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim')}catch(e){}`;

declare global { interface Window { __lenis?: Lenis } }

const EASE = 'outExpo';

export function Motion() {
  const path = usePathname();

  useEffect(() => {
    if (!document.documentElement.classList.contains('anim')) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false, anchors: { offset: -70 } });
    window.__lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    const root = document.documentElement;
    const mo = new MutationObserver(() => (root.classList.contains('is-locked') ? lenis.stop() : lenis.start()));
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => { cancelAnimationFrame(raf); mo.disconnect(); lenis.destroy(); window.__lenis = undefined; };
  }, []);

  useEffect(() => { window.__lenis?.scrollTo(0, { immediate: true, force: true }); }, [path]);

  useEffect(() => {
    if (!document.documentElement.classList.contains('anim')) return;
    const all = <T extends HTMLElement = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
    const scope = createScope({ root: document.body }).add(() => {
      all('[data-reveal]').forEach((el) => {
        const now = el.hasAttribute('data-now');
        animate(el, {
          opacity: [0, 1], y: [now ? 18 : 30, 0], duration: now ? 1400 : 1200, ease: EASE, delay: Number(el.dataset.delay || 0),
          autoplay: now ? true : onScroll({ target: el, enter: '92% top', repeat: false }),
        });
      });
      all('[data-stagger]').forEach((list) => {
        animate(list.children, {
          opacity: [0, 1], y: [36, 0], duration: 1200, ease: EASE, delay: stagger(80),
          autoplay: onScroll({ target: list, enter: '90% top', repeat: false }),
        });
      });

      // the signature: the photograph opens to the edges of the screen, then the caption arrives
      const stage = document.querySelector<HTMLElement>('[data-hero]');
      if (stage && matchMedia('(min-width: 761px)').matches) {
        const p = { v: 0 };
        const set = () => {
          const v = p.v, e = 1 - Math.pow(1 - v, 2);
          stage.style.setProperty('--inset-x', `${12 * (1 - e)}%`);
          stage.style.setProperty('--inset-y', `${9 * (1 - e)}%`);
          stage.style.setProperty('--r', `${28 * (1 - e)}px`);
          stage.style.setProperty('--zoom', `${1.12 - 0.12 * e}`);
          stage.style.setProperty('--cap', `${utils.clamp((v - 0.7) / 0.3, 0, 1)}`);
        };
        set();
        animate(p, {
          v: [0, 1], ease: 'linear', duration: 1000, onUpdate: set,
          autoplay: onScroll({ target: stage, enter: 'bottom top', leave: 'top -45%', sync: 0.2 }),
        });
      }

      all('[data-fill]').forEach((el) => {
        const { words } = splitText(el, { words: { class: 'w' } });
        animate(words, {
          opacity: [0.18, 1], ease: 'linear', delay: stagger(30),
          autoplay: onScroll({ target: el, enter: '82% top', leave: '45% bottom', sync: 0.3 }),
        });
      });

      all('[data-parallax]').forEach((el) => {
        const amt = Number(el.dataset.parallax || 0.06) * 100;
        animate(el, { y: [`${-amt}%`, `${amt}%`], ease: 'linear', autoplay: onScroll({ target: el.parentElement ?? el, enter: 'bottom top', leave: 'top bottom', sync: 0.25 }) });
      });

      all('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count);
        const n = { v: 0 };
        el.textContent = '0';
        animate(n, { v: to, duration: 1800, ease: 'outQuart', modifier: utils.round(0), onUpdate: () => { el.textContent = String(n.v); },
          autoplay: onScroll({ target: el, enter: '92% top', repeat: false }) });
      });
    });

    // nothing may stay hidden: anything still invisible well after it should have arrived is shown
    const safety = window.setTimeout(() => all('[data-reveal], [data-stagger] > *').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight && getComputedStyle(el).opacity === '0') { el.style.opacity = '1'; el.style.transform = 'none'; }
    }), 3500);
    return () => { window.clearTimeout(safety); scope.revert(); };
  }, [path]);

  return null;
}
