/* ============================================================
   Cars page — two-variant comparison (#compare)
   Specs are OFFICIAL Honda Malaysia figures pulled from the model
   /spec pages on honda.com.my (2026-07-06). Hybrid/EV combined outputs
   shown as "Engine / Motor". Guarded: only runs where #compare exists,
   so it is a no-op on index.html.
   ============================================================ */
(function () {
  const root = document.getElementById('compare');
  if (!root) return;

  // Front-wheel drive is the default; only CR-V 1.5L V is AWD.
  const FWD = 'Front-wheel drive';
  const AWD = 'All-wheel drive (Real Time AWD)';

  const DATA = {
    city: {
      name: 'Honda City', variants: {
        '1.5L S':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '196 km/h', accel: '10.2 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L E':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '196 km/h', accel: '10.2 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L V':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '195 km/h', accel: '10.4 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L RS':      { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '195 km/h', accel: '10.4 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L e:HEV RS':{ fuel: 'PGM-FI', disp: '1,498 cc', power: '98 PS (72 kW) @ 5,600–6,400', torque: '127 Nm @ 4,500–5,000', etype: '4-cyl DOHC i-VTEC (Atkinson) + e:HEV', top: '177 km/h', accel: '9.9 s', cons: '3.6 L/100km', drive: FWD, trans: 'e-CVT' }
      }
    },
    'city-hatchback': {
      name: 'Honda City Hatchback', variants: {
        '1.5L S':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '195 km/h', accel: '10.7 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L E':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '195 km/h', accel: '10.7 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L V':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '194 km/h', accel: '10.7 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L RS':      { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '193 km/h', accel: '10.7 s', cons: '5.6 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L e:HEV RS':{ fuel: 'PGM-FI', disp: '1,498 cc', power: 'Engine 98 PS / Motor 109 PS', torque: 'Engine 127 Nm / Motor 253 Nm', etype: '4-cyl DOHC i-VTEC (Atkinson) + e:HEV', top: '177 km/h', accel: '9.7 s', cons: '3.7 L/100km', drive: FWD, trans: 'e-CVT' }
      }
    },
    wrv: {
      name: 'Honda WR-V', variants: {
        '1.5L S':  { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '160 km/h', accel: '11.0 s', cons: '6.0 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L E':  { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '160 km/h', accel: '11.0 s', cons: '6.0 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L V':  { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '160 km/h', accel: '11.1 s', cons: '6.0 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L RS': { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '160 km/h', accel: '11.3 s', cons: '6.0 L/100km', drive: FWD, trans: 'CVT' }
      }
    },
    hrv: {
      name: 'Honda HR-V', variants: {
        '1.5L S':        { fuel: 'PGM-FI', disp: '1,498 cc', power: '121 PS (89 kW) @ 6,600', torque: '145 Nm @ 4,300', etype: '4-cyl 16V DOHC i-VTEC', top: '186 km/h', accel: '12.1 s', cons: '5.9 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L Turbo E':  { fuel: 'PGM-FI', disp: '1,498 cc', power: '181 PS (133 kW) @ 6,000', torque: '240 Nm @ 1,700–4,500', etype: '4-cyl 16V DOHC VTEC Turbo', top: '200 km/h', accel: '8.7 s', cons: '6.5 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L Turbo V':  { fuel: 'PGM-FI', disp: '1,498 cc', power: '181 PS (133 kW) @ 6,000', torque: '240 Nm @ 1,700–4,500', etype: '4-cyl 16V DOHC VTEC Turbo', top: '200 km/h', accel: '8.8 s', cons: '6.5 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L e:HEV RS': { fuel: 'PGM-FI', disp: '1,498 cc', power: 'Engine 107 PS / Motor 131 PS', torque: 'Engine 131 Nm / Motor 253 Nm', etype: '4-cyl DOHC i-VTEC (Atkinson) + e:HEV', top: '170 km/h', accel: '10.7 s', cons: '4.1 L/100km', drive: FWD, trans: 'e-CVT' }
      }
    },
    civic: {
      name: 'Honda Civic', variants: {
        '1.5L E':        { fuel: 'PGM-FI', disp: '1,498 cc', power: '182 PS (134 kW) @ 6,000', torque: '240 Nm @ 1,700–4,500', etype: '4-cyl 16V DOHC VTEC Turbo', top: '200 km/h', accel: '8.3 s', cons: '6.0 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L V':        { fuel: 'PGM-FI', disp: '1,498 cc', power: '182 PS (134 kW) @ 6,000', torque: '240 Nm @ 1,700–4,500', etype: '4-cyl 16V DOHC VTEC Turbo', top: '200 km/h', accel: '8.4 s', cons: '6.0 L/100km', drive: FWD, trans: 'CVT' },
        '1.5L RS':       { fuel: 'PGM-FI', disp: '1,498 cc', power: '182 PS (134 kW) @ 6,000', torque: '240 Nm @ 1,700–4,500', etype: '4-cyl 16V DOHC VTEC Turbo', top: '200 km/h', accel: '8.5 s', cons: '6.3 L/100km', drive: FWD, trans: 'CVT' },
        '2.0L e:HEV RS': { fuel: 'Direct injection', disp: '1,993 cc', power: 'Engine 143 PS / Motor 184 PS', torque: 'Engine 189 Nm / Motor 315 Nm', etype: '4-cyl DOHC (Atkinson) + e:HEV', top: '180 km/h', accel: '7.9 s', cons: '4.0 L/100km', drive: FWD, trans: 'e-CVT' }
      }
    },
    crv: {
      name: 'Honda CR-V', variants: {
        '2.0L e:HEV E':  { fuel: 'Direct injection', disp: '1,993 cc', power: 'Engine 148 PS / Motor 184 PS', torque: 'Engine 190 Nm / Motor 335 Nm', etype: '4-cyl DOHC i-VTEC (Atkinson) + e:HEV', top: '185 km/h', accel: '8.9 s', cons: '5.0 L/100km', drive: FWD, trans: 'e-CVT' },
        '1.5L V (AWD)':  { fuel: 'Direct injection', disp: '1,498 cc', power: '193 PS (142 kW) @ 6,000', torque: '243 Nm @ 1,700–5,000', etype: '4-cyl 16V DOHC VTEC Turbo', top: '200 km/h', accel: '10.0 s', cons: '7.5 L/100km', drive: AWD, trans: 'CVT' },
        '2.0L e:HEV RS': { fuel: 'Direct injection', disp: '1,993 cc', power: 'Engine 148 PS / Motor 184 PS', torque: 'Engine 190 Nm / Motor 335 Nm', etype: '4-cyl DOHC i-VTEC (Atkinson) + e:HEV', top: '185 km/h', accel: '8.9 s', cons: '5.0 L/100km', drive: FWD, trans: 'e-CVT' }
      }
    },
    en1: {
      name: 'Honda e:N1', variants: {
        'e:N1': { fuel: '—', disp: '68.8 kWh battery', power: '150 kW (204 PS)', torque: '310 Nm', etype: 'Electric motor', top: '160 km/h', accel: 'Confirm with Hakim', cons: 'Range up to 500 km (NEDC)', drive: FWD, trans: 'Single-speed reduction' }
      }
    },
    prelude: {
      name: 'Honda Prelude', variants: {
        '2.0 e:HEV': { fuel: 'Direct injection', disp: '1,993 cc', power: 'Engine 143 PS / Motor 184 PS', torque: 'Engine 189 Nm / Motor 315 Nm', etype: '4-cyl DOHC (Atkinson) + e:HEV', top: '188 km/h (limited)', accel: '8.2 s', cons: '4.2 L/100km', drive: FWD, trans: 'e-CVT' }
      }
    },
    'type-r': {
      name: 'Honda Civic Type R', variants: {
        'Type R': { fuel: 'Direct injection', disp: '1,996 cc', power: '319 PS (235 kW) @ 6,500', torque: '420 Nm @ 2,600–4,000', etype: '4-cyl 16V DOHC VTEC Turbo', top: '272 km/h', accel: '5.5 s', cons: '8.3 L/100km', drive: FWD, trans: '6-speed manual' }
      }
    }
  };

  const GROUPS = [
    { title: 'Engine', icon: 'bolt', rows: [
      ['Fuel supply', 'fuel'], ['Displacement', 'disp'], ['Max power', 'power'],
      ['Max torque', 'torque'], ['Engine type', 'etype'] ] },
    { title: 'Performance', icon: 'speed', rows: [
      ['Max speed', 'top'], ['0–100 km/h', 'accel'], ['Fuel economy / range', 'cons'] ] },
    { title: 'Drive system', icon: 'directions_car', rows: [ ['Drivetrain', 'drive'] ] },
    { title: 'Transmission', icon: 'settings', rows: [ ['Type', 'trans'] ] }
  ];

  /* Official Honda Malaysia RRPs (match the model cards above). */
  const PRICE = {
    city:            { '1.5L S': 'RM 84,900', '1.5L E': 'RM 89,900', '1.5L V': 'RM 94,900', '1.5L RS': 'RM 99,900', '1.5L e:HEV RS': 'RM 111,900' },
    'city-hatchback':{ '1.5L S': 'RM 85,560', '1.5L E': 'RM 90,560', '1.5L V': 'RM 95,560', '1.5L RS': 'RM 100,560', '1.5L e:HEV RS': 'RM 112,560' },
    wrv:             { '1.5L S': 'RM 89,900', '1.5L E': 'RM 95,900', '1.5L V': 'RM 99,900', '1.5L RS': 'RM 107,900' },
    hrv:             { '1.5L S': 'RM 115,900', '1.5L Turbo E': 'RM 130,900', '1.5L Turbo V': 'RM 137,900', '1.5L e:HEV RS': 'RM 143,900' },
    civic:           { '1.5L E': 'RM 133,900', '1.5L V': 'RM 144,900', '1.5L RS': 'RM 149,900', '2.0L e:HEV RS': 'RM 167,900' },
    crv:             { '2.0L e:HEV E': 'RM 178,200', '1.5L V (AWD)': 'RM 181,900', '2.0L e:HEV RS': 'RM 195,900' },
    en1:             { 'e:N1': 'RM 150,060' },
    prelude:         { '2.0 e:HEV': 'RM 278,000' },
    'type-r':        { 'Type R': 'RM 399,900' }
  };

  const THUMB = {
    city: 'assets/model-city-sedan-studio.png?v=1',
    'city-hatchback': 'assets/model-city-hatchback-studio.png?v=1',
    wrv: 'assets/model-wrv-studio.png?v=1',
    hrv: 'assets/model-hrv-studio.png?v=1',
    civic: 'assets/model-civic-studio.png?v=4',
    en1: 'assets/model-en1-studio.png?v=1',
    crv: 'assets/model-crv-studio.png?v=1',
    prelude: 'assets/model-prelude-studio.png?v=1',
    'type-r': 'assets/model-civic-type-r-studio.png?v=1'
  };

  /* Rows where a subtle "better value" tick is safe: only strictly-parseable,
     single-number values are compared. Anything else (hybrid dual outputs,
     "Confirm with Hakim", EV range text) is skipped — no invented judgments. */
  const BETTER = {
    top:   { dir: 'hi', re: /^([\d.]+)\s*km\/h$/ },
    accel: { dir: 'lo', re: /^([\d.]+)\s*s$/ },
    cons:  { dir: 'lo', re: /^([\d.]+)\s*L\/100km$/ }
  };

  const slots = [
    { model: null, variant: null },
    { model: null, variant: null }
  ];

  const slotEls = Array.from(root.querySelectorAll('.cmp-slot'));
  const result = root.querySelector('.cmp-result');
  const ctaWrap = root.querySelector('.cmp-cta');
  const ctaLink = root.querySelector('.cmp-wa');

  // Populate model <select>s once.
  const modelOptions = Object.keys(DATA)
    .map(k => `<option value="${k}">${DATA[k].name}</option>`).join('');

  slotEls.forEach((el, i) => {
    const modelSel = el.querySelector('.cmp-model');
    const variantSel = el.querySelector('.cmp-variant');
    const clearBtn = el.querySelector('.cmp-clear');
    modelSel.insertAdjacentHTML('beforeend', modelOptions);

    modelSel.addEventListener('change', () => {
      const key = modelSel.value;
      slots[i].model = key || null;
      slots[i].variant = null;                 // rule 4: model change resets variant
      variantSel.innerHTML = '<option value="">Select variant</option>';
      if (key) {
        Object.keys(DATA[key].variants).forEach(v => {
          variantSel.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`);
        });
        variantSel.disabled = false;           // rule 3: enabled only after model chosen
      } else {
        variantSel.disabled = true;            // rule 3
      }
      clearBtn.hidden = !key;
      el.classList.toggle('is-filled', !!key);
      syncAction();
    });

    variantSel.addEventListener('change', () => {
      const v = variantSel.value || null;
      // rule 5: block the exact same car + variant in both slots
      const other = slots[1 - i];
      if (v && other.model === slots[i].model && other.variant === v) {
        variantSel.value = '';
        slots[i].variant = null;
        flash(el, 'Pick a different variant — that one is already in the other slot.');
        syncAction();
        return;
      }
      slots[i].variant = v;
      syncAction();
    });

    clearBtn.addEventListener('click', () => {          // rule 6: clear/reset a slot
      modelSel.value = '';
      variantSel.innerHTML = '<option value="">Select variant</option>';
      variantSel.disabled = true;
      slots[i].model = null;
      slots[i].variant = null;
      clearBtn.hidden = true;
      el.classList.remove('is-filled');
      syncAction();
    });
  });

  /* Popular-comparison chips: fill both MODEL selects through the normal
     change handlers (variants stay for the user to pick), then scroll here. */
  document.querySelectorAll('.pc-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      [chip.dataset.pcA, chip.dataset.pcB].forEach((key, i) => {
        if (!DATA[key] || !slotEls[i]) return;
        const modelSel = slotEls[i].querySelector('.cmp-model');
        modelSel.value = key;
        modelSel.dispatchEvent(new Event('change'));
      });
      root.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    });
  });

  function flash(el, msg) {
    let n = el.querySelector('.cmp-warn');
    if (!n) { n = document.createElement('p'); n.className = 'cmp-warn'; el.appendChild(n); }
    n.textContent = msg;
    n.classList.remove('show'); void n.offsetWidth; n.classList.add('show');
    clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('show'), 3200);
  }

  function cell(slot) { return DATA[slot.model].variants[slot.variant]; }
  function bothReady() { return slots.every(s => s.model && s.variant); }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* Live: renders the moment one slot (model + variant) is filled — a single
     column for one pick, two columns (with "better value" ticks) once both are
     filled. No button; every selection change re-renders. */
  function syncAction() {
    const fs = slots.filter(s => s.model && s.variant);
    if (fs.length === 0) {
      result.hidden = true; result.innerHTML = '';
      ctaWrap.hidden = true;
      return;
    }
    const cells = fs.map(cell);
    const twoCol = fs.length === 2;

    let html = twoCol ? takeawayHtml(fs, cells) : '';
    html += '<div class="cmp-table-wrap"><table class="cmp-table"><thead><tr>' +
      '<th class="cmp-rowhead"></th>' + fs.map(headCell).join('') +
      '</tr></thead><tbody>';
    GROUPS.forEach(g => {
      html += `<tr class="cmp-group"><th colspan="${fs.length + 1}"><span class="material-symbols-outlined" aria-hidden="true">${g.icon}</span>${g.title}</th></tr>`;
      g.rows.forEach(([label, key]) => {
        let wc = fs.map(() => '');
        if (twoCol) wc = winners(key, cells[0][key], cells[1][key]);
        html += `<tr><th class="cmp-rowhead">${label}</th>` +
          cells.map((c, idx) => `<td class="${wc[idx]}">${c[key]}</td>`).join('') + '</tr>';
      });
    });
    html += '</tbody></table></div>';
    html += mobileHtml(fs, cells, twoCol);
    result.innerHTML = html;
    result.hidden = false;
    result.classList.remove('cmp-revealed'); void result.offsetWidth;
    result.classList.add('cmp-revealed');

    // WhatsApp CTA adapts to one or two selected cars.
    const names = fs.map(s => DATA[s.model].name + ' ' + s.variant);
    const msg = names.length === 2
      ? `Hi Hakim, I'm comparing ${names[0]} and ${names[1]}. Can you advise which suits me better?`
      : `Hi Hakim, I'm looking at the ${names[0]}. Can you advise if it suits me?`;
    ctaLink.setAttribute('href', 'https://wa.me/[WHATSAPP_NUMBER]?text=' + encodeURIComponent(msg));
    ctaLink.setAttribute('data-wa-msg', msg);
    ctaWrap.hidden = false;
  }

  /* "Quick takeaway": 2 short buyer lines built ONLY from values that parse
     safely (PRICE map + the BETTER regexes), plus one generic guidance line.
     Anything unparseable is skipped — no invented specs. */
  function takeawayHtml(fs, cells) {
    const lines = [];
    const label = s => fs[0].model === fs[1].model
      ? `${DATA[s.model].name} ${s.variant}`
      : DATA[s.model].name;

    const prices = fs.map(s => {
      const m = /^RM\s*([\d,]+)$/.exec((PRICE[s.model] || {})[s.variant] || '');
      return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
    });
    if (prices[0] != null && prices[1] != null && prices[0] !== prices[1]) {
      const lo = prices[0] < prices[1] ? 0 : 1;
      lines.push(`${label(fs[lo])} is about RM ${(prices[1 - lo] - prices[lo]).toLocaleString('en-US')} less on list price.`);
    }

    // Keeps the original printed decimals ("6.0", not "6") for display.
    const num = (key, s) => {
      const m = BETTER[key].re.exec(String(cells[fs.indexOf(s)][key]).trim());
      return m ? m[1] : null;
    };
    const cons = fs.map(s => num('cons', s));
    if (cons[0] != null && cons[1] != null && parseFloat(cons[0]) !== parseFloat(cons[1])) {
      const lo = parseFloat(cons[0]) < parseFloat(cons[1]) ? 0 : 1;
      lines.push(`${label(fs[lo])} uses less fuel on paper (${cons[lo]} vs ${cons[1 - lo]} L/100km).`);
    }
    const accel = fs.map(s => num('accel', s));
    if (lines.length < 2 && accel[0] != null && accel[1] != null && parseFloat(accel[0]) !== parseFloat(accel[1])) {
      const lo = parseFloat(accel[0]) < parseFloat(accel[1]) ? 0 : 1;
      lines.push(`${label(fs[lo])} is quicker 0–100 km/h (${accel[lo]} s vs ${accel[1 - lo]} s).`);
    }

    lines.push('Compare price, body type, space, performance and monthly estimate before deciding.');

    return '<div class="cmp-takeaway">' +
      '<p class="cmp-takeaway-title"><span class="material-symbols-outlined" aria-hidden="true">tips_and_updates</span>Quick takeaway</p>' +
      '<ul>' + lines.map(l => `<li>${l}</li>`).join('') + '</ul>' +
      '</div>';
  }

  /* Mobile stacked-accordion render (.cmpm). Same DATA/GROUPS/winners as the
     table — no new data, no new judgments. CSS shows this under 768px and the
     table above it; both are always rendered. */
  function mobileHtml(fs, cells, twoCol) {
    const OPEN = ['Engine', 'Performance', 'Transmission'];
    const sameModel = fs.length === 2 && fs[0].model === fs[1].model;
    const tag = s => sameModel ? s.variant : DATA[s.model].name.replace(/^Honda\s+/, '');
    const one = fs.length === 1 ? ' one' : '';

    let h = `<div class="cmpm"><div class="cmpm-heads${one}">`;
    fs.forEach(s => {
      const price = (PRICE[s.model] || {})[s.variant] || '';
      const thumb = THUMB[s.model] || '';
      h += '<div class="cmpm-head">' +
        (thumb ? `<img src="${thumb}" alt="" loading="lazy">` : '') +
        `<span class="cmpm-head-name">${DATA[s.model].name}</span>` +
        `<span class="cmpm-head-variant">${s.variant}</span>` +
        (price ? `<span class="cmpm-head-price">${price}</span>` : '') +
        '</div>';
    });
    h += '</div>';

    GROUPS.forEach(g => {
      h += `<details class="cmpm-group"${OPEN.indexOf(g.title) !== -1 ? ' open' : ''}>` +
        `<summary><span class="material-symbols-outlined" aria-hidden="true">${g.icon}</span>${g.title}` +
        `<span class="material-symbols-outlined cmpm-caret" aria-hidden="true">expand_more</span></summary>`;
      g.rows.forEach(([label, key]) => {
        let wc = fs.map(() => '');
        if (twoCol) wc = winners(key, cells[0][key], cells[1][key]).map(c => c ? 'cmpm-best' : '');
        h += `<div class="cmpm-row"><span class="cmpm-row-label">${label}</span>` +
          `<div class="cmpm-vals${one}">` +
          cells.map((c, i) =>
            `<div class="cmpm-val ${wc[i]}"><span class="cmpm-val-car">${tag(fs[i])}</span><span class="cmpm-val-v">${c[key]}</span></div>`
          ).join('') +
          '</div></div>';
      });
      h += '</details>';
    });
    h += '</div>';
    return h;
  }

  function headCell(slot) {
    const model = DATA[slot.model];
    const price = (PRICE[slot.model] || {})[slot.variant] || '';
    const thumb = THUMB[slot.model] || '';
    return '<th class="cmpr-head">' +
      (thumb ? `<span class="cmpr-thumb"><img src="${thumb}" alt="" loading="lazy"></span>` : '') +
      `<span class="cmpr-name">${model.name}</span>` +
      `<span class="cmpr-variant">${slot.variant}</span>` +
      (price ? `<span class="cmpr-price">${price}</span>` : '') +
      '</th>';
  }

  /* Returns [classA, classB]; only marks a winner when BOTH values parse. */
  function winners(key, va, vb) {
    const rule = BETTER[key];
    if (!rule) return ['', ''];
    const ma = rule.re.exec(String(va).trim());
    const mb = rule.re.exec(String(vb).trim());
    if (!ma || !mb) return ['', ''];
    const na = parseFloat(ma[1]), nb = parseFloat(mb[1]);
    if (na === nb) return ['', ''];
    const aWins = rule.dir === 'hi' ? na > nb : na < nb;
    return aWins ? ['cmp-best', ''] : ['', 'cmp-best'];
  }

  syncAction();   // start empty; renders live as slots are filled
})();
