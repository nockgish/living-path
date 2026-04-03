import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM ?? "Living Path <hello@livingpath.org>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function shell(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a1f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f4f4ff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1f;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#11112e;border:1px solid #2a2a52;border-radius:8px;overflow:hidden;">
        <tr><td style="padding:32px 40px;border-bottom:1px solid #2a2a52;">
          <div style="font-family:Georgia,serif;font-size:28px;color:#f4f4ff;letter-spacing:0.02em;">Living Path</div>
          <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#c9a227;margin-top:6px;">Himalayan Yoga · Spiritual Poetry · Nondual Teaching</div>
        </td></tr>
        <tr><td style="padding:40px;">${body}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2a2a52;font-size:12px;color:#6b6b9a;text-align:center;">
          <a href="${SITE}" style="color:#c9a227;text-decoration:none;">livingpath.org</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  url: string;
  from?: string;
}) {
  if (!resend) {
    console.warn("[resend] no API key — magic link URL:", opts.url);
    return;
  }
  const html = shell(
    "Sign in to Living Path",
    `<h1 style="font-family:Georgia,serif;font-size:24px;color:#f4f4ff;margin:0 0 16px;font-weight:400;">Sign in</h1>
     <p style="color:#d8d8f0;font-size:15px;line-height:1.6;margin:0 0 28px;">Click the link below to sign in to your Living Path account. This link is valid for 24 hours.</p>
     <a href="${opts.url}" style="display:inline-block;background:#c9a227;color:#05050f;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Sign in to Living Path</a>
     <p style="color:#6b6b9a;font-size:12px;margin:32px 0 0;">If you did not request this email, you can safely ignore it.</p>`
  );

  await resend.emails.send({
    from: opts.from ?? FROM,
    to: opts.to,
    subject: "Sign in to Living Path",
    html,
  });
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name?: string;
  unsubToken: string;
}) {
  if (!resend) return;
  const greeting = opts.name ? `Welcome, ${opts.name}` : "Welcome";
  const html = shell(
    "Welcome to Living Path",
    `<h1 style="font-family:Georgia,serif;font-size:24px;color:#f4f4ff;margin:0 0 16px;font-weight:400;">${greeting}.</h1>
     <p style="color:#d8d8f0;font-size:15px;line-height:1.7;margin:0 0 16px;">Thank you for joining the Living Path community. You will receive class reminders, new essays, and occasional notes from the teaching.</p>
     <p style="color:#d8d8f0;font-size:15px;line-height:1.7;margin:0 0 28px;">If you would like to begin practicing with us right away, browse upcoming classes here:</p>
     <a href="${SITE}/#classes" style="display:inline-block;background:#c9a227;color:#05050f;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">View classes</a>
     <p style="color:#6b6b9a;font-size:11px;margin:36px 0 0;">You can <a href="${SITE}/api/unsubscribe?token=${opts.unsubToken}" style="color:#6b6b9a;">unsubscribe</a> at any time.</p>`
  );
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: "Welcome to Living Path",
    html,
  });
}

export async function sendRsvpConfirmation(opts: {
  to: string;
  classTitle: string;
  startsAt: Date;
  zoomUrl?: string | null;
}) {
  if (!resend) return;
  const when = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(opts.startsAt);
  const html = shell(
    "RSVP confirmed",
    `<h1 style="font-family:Georgia,serif;font-size:24px;color:#f4f4ff;margin:0 0 16px;font-weight:400;">You are confirmed.</h1>
     <p style="color:#d8d8f0;font-size:15px;line-height:1.7;margin:0 0 8px;"><strong style="color:#f4f4ff;">${opts.classTitle}</strong></p>
     <p style="color:#c9a227;font-size:14px;margin:0 0 24px;">${when}</p>
     ${opts.zoomUrl ? `<a href="${opts.zoomUrl}" style="display:inline-block;background:#c9a227;color:#05050f;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Join the class</a>` : ""}
     <p style="color:#6b6b9a;font-size:12px;margin:28px 0 0;">A reminder will arrive 24 hours before class begins.</p>`
  );
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `RSVP confirmed: ${opts.classTitle}`,
    html,
  });
}

export async function sendPurchaseReceipt(opts: {
  to: string;
  itemTitle: string;
  amount: number;
}) {
  if (!resend) return;
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(opts.amount / 100);
  const html = shell(
    "Receipt",
    `<h1 style="font-family:Georgia,serif;font-size:24px;color:#f4f4ff;margin:0 0 16px;font-weight:400;">Thank you.</h1>
     <p style="color:#d8d8f0;font-size:15px;line-height:1.7;margin:0 0 16px;">Your purchase has been received.</p>
     <table style="width:100%;border-collapse:collapse;margin:16px 0 24px;">
       <tr><td style="padding:12px 0;border-bottom:1px solid #2a2a52;color:#d8d8f0;">${opts.itemTitle}</td><td style="padding:12px 0;border-bottom:1px solid #2a2a52;text-align:right;color:#c9a227;font-weight:600;">${price}</td></tr>
     </table>
     <a href="${SITE}/account/purchases" style="color:#c9a227;text-decoration:underline;font-size:14px;">View your purchases</a>`
  );
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Receipt: ${opts.itemTitle}`,
    html,
  });
}

