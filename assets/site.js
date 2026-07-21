/* ============================================================
   HONDA · Advisor — shared script for index.html and cars.html
   Vanilla JS, no dependencies. Every feature is guarded by an
   element check so both pages can load the same file. All
   content works without JS; scripts only add reveals, the
   calculator, the model accordion, and WhatsApp prefills.
============================================================ */

/* Mark JS as available: reveal + accordion collapse styles
   only apply under html.js */
document.documentElement.classList.add('js');

/* ---------- WhatsApp helper ----------
   International format without plus or spaces. */
function buildWhatsAppLink(message) {
  const phone = '60111133316';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/* Rebuild static .wa-link hrefs through the helper so the message
   and number stay in one place. Static hrefs remain as no-JS fallback. */
document.querySelectorAll('.wa-link[data-wa-msg]').forEach(a => {
  a.href = buildWhatsAppLink(a.dataset.waMsg);
});

/* ---------- Scroll reveal ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    /* Model cards entering in the same frame get a short stagger so the list
       reads as a sequence, not a block. Elements with an authored --rd keep it. */
    let batch = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.classList.contains('acc-item') && !el.style.getPropertyValue('--rd')) {
          el.style.transitionDelay = Math.min(batch++ * 70, 280) + 'ms';
          el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
        }
        el.classList.add('is-visible');
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
}

/* ---------- Scroll progress line ---------- */
const progress = document.getElementById('progress');
if (progress) {
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ---------- FAQ accordion: single-open + smooth height animation ----------
   Ports the reference Faq5 `type="single" collapsible` behavior onto the
   native <details> list. Only one item open at a time; opening one glides
   the previous one closed. Height is tweened from the measured scrollHeight
   so both open and close animate (native <details> would snap). Works as a
   plain multi-open list if JS is off (no listener attached). */
document.querySelectorAll('[data-faq-accordion]').forEach(group => {
  const items = Array.from(group.querySelectorAll('details.faq-item'));
  const panelOf = it => it.querySelector('.faq-a');

  function openItem(it) {
    const p = panelOf(it);
    p.ontransitionend = null;
    it.open = true; // reveal content (also a11y + no-JS parity)
    if (reduceMotion) { p.style.height = 'auto'; p.style.opacity = '1'; return; }
    p.style.height = p.scrollHeight + 'px';
    p.style.opacity = '1';
    p.ontransitionend = e => {
      if (e.propertyName !== 'height') return;
      p.style.height = 'auto'; // let it flex after the tween
      p.ontransitionend = null;
    };
  }

  function closeItem(it) {
    const p = panelOf(it);
    p.ontransitionend = null;
    if (reduceMotion) { p.style.height = '0px'; p.style.opacity = '0'; it.open = false; return; }
    p.style.height = p.scrollHeight + 'px'; // from auto -> fixed px so it can tween
    // next frame: collapse to 0
    requestAnimationFrame(() => {
      p.style.height = '0px';
      p.style.opacity = '0';
    });
    p.ontransitionend = e => {
      if (e.propertyName !== 'height') return;
      it.open = false; // hide once collapsed
      p.ontransitionend = null;
    };
  }

  items.forEach(it => {
    it.querySelector('summary').addEventListener('click', e => {
      e.preventDefault(); // take over from native instant toggle
      if (it.open) {
        closeItem(it);
      } else {
        items.forEach(other => { if (other !== it && other.open) closeItem(other); });
        openItem(it);
      }
    });
  });

  /* Reserve the tallest-open height on desktop so opening/closing a panel
     happens INSIDE a constant-height block — the whole FAQ section no longer
     lurches taller on the first open. Only one panel is ever open, so the max
     content = every summary + the single tallest answer. Recomputed on resize
     (answers wrap differently by width). Cleared below the lg breakpoint,
     where the list stacks full-width and natural growth is expected. */
  function reserveHeight() {
    if (window.innerWidth < 1024) { group.style.minHeight = ''; return; }
    group.style.minHeight = ''; // read natural sizes without our own floor
    const openNow = items.filter(it => it.open);
    openNow.forEach(it => { panelOf(it).style.height = '0px'; }); // collapse to get base
    const base = group.offsetHeight; // all answers collapsed
    let tallest = 0;
    items.forEach(it => {
      const p = panelOf(it), wasOpen = it.open, savedH = p.style.height;
      it.open = true; p.style.height = 'auto';
      if (p.scrollHeight > tallest) tallest = p.scrollHeight;
      p.style.height = savedH; if (!wasOpen) it.open = false;
    });
    openNow.forEach(it => { panelOf(it).style.height = 'auto'; }); // restore
    group.style.minHeight = (base + tallest) + 'px';
  }
  reserveHeight();
  window.addEventListener('load', reserveHeight); // re-measure after fonts settle
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(reserveHeight, 150); });
});

