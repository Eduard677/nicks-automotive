/* Shared helpers for Nick Autoservice: menu, header, opening hours, stock loading, listing cards, forms */
(() => {
const MAIL = 'nicumereacre53@gmail.com';
const WA = 'https://wa.me/353894770532';
const TEL = '089 477 0532', TELH = 'tel:+353894770532';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur = n => new Intl.NumberFormat('en-IE', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(n);
const km = n => Number(n).toLocaleString('en-IE') + ' km';
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ym = v => { if (!v) return ''; const [y, m] = String(v).split('-'); return m ? `${MON[+m - 1]} ${y}` : y; };
const icon = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const plate = r => `<span class="plate"><b aria-hidden="true">IRL</b><i>${esc(r)}</i></span>`;
const has = v => v !== null && v !== undefined && String(v).trim() !== '';
const title = c => [c.year, c.make, c.model].filter(has).join(' ');
/* "2015 BMW 730d" when the variant is a model code (730d, 520d, E220), otherwise "2014 Hyundai i40" */
const code = c => { const v = has(c.variant) ? String(c.variant).trim().split(/\s+/)[0] : ''; return /^(\d{3}[a-z]{1,2}|[A-Z]{1,3}\d{2,3}[a-z]?)$/.test(v) ? v : ''; };
const name = c => code(c) ? [c.year, c.make, code(c)].join(' ') : title(c);
const sub = c => {
  if (!has(c.variant)) return '';
  const v = String(c.variant).trim(), k = code(c);
  if (!k) return v;
  const rest = v.slice(k.length).trim();
  return [c.model, rest].filter(has).join(' ');
};
const regLabel = c => c.reg ? c.reg : c.regYear ? `${c.regYear} reg` : '';
const sold = c => c.status === 'sold';
const priceText = c => sold(c) ? 'Sold' : has(c.price) ? eur(c.price) : 'Ask for price';
const isNew = c => !!c.added && (Date.now() - new Date(c.added + 'T12:00:00').getTime()) / 864e5 <= 14;
const facts = c => [regLabel(c), [c.engine, c.fuel].filter(has).join(' '), has(c.mileage) ? km(c.mileage) : '', c.transmission, c.body].filter(has);
const tag = c => sold(c) ? '<span class="tag">Sold</span>' : isNew(c) ? '<span class="tag new">New in</span>' : '';
const href = c => `car.html#${encodeURIComponent(c.id)}`;
const carName = c => title(c) + (has(c.variant) ? ' ' + String(c.variant).trim() : '');
const pageUrl = c => new URL(href(c), location.href).href;
const carWa = c => WA + '?text=' + encodeURIComponent([carName(c), priceText(c), 'Is this still available?', pageUrl(c)].join('\n'));

/* Quick tags: only fields that are filled in cars.json, never guessed */
const chipVals = (c, noYear) => [noYear ? null : c.year, c.fuel, c.transmission, c.body].filter(has).map(String);
const chips = (c, n = 4, noYear = false) => { const v = chipVals(c, noYear).slice(0, n); return v.length ? `<span class="chips">${v.map(x => `<span>${esc(x)}</span>`).join('')}</span>` : ''; };

/* Listing card: the whole card is one link */
const card = (c, i = 0) => {
  const ph = c.photos || [];
  const s = sub(c);
  return `<a class="lc" href="${href(c)}" style="--i:${Math.min(+i || 0, 11)}">
  <span class="lc-pic">${ph.length ? `<img src="${esc(c.thumb || ph[0])}" alt="" width="960" height="720" loading="lazy" decoding="async">` : `<span class="ph"><b>${esc(c.make || 'Car')}</b><span>Photos on the way</span></span>`}${ph.length > 1 ? `<span class="pc">${icon('cam')}${ph.length}</span>` : ''}${tag(c)}</span>
  <span class="lc-b"><h3>${esc(name(c))}</h3>
  ${s ? `<span class="lc-v">${esc(s)}</span>` : ''}
  ${chips(c)}
  <span class="price${!sold(c) && !has(c.price) ? ' ask' : ''}">${esc(priceText(c))}</span></span></a>`;
};

let cache;
/* Cars marked "hidden": true in cars.json stay in the file but are left off every page (e.g. waiting for photos) */
const load = () => cache || (cache = fetch('cars.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => Array.isArray(d) ? d.filter(c => !c.hidden) : []));

/* Opening hours, Europe/Dublin. Monday to Saturday 9:00 to 17:00, closed Sunday */
const HOURS = [null, [9, 17], [9, 17], [9, 17], [9, 17], [9, 17], [9, 17]];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const now = () => {
  const p = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Dublin', weekday:'short', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).formatToParts(new Date());
  const g = t => (p.find(x => x.type === t) || {}).value;
  return {d: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')), h: +g('hour') + +g('minute') / 60};
};
const status = () => {
  const {d, h} = now(), t = HOURS[d];
  if (t && h >= t[0] && h < t[1]) return {open: true, text: `Open now until ${t[1]}:00`};
  if (t && h < t[0]) return {open: false, text: `Closed, opens today at ${t[0]}:00`};
  for (let i = 1; i <= 7; i++) { const k = (d + i) % 7; if (HOURS[k]) return {open: false, text: `Closed, opens ${i === 1 ? 'tomorrow' : DAYS[k]} at ${HOURS[k][0]}:00`}; }
  return {open: false, text: 'Closed'};
};
const paintStatus = () => {
  const s = status();
  $$('[data-status]').forEach(el => { el.textContent = s.text; el.classList.toggle('is-open', s.open); });
};
paintStatus();
setInterval(paintStatus, 60000);

const postMail = async fields => {
  if (String(fields._honey || '').trim()) throw new Error('honey');
  const res = await fetch('https://formsubmit.co/ajax/' + MAIL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    body: JSON.stringify(fields)
  });
  let data = null;
  try { data = await res.json(); } catch (err) { data = null; }
  if (!(res.ok && data && (data.success === true || data.success === 'true'))) throw new Error('send');
  const subject = String(fields._subject || '');
  const car = fields['Car id'] || fields['Car title'] || '';
  let type = 'enquiry';
  if (subject === 'Booking request') type = 'booking';
  else if (subject === 'Sell / trade-in') type = 'sell';
  else if (subject.indexOf('Car enquiry') === 0 || car) type = 'car';
  const ev = { type };
  if (car) ev.car = String(car);
  track('enquiry_submit', ev);
};
const waText = lines => WA + '?text=' + encodeURIComponent(lines.join('\n'));
$$('[data-mail-text]').forEach(a => { a.href = 'mailto:' + MAIL; a.textContent = MAIL; });
const ld = document.querySelector('script[type="application/ld+json"]');
if (ld) { try { const data = JSON.parse(ld.textContent); data.email = MAIL; ld.textContent = JSON.stringify(data); } catch (err) {} }

const track = (name, data) => {
  try {
    if (typeof window.va === 'function') window.va('event', { name, data });
  } catch (err) {}
};
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  let url;
  try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
  const page = location.pathname + location.hash;
  const host = url.hostname;
  if (url.protocol === 'tel:') track('call_click', { page });
  else if (host === 'wa.me' || host.endsWith('.wa.me')) track('whatsapp_click', { page });
  else if (url.protocol === 'mailto:') track('email_click', { page });
  else if (host === 'maps.google.com' || host.endsWith('.maps.google.com') || /(?:^|\.)google\.[^.]+$/.test(host) && /\/maps(?:\/|$|\?)/.test(url.pathname + url.search)) track('directions_click', { page });
});

/* Menu */
const menu = $('#menu'), nav = $('#nav');
if (menu && nav) {
  const set = o => { nav.classList.toggle('open', o); menu.setAttribute('aria-expanded', String(o)); document.body.classList.toggle('menu-open', o); };
  menu.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); menu.focus(); } });
}

/* Header: clear at the top of the page, solid once it scrolls */
const hd = $('#hd');
if (hd) { const solid = () => hd.classList.toggle('solid', scrollY > 8); solid(); addEventListener('scroll', solid, { passive: true }); }

/* No scroll reveals: content is there as soon as it is on screen. reveal() stays as a no-op for pages that call it */
const reveal = () => {};

window.NS = {$, $$, esc, eur, km, ym, icon, plate, has, title, name, sub, regLabel, sold, priceText, isNew, facts, chips, tag, href, card, reveal, carName, carWa, load, status,
  TEL, TELH, MAIL, WA, postMail, waText,
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches};
})();
