/* Shared helpers for Nick Autoservice: menu, stock loading and listing cards */
(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur = n => new Intl.NumberFormat('en-IE', {style:'currency', currency:'EUR', maximumFractionDigits:0}).format(n);
const km = n => Number(n).toLocaleString('en-IE') + ' km';
const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ym = v => { if (!v) return ''; const [y, m] = String(v).split('-'); return m ? `${MON[+m - 1]} ${y}` : y; };
const icon = n => `<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const plate = r => `<span class="plate"><b aria-hidden="true">IRL</b><i>${esc(r)}</i></span>`;
const has = v => v !== null && v !== undefined && v !== '';
const title = c => [c.year, c.make, c.model].filter(has).join(' ');
const regLabel = c => c.reg ? c.reg : c.regYear ? `${c.regYear} reg` : '';
const sold = c => c.status === 'sold';
const priceText = c => sold(c) ? 'Sold' : has(c.price) ? eur(c.price) : 'Ring for price';
const isNew = c => !!c.added && (Date.now() - new Date(c.added + 'T12:00:00').getTime()) / 864e5 <= 14;
const facts = c => [regLabel(c), [c.engine, c.fuel].filter(has).join(' '), has(c.mileage) ? km(c.mileage) : '', c.transmission, c.body].filter(has).slice(0, 4);
const tag = c => sold(c) ? '<span class="tag">Sold</span>' : isNew(c) ? '<span class="tag new">New in</span>' : '';
const href = c => `car.html#${encodeURIComponent(c.id)}`;

const card = c => {
  const ph = c.photos || [];
  return `<article class="lc"><div class="lc-pic">${ph.length ? `<img src="${esc(c.thumb || ph[0])}" alt="" width="720" height="540" loading="lazy" decoding="async">` : `<div class="ph">${icon('cam')}<span>Photos coming soon</span></div>`}${ph.length > 1 ? `<span class="pc">${icon('cam')}${ph.length}</span>` : ''}${tag(c)}</div>
  <div class="lc-body"><h3>${esc(title(c))}</h3>${c.variant ? `<p class="lc-var">${esc(c.variant)}</p>` : ''}
  <ul class="facts">${facts(c).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
  <div class="lc-foot"><span class="price${!sold(c)&&!has(c.price)?' ask':''}">${esc(priceText(c))}</span><span class="loc">${icon('pin')}${esc(c.location || 'Mullingar')}</span></div></div>
  <a class="lc-hit" href="${href(c)}" aria-label="${esc(title(c))}${c.variant ? ' ' + esc(c.variant) : ''}, ${esc(priceText(c))}"></a></article>`;
};

let cache;
const load = () => cache || (cache = fetch('cars.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => Array.isArray(d) ? d : []));

const MAIL = 'nicumereacre53@gmail.com';
const WA = 'https://wa.me/353894770532';
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
};
const waText = lines => WA + '?text=' + encodeURIComponent(lines.join('\n'));

const menu = $('#menu'), nav = $('#nav');
if (menu && nav) {
  menu.addEventListener('click', () => { const o = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(o)); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } });
}

window.NS = {$, $$, esc, eur, km, ym, icon, plate, has, title, regLabel, sold, priceText, isNew, facts, tag, href, card, load,
  TEL: '089 477 0532', TELH: 'tel:+353894770532', MAIL, WA, postMail, waText,
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches};
})();