/* ---------- Loan calculator (homepage) ----------
   Malaysian flat-rate estimate:
   loanAmount     = carPrice - downPayment
   totalInterest  = loanAmount * (rate / 100) * tenureYears
   totalPayable   = loanAmount + totalInterest
   monthlyPayment = totalPayable / (tenureYears * 12)          */
const calcModel = document.getElementById('calc-model');
if (calcModel) {
  const calcPrice = document.getElementById('calc-price');
  const calcDown  = document.getElementById('calc-down');
  const calcRate  = document.getElementById('calc-rate');
  const tenureButtons = document.querySelectorAll('.seg button');
  const outMonthly  = document.getElementById('out-monthly');
  const outLoan     = document.getElementById('out-loan');
  const outInterest = document.getElementById('out-interest');
  const outTotal    = document.getElementById('out-total');
  const calcCta     = document.getElementById('calc-cta');

  let tenureYears = 9;

  const fmtRM = n => 'RM ' + Math.round(n).toLocaleString('en-MY');

  function recalc() {
    const price = Math.max(0, parseFloat(calcPrice.value) || 0);
    let down = Math.max(0, parseFloat(calcDown.value) || 0);
    if (down > price) down = price;
    const rate = Math.max(0, parseFloat(calcRate.value) || 0);

    const loanAmount = price - down;
    const totalInterest = loanAmount * (rate / 100) * tenureYears;
    const totalPayable = loanAmount + totalInterest;
    const monthly = tenureYears > 0 ? totalPayable / (tenureYears * 12) : 0;

    outMonthly.textContent = fmtRM(monthly);
    outLoan.textContent = fmtRM(loanAmount);
    outInterest.textContent = fmtRM(totalInterest);
    outTotal.textContent = fmtRM(totalPayable);

    calcCta.href = buildWhatsAppLink(
      `Hi Hakim, I want to confirm my Honda estimate. Model: ${calcModel.value}. ` +
      `Car price: ${fmtRM(price)}. Down payment: ${fmtRM(down)}. ` +
      `Tenure: ${tenureYears} years. Interest rate: ${rate}%. ` +
      `Estimated monthly: ${fmtRM(monthly)}. Please share the latest promo and OTR price.`
    );
  }

  calcModel.addEventListener('change', () => {
    const price = parseFloat(calcModel.selectedOptions[0].dataset.price);
    calcPrice.value = price;
    calcDown.value = Math.round(price * 0.10);
    recalc();
  });
  [calcPrice, calcDown, calcRate].forEach(el => el.addEventListener('input', recalc));
  tenureButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tenureYears = parseInt(btn.dataset.years, 10);
      tenureButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      recalc();
    });
  });
  recalc();
}

/* ---------- Lead form to WhatsApp (homepage) ---------- */
const leadForm = document.getElementById('lead-form');
if (leadForm) {
  const fields = [
    { input: document.getElementById('lead-name'),  error: document.getElementById('err-name') },
    { input: document.getElementById('lead-phone'), error: document.getElementById('err-phone') },
    { input: document.getElementById('lead-model'), error: document.getElementById('err-model') },
  ];

  leadForm.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    fields.forEach(({ input, error }) => {
      const empty = !input.value.trim();
      input.setAttribute('aria-invalid', String(empty));
      error.classList.toggle('hidden', !empty);
      if (empty) valid = false;
    });
    if (!valid) {
      fields.find(f => f.input.getAttribute('aria-invalid') === 'true').input.focus();
      return;
    }

    const name = document.getElementById('lead-name').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const model = document.getElementById('lead-model').value;
    const action = document.getElementById('lead-action').value;
    const note = document.getElementById('lead-message').value.trim();

    let msg = `Hi Hakim, my name is ${name}. Phone: ${phone}. Model of interest: ${model}. I want: ${action}.`;
    if (note) msg += ` Note: ${note}`;

    window.open(buildWhatsAppLink(msg), '_blank', 'noopener');
  });

  fields.forEach(({ input, error }) => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.setAttribute('aria-invalid', 'false');
        error.classList.add('hidden');
      }
    });
  });
}

