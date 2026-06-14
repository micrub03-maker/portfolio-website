import emailjs from '@emailjs/browser';

// When a player leaves an email on the leaderboard, push it through the SAME
// EmailJS pipeline as the About-page contact form, so it lands in the same inbox
// as a normal "contact me" message: name + email as the sender, with their
// company and run noted in the body.
//
// Fire-and-forget: any failure (missing EmailJS env vars, bad email, network) is
// swallowed so it never blocks or breaks the score submission.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function notifyLeaderboardEntry({ name, email, company, score, madeBoard = true, game = 'Breakout' }) {
  const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const to         = (email || '').trim();
  if (!EMAIL_RE.test(to) || !serviceId || !templateId || !publicKey) return false;

  const who = company?.trim() ? `${company.trim()} ` : '';
  const message = madeBoard
    ? `${who}made the leaderboard in ${game} (score: ${score}).`
    : `${who}played ${game} (score: ${score}) and wanted to get in touch.`;

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        from_name: name?.trim() || 'Anonymous',
        from_email: to,
        message,
        to_email: '_michael_rbn@berkeley.edu',
      },
      publicKey
    );
    return true;
  } catch {
    return false;
  }
}
