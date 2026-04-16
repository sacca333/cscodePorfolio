// ==========================================================
//  lib/email.ts
//  Service d'envoi d'email — supporte Nodemailer (SMTP)
//  et Resend (API). Basculer via EMAIL_PROVIDER dans .env
// ==========================================================

import nodemailer from 'nodemailer'

// ─── Types ─────────────────────────────────────────────────

export interface ContactEmailPayload {
  senderName:    string
  senderEmail:   string
  subject:       string
  message:       string
  receivedAt:    Date
}

export interface SendResult {
  success:  boolean
  messageId?: string
  error?:   string
}

// ─── Transport Nodemailer ──────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('Variables SMTP manquantes dans .env (SMTP_HOST, SMTP_USER, SMTP_PASS)')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure:  port === 465,    // true pour SSL, false pour STARTTLS
    auth:    { user, pass },
    tls:     { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  })
}

// ─── Templates HTML ────────────────────────────────────────

/**
 * Email de notification envoyé à Charles quand un message arrive
 */
function buildNotificationEmail(payload: ContactEmailPayload): string {
  const { senderName, senderEmail, subject, message, receivedAt } = payload

  const formattedDate = receivedAt.toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Porto-Novo',
  })

  const escapedMessage = message
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message – ${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f18;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f18;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a12;border-radius:16px 16px 0 0;padding:32px 40px;border-bottom:1px solid rgba(110,231,183,0.15);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-block;background:#6ee7b7;color:#0a0a12;font-weight:800;font-size:14px;padding:6px 12px;border-radius:8px;letter-spacing:-0.5px;">CS</div>
                </td>
                <td align="right">
                  <span style="font-size:12px;color:#555568;letter-spacing:0.05em;text-transform:uppercase;">Nouveau message de contact</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alerte -->
        <tr>
          <td style="background:#111120;padding:24px 40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
            <div style="background:rgba(110,231,183,0.08);border:1px solid rgba(110,231,183,0.2);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#6ee7b7;font-weight:600;">
                📬 Vous avez reçu un nouveau message de votre portfolio
              </p>
            </div>

            <!-- Expéditeur -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding:0 0 12px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:44px;height:44px;background:rgba(59,130,246,0.15);border-radius:12px;text-align:center;vertical-align:middle;">
                        <span style="font-weight:800;font-size:14px;color:#60a5fa;">${senderName.slice(0,2).toUpperCase()}</span>
                      </td>
                      <td style="padding-left:12px;">
                        <div style="font-size:16px;font-weight:700;color:#e8e8f0;">${senderName}</div>
                        <a href="mailto:${senderEmail}" style="font-size:13px;color:#60a5fa;text-decoration:none;">${senderEmail}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Info sujet -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <tr>
                <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="font-size:11px;color:#555568;text-transform:uppercase;letter-spacing:0.07em;">Sujet</span>
                  <span style="font-size:14px;color:#c8c8d8;font-weight:600;display:block;margin-top:2px;">${subject}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 16px;">
                  <span style="font-size:11px;color:#555568;text-transform:uppercase;letter-spacing:0.07em;">Reçu le</span>
                  <span style="font-size:13px;color:#888;display:block;margin-top:2px;text-transform:capitalize;">${formattedDate}</span>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <div style="font-size:11px;color:#555568;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">Message</div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:20px 24px;font-size:15px;color:#c8c8d8;line-height:1.75;">
              ${escapedMessage}
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="background:#111120;padding:24px 40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}"
                     style="display:inline-block;background:#6ee7b7;color:#0a0a12;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
                    ↩ Répondre à ${senderName.split(' ')[0]}
                  </a>
                </td>
                <td>
                  <a href="${process.env.NEXTAUTH_URL}/admin/messages"
                     style="display:inline-block;border:1px solid rgba(255,255,255,0.12);color:#888;font-size:14px;padding:11px 20px;border-radius:8px;text-decoration:none;">
                    Voir dans l'admin
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0a0a12;border-radius:0 0 16px 16px;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:12px;color:#333348;text-align:center;">
              Ce message a été envoyé via le formulaire de contact de
              <a href="${process.env.NEXTAUTH_URL}" style="color:#555568;text-decoration:none;">charlessacca.dev</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Email de confirmation envoyé à l'expéditeur
 */
function buildConfirmationEmail(payload: ContactEmailPayload): string {
  const { senderName, subject } = payload
  const firstName = senderName.split(' ')[0]

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message bien reçu – Charles Sacca</title>
</head>
<body style="margin:0;padding:0;background:#0f0f18;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f18;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a12;border-radius:16px 16px 0 0;padding:32px 40px;">
            <div style="display:inline-block;background:#6ee7b7;color:#0a0a12;font-weight:800;font-size:14px;padding:6px 12px;border-radius:8px;">CS</div>
          </td>
        </tr>

        <!-- Corps -->
        <tr>
          <td style="background:#111120;padding:40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#e8e8f0;letter-spacing:-0.03em;">
              Message bien reçu, ${firstName} ! ✓
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:#8888a0;line-height:1.75;">
              Merci pour votre message concernant <strong style="color:#c8c8d8;">"${subject}"</strong>.
              Je vous répondrai dans les <strong style="color:#6ee7b7;">24 à 48 heures</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#8888a0;line-height:1.75;">
              En attendant, n'hésitez pas à explorer mes projets et mon profil GitHub.
            </p>

            <!-- Links -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:10px;">
                  <a href="${process.env.NEXTAUTH_URL}/#projets"
                     style="display:inline-block;background:#6ee7b7;color:#0a0a12;font-weight:800;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
                    Voir mes projets
                  </a>
                </td>
                <td>
                  <a href="https://github.com/charlessacca"
                     style="display:inline-block;border:1px solid rgba(255,255,255,0.12);color:#888;font-size:14px;padding:11px 20px;border-radius:8px;text-decoration:none;">
                    GitHub
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="background:#0d0d18;padding:28px 40px;border-left:1px solid rgba(255,255,255,0.06);border-right:1px solid rgba(255,255,255,0.06);">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:48px;height:48px;background:rgba(110,231,183,0.12);border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="font-weight:800;font-size:16px;color:#6ee7b7;">CS</span>
                </td>
                <td style="padding-left:14px;">
                  <div style="font-size:15px;font-weight:700;color:#e8e8f0;">Charles Sacca</div>
                  <div style="font-size:13px;color:#6ee7b7;margin-top:2px;">Développeur web full-stack</div>
                  <div style="font-size:12px;color:#444458;margin-top:2px;">Cotonou, Bénin · Remote</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0a0a12;border-radius:0 0 16px 16px;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:12px;color:#333348;text-align:center;">
              Vous recevez cet email car vous avez rempli le formulaire de contact sur
              <a href="${process.env.NEXTAUTH_URL}" style="color:#555568;text-decoration:none;">charlessacca.dev</a>.
              Aucune inscription, aucune newsletter.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Envoi via Nodemailer SMTP ─────────────────────────────

async function sendViaSMTP(payload: ContactEmailPayload): Promise<SendResult> {
  const transport = createTransport()
  const adminEmail = process.env.ADMIN_EMAIL!
  const fromField  = process.env.SMTP_FROM || `Charles Sacca <${process.env.SMTP_USER}>`

  // 1. Notification à Charles
  const notif = await transport.sendMail({
    from:    fromField,
    to:      adminEmail,
    replyTo: payload.senderEmail,
    subject: `[Portfolio] ${payload.subject} — ${payload.senderName}`,
    html:    buildNotificationEmail(payload),
    text:    `De: ${payload.senderName} <${payload.senderEmail}>\nSujet: ${payload.subject}\n\n${payload.message}`,
  })

  // 2. Confirmation à l'expéditeur
  await transport.sendMail({
    from:    fromField,
    to:      payload.senderEmail,
    subject: `✓ Message reçu — Charles Sacca`,
    html:    buildConfirmationEmail(payload),
    text:    `Bonjour ${payload.senderName},\n\nVotre message a bien été reçu. Je vous répondrai très prochainement.\n\nCharles Sacca`,
  })

  return { success: true, messageId: notif.messageId }
}

// ─── Envoi via Resend API ──────────────────────────────────

async function sendViaResend(payload: ContactEmailPayload): Promise<SendResult> {
  const apiKey    = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL!

  if (!apiKey) throw new Error('RESEND_API_KEY manquant dans .env')

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type':  'application/json',
  }

  // 1. Notification à Charles
  const notifRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from:     process.env.SMTP_FROM || 'Portfolio <noreply@charlessacca.dev>',
      to:       [adminEmail],
      reply_to: payload.senderEmail,
      subject:  `[Portfolio] ${payload.subject} — ${payload.senderName}`,
      html:     buildNotificationEmail(payload),
    }),
  })

  if (!notifRes.ok) {
    const err = await notifRes.json()
    throw new Error(`Resend error: ${err.message}`)
  }

  // 2. Confirmation à l'expéditeur
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from:    process.env.SMTP_FROM || 'Charles Sacca <noreply@charlessacca.dev>',
      to:      [payload.senderEmail],
      subject: '✓ Message reçu — Charles Sacca',
      html:    buildConfirmationEmail(payload),
    }),
  })

  const { id } = await notifRes.json()
  return { success: true, messageId: id }
}

// ─── Fonction principale (sélection automatique) ───────────

export async function sendContactEmail(
  payload: ContactEmailPayload
): Promise<SendResult> {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() ?? 'smtp'

  try {
    if (provider === 'resend') {
      return await sendViaResend(payload)
    }
    return await sendViaSMTP(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('[sendContactEmail]', message)
    return { success: false, error: message }
  }
}

// ─── Utilitaire de test de connexion SMTP ─────────────────

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transport = createTransport()
    await transport.verify()
    return true
  } catch {
    return false
  }
}