/* ---------- Model accordion (cars page) ----------
   One panel open at a time. Buttons carry aria-expanded,
   panels are labelled regions. Without JS all panels render
   expanded, so nothing is hidden from no-JS visitors. */
const accItems = document.querySelectorAll('.acc-item');
if (accItems.length) {

  function setItem(item, open) {
    item.classList.toggle('open', open);
    const btn = item.querySelector('.acc-head');
    btn.setAttribute('aria-expanded', String(open));
    const label = btn.querySelector('.acc-toggle-label');
    if (label) label.textContent = open ? 'Hide details' : 'View details';
  }

  function openItem(item) {
    accItems.forEach(i => setItem(i, i === item && !i.classList.contains('open')));
  }

  /* Collapse everything on init (JS present) */
  accItems.forEach(item => {
    setItem(item, false);
    item.querySelector('.acc-head').addEventListener('click', () => openItem(item));
  });

  /* Deep links: cars.html#civic opens the Civic panel */
  function openFromHash() {
    const id = location.hash.replace('#', '');
    if (!id) return;
    const target = document.getElementById(id);
    if (target && target.classList.contains('acc-item')) {
      accItems.forEach(i => setItem(i, i === target));
      /* Wait one frame so the panel has size before scrolling */
      requestAnimationFrame(() => {
        setTimeout(() => {
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }, 80);
      });
    }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}


/* The red background effect now lives in assets/floating-lines.js — a
   WebGL FloatingLines shader mounted on every .floating-lines-container
   ([data-thread-section] sections). The old scroll-drawn SVG thread
   engine that used to live here was removed when we switched to it. */


/* ---------- Mobile sticky CTA: reveal only after the hero ----------
   Keeps the hero focused on its own CTA and stops the bar crowding the
   hero car stage. The bar slides up once the hero scrolls out of view.
   No-JS or no IntersectionObserver: the bar stays visible by default
   (its CSS hidden state is gated on html.js + this observer). */
const waSticky = document.querySelector('.wa-sticky');
const heroSection = document.querySelector('[data-section="hero"]');
if (waSticky && heroSection && 'IntersectionObserver' in window) {
  const stickyIO = new IntersectionObserver(entries => {
    waSticky.classList.toggle('is-shown', !entries[0].isIntersecting);
  }, { threshold: 0 });
  stickyIO.observe(heroSection);
} else if (waSticky) {
  waSticky.classList.add('is-shown');
}


/* ---------- Why-hakim mobile coverflow: 3D per-slide transform ----------
   Native horizontal scroll-snap carousel; JS applies rotateY/scale/translateZ
   + opacity by each slide's distance from the track centre (coverflow look) and
   drives the pagination dots. Mobile only (<768px). Under reduced-motion the 3D
   is skipped (flat snap carousel) but dots still track. Guarded so cars.html /
   desktop are unaffected (reuses the existing top-level `reduceMotion`). */
const cfRoot = document.querySelector('.why-coverflow');
if (cfRoot) {
  const cfTrack = cfRoot.querySelector('.why-cf-track');
  const cfSlides = Array.from(cfTrack.querySelectorAll('.why-cf-slide'));
  const cfDots = Array.from(cfRoot.querySelectorAll('.why-cf-dot'));
  const motion3d = !reduceMotion;
  let cfTicking = false;
  const cfUpdate = () => {
    cfTicking = false;
    const wide = window.innerWidth >= 768;
    const center = cfTrack.scrollLeft + cfTrack.clientWidth / 2;
    let activeIdx = 0, minDist = Infinity;
    cfSlides.forEach((slide, i) => {
      const card = slide.querySelector('.why-cf-card');
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const w = slide.offsetWidth || 1;
      const dist = (slideCenter - center) / w;
      const ad = Math.abs(dist);
      if (ad < minDist) { minDist = ad; activeIdx = i; }
      if (wide || !motion3d) { card.style.transform = ''; card.style.opacity = ''; return; }
      const c = Math.max(-2.2, Math.min(2.2, dist));
      const rot = c * -40;
      const scale = Math.max(0.82, 1 - Math.abs(c) * 0.14);
      const tz = -Math.abs(c) * 60;
      const op = Math.max(0.5, 1 - Math.abs(c) * 0.30);
      card.style.transform = 'translateZ(' + tz + 'px) rotateY(' + rot + 'deg) scale(' + scale + ')';
      card.style.opacity = op;
    });
    cfDots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
  };
  const cfQueue = () => { if (!cfTicking) { cfTicking = true; requestAnimationFrame(cfUpdate); } };
  cfTrack.addEventListener('scroll', cfQueue, { passive: true });
  window.addEventListener('resize', cfQueue, { passive: true });
  cfDots.forEach((d, i) => d.addEventListener('click', () => {
    cfSlides[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }));
  cfUpdate();
}


/* ---------- Why-hakim desktop cards: drag-to-scroll + dot/active sync ----------
   .whyd is a snap scroller on desktop. Mouse-drag scrolls it (grab cursor),
   nearest card to the track centre gets .is-active (red keyline) and drives
   the dots; dots are clickable. Snap is suspended while dragging. */
const whydTrack = document.querySelector('.whyd');
if (whydTrack) {
  const whydCards = Array.from(whydTrack.querySelectorAll('.whyd-card'));
  const whydDots = Array.from(document.querySelectorAll('.whyd-dot'));
  let whydTicking = false;
  const whydUpdate = () => {
    whydTicking = false;
    /* Active = leftmost card in view (scroll progress), not track centre —
       so dot 1 is lit at rest and the dots read as a position indicator. */
    const step = whydCards.length > 1 ? (whydCards[1].offsetLeft - whydCards[0].offsetLeft) : 1;
    const maxLeft = whydTrack.scrollWidth - whydTrack.clientWidth;
    const atEnd = whydTrack.scrollLeft >= maxLeft - 2;
    const activeIdx = atEnd ? whydCards.length - 1
      : Math.min(whydCards.length - 1, Math.max(0, Math.round(whydTrack.scrollLeft / step)));
    /* Edge fades only where content is hidden: none on left at rest,
       none on right at track end — first/last card always show full. */
    whydTrack.classList.toggle('fade-l', whydTrack.scrollLeft > 4);
    whydTrack.classList.toggle('fade-r', !atEnd);
    whydDots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
  };
  const whydQueue = () => { if (!whydTicking) { whydTicking = true; requestAnimationFrame(whydUpdate); } };
  whydTrack.addEventListener('scroll', whydQueue, { passive: true });
  window.addEventListener('resize', whydQueue, { passive: true });
  whydDots.forEach((d, i) => d.addEventListener('click', () => {
    whydTrack.scrollTo({ left: whydCards[i].offsetLeft - whydCards[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  /* Mouse drag-to-scroll (touch already scrolls natively) */
  let whydDown = false, whydStartX = 0, whydStartLeft = 0;
  whydTrack.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    whydDown = true; whydStartX = e.clientX; whydStartLeft = whydTrack.scrollLeft;
    whydTrack.classList.add('is-dragging');
    whydTrack.setPointerCapture(e.pointerId);
  });
  whydTrack.addEventListener('pointermove', e => {
    if (!whydDown) return;
    whydTrack.scrollLeft = whydStartLeft - (e.clientX - whydStartX);
  });
  const whydEndDrag = e => {
    if (!whydDown) return;
    whydDown = false;
    whydTrack.classList.remove('is-dragging');
    if (e.pointerId != null && whydTrack.hasPointerCapture(e.pointerId)) whydTrack.releasePointerCapture(e.pointerId);
  };
  whydTrack.addEventListener('pointerup', whydEndDrag);
  whydTrack.addEventListener('pointercancel', whydEndDrag);
  whydUpdate();
}


/* ---------- Buyer journey carousel: dot sync ----------
   Mobile snap carousel (.jcar). Nearest card to the viewport centre drives
   the active dot; tapping a dot scrolls its card into view. Desktop hides
   the dots in CSS; the listener is harmless there. */
const jcarTrack = document.querySelector('.jcar');
if (jcarTrack) {
  const jcarCards = Array.from(jcarTrack.querySelectorAll('.jcar-card'));
  const jcarDots = Array.from(document.querySelectorAll('.jcar-dot'));
  let jcarTicking = false;
  const jcarUpdate = () => {
    jcarTicking = false;
    const center = jcarTrack.scrollLeft + jcarTrack.clientWidth / 2;
    let activeIdx = 0, minDist = Infinity;
    jcarCards.forEach((card, i) => {
      const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (d < minDist) { minDist = d; activeIdx = i; }
    });
    jcarDots.forEach((d, i) => d.classList.toggle('is-active', i === activeIdx));
  };
  const jcarQueue = () => { if (!jcarTicking) { jcarTicking = true; requestAnimationFrame(jcarUpdate); } };
  jcarTrack.addEventListener('scroll', jcarQueue, { passive: true });
  window.addEventListener('resize', jcarQueue, { passive: true });
  jcarDots.forEach((d, i) => d.addEventListener('click', () => {
    jcarTrack.scrollTo({ left: jcarCards[i].offsetLeft - jcarCards[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  jcarUpdate();
}


/* ---------- Cars page: variant chip -> header price switching ----------
   Each .vchip button carries data-price; clicking selects it (aria-pressed),
   updates its model's header price (desktop .acc-price + mobile .acc-price-m)
   and swaps the tiny "from" note to the variant name (base variant restores
   "from"). Guarded: no-ops on index.html (no .vchip there). */
document.querySelectorAll('.acc-item').forEach(item => {
  const chips = Array.from(item.querySelectorAll('.vchip[data-price]'));
  if (!chips.length) return;
  const priceD = item.querySelector('.acc-price');
  const priceM = item.querySelector('.acc-price-m');
  const noteM = item.querySelector('.acc-price-note');
  const selLine = item.querySelector('.v-selected');
  const basePrice = chips[0].dataset.price;
  const setVariant = chip => {
    chips.forEach(c => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
    const price = chip.dataset.price;
    const name = (chip.querySelector('b') || chip).textContent.trim();
    if (priceD) priceD.textContent = price;
    if (selLine) selLine.textContent = name + ' · ' + price;
    if (priceM) {
      priceM.childNodes[0].nodeValue = price + ' ';
      if (noteM) noteM.textContent = (price === basePrice) ? 'from' : name;
    }
    /* Pulse the header price so the swap reads as a change */
    if (!reduceMotion) {
      [priceD, priceM].forEach(el => {
        if (!el) return;
        el.classList.remove('price-swap');
        void el.offsetWidth;
        el.classList.add('price-swap');
      });
    }
  };
  chips.forEach(chip => chip.addEventListener('click', () => setVariant(chip)));
});

/* ---------- Cars page: quick model filters ----------
   Pills show only models whose data-tags carry the filter key.
   "all" restores everything. An open model that gets filtered out
   is collapsed so it cannot reappear pre-expanded later. */
const filterBar = document.querySelector('[data-model-filters]');
if (filterBar) {
  const fchips = Array.from(filterBar.querySelectorAll('.fchip'));
  const models = Array.from(document.querySelectorAll('.acc-item'));
  fchips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    fchips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    let shown = 0;
    models.forEach(m => {
      const show = f === 'all' || (m.dataset.tags || '').split(' ').includes(f);
      m.classList.toggle('is-filtered', !show);
      if (!show && m.classList.contains('open')) {
        m.classList.remove('open');
        const btn = m.querySelector('.acc-head');
        btn.setAttribute('aria-expanded', 'false');
        const label = btn.querySelector('.acc-toggle-label');
        if (label) label.textContent = 'View details';
      }
      /* Remaining cards settle in with a short stagger so the filter change
         reads as a re-sort, not a hard cut. Skipped under reduced motion. */
      if (show && !reduceMotion) {
        m.classList.remove('filter-in');
        m.style.setProperty('--fd', Math.min(shown++ * 45, 270) + 'ms');
        void m.offsetWidth;
        m.classList.add('filter-in');
        m.addEventListener('animationend', () => m.classList.remove('filter-in'), { once: true });
      }
    });
  }));
}

/* ---------- Fullscreen showroom menu ----------
   Minimal chrome (wordmark + MENU trigger) opens a cinematic overlay:
   giant staggered links, ambient red glow, hover ghosts in the matching
   car image. Escape closes; body scroll locks while open. Guarded. */
const menuOverlay = document.getElementById('menu-overlay');
const menuTrigger = document.querySelector('.nav-trigger');
if (menuOverlay && menuTrigger) {
  const triggerLabel = menuTrigger.querySelector('.nav-trigger-label');
  const menuImgs = Array.from(menuOverlay.querySelectorAll('[data-menu-img]'));
  const menuClose = menuOverlay.querySelector('.menu-close');
  const pageSiblings = Array.from(document.body.children).filter(child => child !== menuOverlay && child.tagName !== 'SCRIPT');
  const menuFocusables = () => Array.from(menuOverlay.querySelectorAll('a[href], button:not([disabled])'));

  function setMenu(open) {
    if (open) {
      menuOverlay.hidden = false;
      void menuOverlay.offsetWidth;         // let the opacity/stagger transition run
      menuOverlay.classList.add('open');
      pageSiblings.forEach(element => { element.inert = true; });
    } else {
      menuOverlay.classList.remove('open');
      menuOverlay.hidden = true;            // instant hide; exit stays subtler than enter
      menuImgs.forEach(im => im.classList.remove('show'));
      pageSiblings.forEach(element => { element.inert = false; });
    }
    menuTrigger.classList.toggle('open', open);
    menuTrigger.setAttribute('aria-expanded', String(open));
    if (triggerLabel) triggerLabel.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
    if (open) menuClose?.focus({ preventScroll: true });
  }

  menuTrigger.addEventListener('click', () => setMenu(menuOverlay.hidden));
  menuClose?.addEventListener('click', () => { setMenu(false); menuTrigger.focus(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menuOverlay.hidden) { setMenu(false); menuTrigger.focus(); }
    if (e.key === 'Tab' && !menuOverlay.hidden) {
      const focusables = menuFocusables();
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  menuOverlay.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      menuImgs.forEach(im => im.classList.toggle('show', im.dataset.menuImg === link.dataset.img));
    });
    link.addEventListener('mouseleave', () => menuImgs.forEach(im => im.classList.remove('show')));
    link.addEventListener('focus', () => {
      menuImgs.forEach(im => im.classList.toggle('show', im.dataset.menuImg === link.dataset.img));
    });
    link.addEventListener('click', () => setMenu(false));
  });
}

/* ---------- Mobile highlight carousel dots (cars page .vh-row) ----------
   CSS turns .vh-row into a one-card-at-a-time swipe carousel under 768px;
   this adds the dot indicator and keeps it in sync with scroll position.
   Dots are display:none on desktop, so this is inert there. */
(function () {
  const rows = document.querySelectorAll('.vh-row');
  if (!rows.length) return;
  rows.forEach(row => {
    const tiles = row.querySelectorAll('.vh-tile');
    if (tiles.length < 2) return;
    const dots = document.createElement('div');
    dots.className = 'vh-dots';
    dots.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < tiles.length; i++) dots.appendChild(document.createElement('span'));
    row.insertAdjacentElement('afterend', dots);
    const spans = dots.children;
    function sync() {
      const step = tiles[0].offsetWidth + 12;   // tile width + flex gap
      const idx = Math.min(tiles.length - 1, Math.max(0, Math.round(row.scrollLeft / step)));
      for (let i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i === idx);
    }
    row.addEventListener('scroll', sync, { passive: true });
    sync();
  });
})();
