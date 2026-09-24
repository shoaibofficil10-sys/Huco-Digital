const nodemailer = require('nodemailer');
const { createHash } = require('node:crypto');

const recipient = 'arsalan@hucodigital.com';
const limits = { name: 120, company: 180, email: 254, phone: 60, service: 180, budget: 120, timeline: 120, source: 120, stage: 180, goal: 3000, message: 5000, page: 200 };
const attempts = new Map();
let transport;

module.exports = async function contact(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Please submit the enquiry form.' });
  }
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ error: 'Please use the website enquiry form.' });
  }
  if (req.headers.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host) throw new Error('origin');
    } catch {
      return res.status(403).json({ error: 'Please submit from the HUCO website.' });
    }
  }
  let body;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 16000) throw new Error('size');
    body = JSON.parse(raw);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('body');
  } catch {
    return res.status(400).json({ error: 'Please check your enquiry and try again.' });
  }
  if (body.website) return res.status(400).json({ error: 'Please check your enquiry.' });
  const fields = {};
  for (const [key, max] of Object.entries(limits)) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'string' || body[key].length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(body[key])) {
      return res.status(400).json({ error: 'Please shorten the enquiry and check your details.' });
    }
    fields[key] = body[key].trim();
  }
  if (!fields.name || !fields.email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fields.email) || /[\r\n]/.test(fields.name + (fields.company || ''))) {
    return res.status(400).json({ error: 'Please enter your name and a valid email address.' });
  }
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) {
    return res.status(503).json({ error: 'Online sending is temporarily unavailable. Please use the email link below.' });
  }
  // Best-effort per-instance throttling; no personal details are retained or logged.
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  const ip = String(req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
  const key = createHash('sha256').update(ip).digest('hex');
  const attempt = attempts.get(key) || { count: 0, expires: now + 600000 };
  if (attempt.count >= 5 || attempts.size > 10000) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ error: 'Please wait a few minutes or contact us by email.' });
  }
  attempt.count++;
  attempts.set(key, attempt);
  try {
    if (!transport) transport = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user, pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      disableFileAccess: true, disableUrlAccess: true
    });
    const result = await transport.sendMail({
      from: { name: 'HUCO Digital Website', address: user },
      to: recipient,
      replyTo: { name: fields.name, address: fields.email },
      subject: `Website enquiry${fields.company ? ` — ${fields.company}` : ''}`,
      text: 'New HUCO Digital website enquiry\n\n' + Object.entries(fields)
        .map(([label, value]) => `${label.charAt(0).toUpperCase() + label.slice(1)}: ${value}`).join('\n\n')
    });
    if (!result.accepted?.some(address => String(address).toLowerCase() === recipient)) throw new Error('recipient');
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'We could not confirm sending. Your details are still here; please try again or use the email link below.' });
  }
};
