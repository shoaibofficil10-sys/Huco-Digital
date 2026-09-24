// PHP mail runs on the mail hosting, not the static Vercel deployment.
// Keep a clear failure response until form actions point to the live PHP endpoint.
module.exports = function contact(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Please submit the enquiry form.' });
  }
  return res.status(503).json({ error: 'Online sending is temporarily unavailable. Please use the email link below to send your enquiry.' });
};
