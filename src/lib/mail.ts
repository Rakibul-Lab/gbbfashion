import nodemailer from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

export type MailAttachment = {
  filename: string
  content: Buffer
  contentType?: string
}

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  )
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || 587)
  const secure =
    process.env.SMTP_SECURE === 'true' ||
    process.env.SMTP_SECURE === '1' ||
    port === 465

  const options: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }

  // Typical shared hosting / cPanel: allow self-signed if explicitly enabled
  if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false') {
    options.tls = { rejectUnauthorized: false }
  }

  return nodemailer.createTransport(options)
}

export function getMailFromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'GBB Fashion <noreply@gbbfashion.com>'
  )
}

export async function sendMail(opts: {
  to: string
  subject: string
  text: string
  html?: string
  attachments?: MailAttachment[]
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!smtpConfigured()) {
    console.warn(
      '[mail] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS to send invoice emails.'
    )
    return { ok: false, reason: 'SMTP not configured' }
  }

  try {
    const transport = createTransport()
    await transport.sendMail({
      from: getMailFromAddress(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      attachments: opts.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType || 'application/pdf',
      })),
    })
    return { ok: true }
  } catch (error) {
    console.error('[mail] send failed:', error)
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'Mail send failed',
    }
  }
}