export async function sendClassReminder(opts: {
  to: string;
  classTitle: string;
  startsAt: Date;
  zoomUrl?: string | null;
}) {
  if (!resend) return;
  const when = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(opts.startsAt);
  const html = shell(
    "Class reminder",
    `<h1 style="font-family:Georgia,serif;font-size:24px;color:#f4f4ff;margin:0 0 16px;font-weight:400;">Tomorrow.</h1>
     <p style="color:#d8d8f0;font-size:15px;line-height:1.7;margin:0 0 8px;"><strong style="color:#f4f4ff;">${opts.classTitle}</strong></p>
     <p style="color:#c9a227;font-size:14px;margin:0 0 24px;">${when}</p>
     ${opts.zoomUrl ? `<a href="${opts.zoomUrl}" style="display:inline-block;background:#c9a227;color:#05050f;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Join the class</a>` : ""}`
  );
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Tomorrow: ${opts.classTitle}`,
    html,
  });
}

export async function sendContactMessage(opts: {
  to: string;
  fromName: string;
  fromEmail: string;
  message: string;
}) {
  if (!resend) return;
  const html = shell(
    "New contact message",
    `<h1 style="font-family:Georgia,serif;font-size:22px;color:#f4f4ff;margin:0 0 20px;font-weight:400;">New message from ${opts.fromName}</h1>
     <p style="color:#6b6b9a;font-size:13px;margin:0 0 16px;">${opts.fromEmail}</p>
     <div style="color:#d8d8f0;font-size:15px;line-height:1.7;border-left:2px solid #c9a227;padding-left:20px;white-space:pre-wrap;">${opts.message.replace(/[<>&]/g, (c) => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]!))}</div>`
  );
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    replyTo: opts.fromEmail,
    subject: `Contact: ${opts.fromName}`,
    html,
  });
}

export async function sendBroadcast(opts: {
  to: string[];
  subject: string;
  bodyHtml: string;
  unsubToken?: string;
}) {
  if (!resend) return { sent: 0 };
  const wrapped = shell(
    opts.subject,
    `<div style="color:#d8d8f0;font-size:15px;line-height:1.7;">${opts.bodyHtml}</div>
     ${opts.unsubToken ? `<p style="color:#6b6b9a;font-size:11px;margin:36px 0 0;border-top:1px solid #2a2a52;padding-top:20px;"><a href="${SITE}/api/unsubscribe?token=${opts.unsubToken}" style="color:#6b6b9a;">Unsubscribe</a></p>` : ""}`
  );

  // Resend allows up to 50 recipients per send via the bcc-style batch
  const chunks: string[][] = [];
  for (let i = 0; i < opts.to.length; i += 50) {
    chunks.push(opts.to.slice(i, i + 50));
  }
  let sent = 0;
  for (const chunk of chunks) {
    await resend.batch.send(
      chunk.map((email) => ({
        from: FROM,
        to: email,
        subject: opts.subject,
        html: wrapped,
      }))
    );
    sent += chunk.length;
  }
  return { sent };
}
