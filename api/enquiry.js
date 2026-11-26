/* Booking, sell and car-enquiry forms POST here. Mail goes to the address
   already shown on the site, through Resend. */
const TO = process.env.ENQUIRY_TO || 'nicumereacre53@gmail.com';
const FROM = process.env.ENQUIRY_FROM || 'Nick Autoservice <onboarding@resend.dev>';

const ALLOWED = [
  'Name', 'Phone', 'Email',
  'Reg', 'Make and model', 'What it needs', 'Preferred date', 'Notes',
  'Mileage km', 'Condition', 'Trade in',
  'Car title', 'Car id', 'Car page', 'Question', 'Message'
];

const MAX = { Name: 120, Phone: 40, Email: 200, 'Car id': 80, default: 2000 };

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const json = (res, status, body) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(body);
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { success: false });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (err) { return json(res, 400, { success: false }); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(res, 400, { success: false });
  }

  if (String(body._honey || '').trim()) {
    return json(res, 200, { success: true });
  }

  const name = String(body.Name || '').trim();
  const phone = String(body.Phone || '').trim();
  if (!name || name.length > (MAX.Name)) return json(res, 400, { success: false });
  if (!phone || phone.length > (MAX.Phone) || (phone.match(/\d/g) || []).length < 7) {
    return json(res, 400, { success: false });
  }

  const email = String(body.Email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { success: false });
  }

  const subject = String(body._subject || 'Website enquiry').trim().replace(/[\r\n]+/g, ' ');
  if (!subject || subject.length > 200) return json(res, 400, { success: false });

  const rows = [];
  for (const key of ALLOWED) {
    if (!(key in body)) continue;
    const raw = String(body[key] ?? '').trim();
    if (!raw) continue;
    const max = MAX[key] || MAX.default;
    if (raw.length > max) return json(res, 400, { success: false });
    rows.push([key, raw]);
  }
  if (!rows.length) return json(res, 400, { success: false });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('enquiry: RESEND_API_KEY is not set');
    return json(res, 500, { success: false });
  }

  const text = [subject, '', ...rows.map(([k, v]) => k + ': ' + v)].join('\n');
  const html = '<p>' + esc(subject) + '</p><table>' +
    rows.map(([k, v]) => '<tr><th align="left">' + esc(k) + '</th><td>' + esc(v).replace(/\n/g, '<br>') + '</td></tr>').join('') +
    '</table>';

  const payload = { from: FROM, to: [TO], subject, text, html };
  if (email) payload.reply_to = email;

  try {
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!sent.ok) {
      console.error('enquiry: Resend failed', sent.status);
      return json(res, 502, { success: false });
    }
    return json(res, 200, { success: true });
  } catch (err) {
    console.error('enquiry: send failed');
    return json(res, 502, { success: false });
  }
}
