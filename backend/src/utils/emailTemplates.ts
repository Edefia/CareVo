/**
 * CareBis Prime — Branded Email Template Engine
 * Generates beautiful, modern HTML emails for all notification events.
 */

const BRAND = {
  name: 'CareBis Prime',
  color: '#042F64',        // Deep navy — primary brand
  accent: '#2867B6',       // Royal blue — CTAs / accents
  success: '#16A34A',      // Emerald — approvals
  warning: '#D97706',      // Amber — caution
  danger: '#DC2626',       // Red — rejections
  bg: '#F8FAFC',
  cardBg: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  logo: 'https://care-bis-prime.vercel.app/logo.png',
  url: 'https://care-bis-prime.vercel.app',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function baseLayout(content: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND.name}</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#f8faf9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${BRAND.bg}; color: ${BRAND.textPrimary}; }
    .btn { display: inline-block; padding: 14px 32px; background: ${BRAND.color}; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px; }
    .btn:hover { background: #14427D; }
    .btn-outline { display: inline-block; padding: 12px 28px; background: transparent; color: ${BRAND.color} !important; text-decoration: none; border: 2px solid ${BRAND.color}; border-radius: 10px; font-weight: 600; font-size: 14px; }
    .otp-box { display: inline-block; background: ${BRAND.bg}; border: 2px solid ${BRAND.border}; border-radius: 12px; padding: 16px 28px; font-size: 32px; font-weight: 700; letter-spacing: 12px; color: ${BRAND.color}; font-family: 'Courier New', monospace; }
    .badge-approved { display: inline-block; background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-rejected { display: inline-block; background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge-pending { display: inline-block; background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid ${BRAND.border}; }
    .info-label { color: ${BRAND.textSecondary}; font-size: 13px; font-weight: 500; }
    .info-value { color: ${BRAND.textPrimary}; font-size: 14px; font-weight: 600; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:${BRAND.color};border-radius:8px;display:inline-block;"></div>
                <span style="font-size:22px;font-weight:700;color:${BRAND.color};letter-spacing:-0.5px;">${BRAND.name}</span>
              </div>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cardBg};border-radius:16px;border:1px solid ${BRAND.border};box-shadow:0 1px 3px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding:40px 36px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px;text-align:center;">
              <p style="font-size:12px;color:${BRAND.textMuted};line-height:1.6;">
                This email was sent by ${BRAND.name}.<br>
                If you didn't request this, you can safely ignore it.
              </p>
              <p style="font-size:11px;color:${BRAND.textMuted};margin-top:12px;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function heading(text: string, emoji?: string): string {
  return `<h1 style="font-size:24px;font-weight:700;color:${BRAND.color};margin-bottom:8px;line-height:1.3;">${emoji ? emoji + ' ' : ''}${text}</h1>`;
}

function subtext(text: string): string {
  return `<p style="font-size:15px;color:${BRAND.textSecondary};line-height:1.6;margin-bottom:24px;">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${BRAND.border};margin:24px 0;" />`;
}

function infoTable(rows: { label: string; value: string }[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    ${rows.map(r => `<tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.textSecondary};font-size:13px;font-weight:500;width:40%;">${r.label}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.textPrimary};font-size:14px;font-weight:600;text-align:right;">${r.value}</td>
    </tr>`).join('')}
  </table>`;
}

function commentBlock(comment: string, accentColor = BRAND.color): string {
  return `<div style="background:#F1F5F9;border-left:4px solid ${accentColor};border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
    <p style="font-size:12px;font-weight:600;color:${BRAND.textSecondary};margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Admin Comment</p>
    <p style="font-size:14px;color:${BRAND.textPrimary};line-height:1.6;margin:0;white-space:pre-wrap;">${escapeHtml(comment)}</p>
  </div>`;
}

function ctaButton(text: string, url: string, bgColor = BRAND.color): string {
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${url}" class="btn" style="display:inline-block;padding:14px 32px;background:${bgColor};color:#ffffff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">${text}</a>
  </div>`;
}

function statusBanner(opts: {
  tone: 'success' | 'warning' | 'danger';
  title: string;
  subtitle: string;
}): string {
  const tones = {
    success: { bg: '#ECFDF5', border: '#A7F3D0', iconBg: '#16A34A', icon: '✓' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', iconBg: '#D97706', icon: '!' },
    danger: { bg: '#FEF2F2', border: '#FECACA', iconBg: '#DC2626', icon: '✕' },
  } as const;
  const t = tones[opts.tone];

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:${t.bg};border:1px solid ${t.border};border-radius:14px;">
    <tr>
      <td style="padding:20px 22px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;padding-right:14px;">
              <div style="width:40px;height:40px;border-radius:999px;background:${t.iconBg};color:#ffffff;font-size:18px;font-weight:700;line-height:40px;text-align:center;">${t.icon}</div>
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">${opts.title}</p>
              <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};line-height:1.5;">${opts.subtitle}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function serviceSummaryCard(opts: {
  serviceName: string;
  labName: string;
  meta: string;
}): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;">
    <tr>
      <td style="padding:18px 20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.textMuted};">Service under review</p>
        <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:${BRAND.color};">${escapeHtml(opts.serviceName)}</p>
        <p style="margin:0;font-size:13px;color:${BRAND.textSecondary};">${escapeHtml(opts.labName)} · ${escapeHtml(opts.meta)}</p>
      </td>
    </tr>
  </table>`;
}

// ═══════════════════════════════════════════════════════
//  EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════

export const emailTemplates = {

  // ─── 1. OTP VERIFICATION ───
  otp(data: { name: string; otp: string; expiresIn?: string }) {
    return baseLayout(`
      ${heading('Verify Your Identity', '🔐')}
      ${subtext(`Hi ${data.name}, use the code below to complete your verification. This code expires in ${data.expiresIn || '10 minutes'}.`)}
      <div style="text-align:center;margin:32px 0;">
        <div style="display:inline-block;background:${BRAND.bg};border:2px solid ${BRAND.border};border-radius:12px;padding:20px 32px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:14px;color:${BRAND.color};font-family:'Courier New',monospace;">${data.otp}</span>
        </div>
      </div>
      <p style="text-align:center;font-size:13px;color:${BRAND.textMuted};">If you didn't request this code, please ignore this email.</p>
    `, `Your verification code is ${data.otp}`);
  },

  // ─── 2. PASSWORD RESET ───
  passwordReset(data: { name: string; resetUrl: string }) {
    return baseLayout(`
      ${heading('Reset Your Password', '🔑')}
      ${subtext(`Hi ${data.name}, we received a request to reset your password. Click the button below to set a new one.`)}
      ${ctaButton('Reset Password', data.resetUrl)}
      <p style="text-align:center;font-size:13px;color:${BRAND.textMuted};">This link expires in 1 hour. If you didn't request this, no action is needed.</p>
    `, 'Reset your password');
  },

  // ─── 3. MAGIC LINK / SETUP PASSWORD ───
  setupAccount(data: { name: string; email: string; role: string; setupUrl: string; labName?: string }) {
    return baseLayout(`
      ${heading('Welcome to CareBis Prime!', '🎉')}
      ${subtext(`Hi ${data.name}, an account has been created for you${data.labName ? ` at <strong>${data.labName}</strong>` : ''}. Click below to set up your password and get started.`)}
      ${infoTable([
        { label: 'Email', value: data.email },
        { label: 'Role', value: data.role.replace('_', ' ') },
        ...(data.labName ? [{ label: 'Organization', value: data.labName }] : []),
      ])}
      ${ctaButton('Set Up My Account', data.setupUrl)}
      <p style="text-align:center;font-size:13px;color:${BRAND.textMuted};">This link expires in 24 hours.</p>
    `, 'Your account has been created');
  },

  // ─── 4. LAB SERVICE APPROVED ───
  labServiceApproved(data: {
    labName: string;
    serviceName: string;
    category: string;
    labPrice: string;
    platformPrice: string;
    turnaroundTime?: string;
    adminComment?: string;
  }) {
    const safeLab = escapeHtml(data.labName);
    const safeService = escapeHtml(data.serviceName);
    const safeCategory = escapeHtml(data.category || 'General');
    const turnaround = data.turnaroundTime ? escapeHtml(data.turnaroundTime) : undefined;

    return baseLayout(`
      ${statusBanner({
        tone: 'success',
        title: 'Service approved',
        subtitle: 'Your listing is now live and available for client bookings on CareBis Prime.',
      })}
      ${heading('Congratulations, ' + safeLab)}
      ${subtext(`Your submitted service <strong>${safeService}</strong> has been reviewed and approved by the CareBis Prime admin team.`)}
      ${serviceSummaryCard({
        serviceName: data.serviceName,
        labName: data.labName,
        meta: `GHS ${data.platformPrice}${data.turnaroundTime ? ` · ${data.turnaroundTime}` : ''}`,
      })}
      ${infoTable([
        { label: 'Service', value: safeService },
        { label: 'Category', value: safeCategory },
        { label: 'Your Price', value: `GHS ${escapeHtml(data.labPrice)}` },
        { label: 'Listed Price', value: `GHS ${escapeHtml(data.platformPrice)}` },
        ...(turnaround ? [{ label: 'Turnaround', value: turnaround }] : []),
        { label: 'Status', value: '<span class="badge-approved">APPROVED</span>' },
      ])}
      ${data.adminComment ? commentBlock(data.adminComment, BRAND.success) : ''}
      ${ctaButton('Open Service Catalog', `${BRAND.url}/lab/services`, BRAND.success)}
      <p style="text-align:center;font-size:12px;color:${BRAND.textMuted};margin:0;">Clients can now discover and book this service from your laboratory.</p>
    `, `Approved: ${data.serviceName} is now live on CareBis Prime`);
  },

  // ─── 5. LAB SERVICE REJECTED ───
  labServiceRejected(data: {
    labName: string;
    serviceName: string;
    category: string;
    adminComment?: string;
  }) {
    const safeLab = escapeHtml(data.labName);
    const safeService = escapeHtml(data.serviceName);
    const safeCategory = escapeHtml(data.category || 'General');

    return baseLayout(`
      ${statusBanner({
        tone: 'warning',
        title: 'Changes requested',
        subtitle: 'Your service was not approved yet. Review the feedback and resubmit when ready.',
      })}
      ${heading('Service review update')}
      ${subtext(`Hi <strong>${safeLab}</strong>, we reviewed <strong>${safeService}</strong> and need a few updates before it can go live.`)}
      ${serviceSummaryCard({
        serviceName: data.serviceName,
        labName: data.labName,
        meta: data.category || 'General',
      })}
      ${infoTable([
        { label: 'Service', value: safeService },
        { label: 'Category', value: safeCategory },
        { label: 'Status', value: '<span class="badge-rejected">REJECTED</span>' },
      ])}
      ${data.adminComment
        ? commentBlock(data.adminComment, BRAND.warning)
        : `<p style="font-size:14px;color:${BRAND.textSecondary};line-height:1.6;">No written comment was provided. Please review pricing, category, and turnaround details, then resubmit.</p>`}
      ${ctaButton('Edit & Resubmit', `${BRAND.url}/lab/services`, BRAND.accent)}
    `, `Action needed: ${data.serviceName} was not approved`);
  },

  // ─── 6. LAB SERVICE REVOKED ───
  labServiceRevoked(data: {
    labName: string;
    serviceName: string;
    category?: string;
    adminComment?: string;
  }) {
    const safeLab = escapeHtml(data.labName);
    const safeService = escapeHtml(data.serviceName);

    return baseLayout(`
      ${statusBanner({
        tone: 'danger',
        title: 'Service revoked',
        subtitle: 'This listing is no longer visible to clients on CareBis Prime.',
      })}
      ${heading('Service access updated')}
      ${subtext(`Hi <strong>${safeLab}</strong>, your previously approved service <strong>${safeService}</strong> has been revoked by the platform admin.`)}
      ${serviceSummaryCard({
        serviceName: data.serviceName,
        labName: data.labName,
        meta: data.category || 'No longer bookable',
      })}
      ${infoTable([
        { label: 'Service', value: safeService },
        { label: 'Status', value: '<span class="badge-rejected">REVOKED</span>' },
      ])}
      ${data.adminComment ? commentBlock(data.adminComment, BRAND.danger) : ''}
      ${ctaButton('View My Services', `${BRAND.url}/lab/services`, BRAND.color)}
      <p style="text-align:center;font-size:12px;color:${BRAND.textMuted};margin:0;">If you believe this was a mistake, reply to this email or contact CareBis Prime support.</p>
    `, `Revoked: ${data.serviceName} is no longer live`);
  },

  // ─── 7. NEW GLOBAL PACKAGE → ALL LABS ───
  newGlobalPackage(data: { labName: string; packageName: string; category: string; description: string; testsIncluded: string[] }) {
    return baseLayout(`
      ${heading('New Package Available!', '📦')}
      ${subtext(`Hi <strong>${data.labName}</strong>, a new health package has been added to the CareBis Prime platform. If your laboratory offers these services, you can add it to your catalog and set your pricing.`)}
      ${infoTable([
        { label: 'Package', value: data.packageName },
        { label: 'Category', value: data.category },
        { label: 'Tests', value: data.testsIncluded.length > 0 ? data.testsIncluded.join(', ') : 'See details' },
      ])}
      <p style="font-size:14px;color:${BRAND.textSecondary};margin:16px 0;line-height:1.6;">${data.description}</p>
      ${ctaButton('Add to My Catalog', `${BRAND.url}/lab/services`)}
    `, `New package "${data.packageName}" is now available`);
  },

  // ─── 8. BOOKING CONFIRMED (RECEIPT) ───
  bookingConfirmed(data: { clientName: string; bookingId: string; packageName: string; labName: string; scheduledDate: string; scheduledTime: string; amount: string }) {
    return baseLayout(`
      ${heading('Booking Confirmed!', '📋')}
      ${subtext(`Hi ${data.clientName}, your health screening has been successfully booked! Here are your booking details:`)}
      ${infoTable([
        { label: 'Booking ID', value: `#${data.bookingId}` },
        { label: 'Package', value: data.packageName },
        { label: 'Laboratory', value: data.labName },
        { label: 'Date', value: data.scheduledDate },
        { label: 'Time', value: data.scheduledTime },
        { label: 'Amount Paid', value: `GHS ${data.amount}` },
      ])}
      ${divider()}
      <p style="font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
        <strong>Preparation Tips:</strong> Please bring a valid ID. If fasting is required for your tests, avoid eating for 8-12 hours before your appointment.
      </p>
      ${ctaButton('View My Bookings', `${BRAND.url}/client/bookings`)}
    `, `Booking confirmed - ${data.packageName} on ${data.scheduledDate}`);
  },

  // ─── 9. BOOKING REMINDER (EARLY — 48h) ───
  bookingReminderEarly(data: { clientName: string; packageName: string; labName: string; scheduledDate: string; scheduledTime: string }) {
    return baseLayout(`
      ${heading('Upcoming Appointment Reminder', '📅')}
      ${subtext(`Hi ${data.clientName}, just a friendly reminder that your health screening is coming up in <strong>2 days</strong>.`)}
      ${infoTable([
        { label: 'Package', value: data.packageName },
        { label: 'Laboratory', value: data.labName },
        { label: 'Date', value: data.scheduledDate },
        { label: 'Time', value: data.scheduledTime },
      ])}
      ${divider()}
      <p style="font-size:13px;color:${BRAND.textSecondary};line-height:1.6;">
        <strong>Remember:</strong> If your tests require fasting, please avoid food for 8-12 hours prior. Stay hydrated!
      </p>
      ${ctaButton('View Booking Details', `${BRAND.url}/client/bookings`)}
    `, `Your appointment on ${data.scheduledDate} is in 2 days`);
  },

  // ─── 10. BOOKING REMINDER (DAY-OF) ───
  bookingReminderDayOf(data: { clientName: string; packageName: string; labName: string; scheduledTime: string; labAddress?: string }) {
    return baseLayout(`
      ${heading("Today's Your Screening Day!", '🏥')}
      ${subtext(`Hi ${data.clientName}, your health screening is <strong>today</strong>. We look forward to seeing you!`)}
      ${infoTable([
        { label: 'Package', value: data.packageName },
        { label: 'Laboratory', value: data.labName },
        { label: 'Time', value: data.scheduledTime },
        ...(data.labAddress ? [{ label: 'Address', value: data.labAddress }] : []),
      ])}
      ${ctaButton('View Booking', `${BRAND.url}/client/bookings`)}
    `, `Your screening is today at ${data.scheduledTime}`);
  },

  // ─── 11. NEW BOOKING → LAB ───
  newBookingForLab(data: { labName: string; clientName: string; packageName: string; scheduledDate: string; bookingId: string }) {
    return baseLayout(`
      ${heading('New Booking Received!', '🔔')}
      ${subtext(`Hi <strong>${data.labName}</strong>, a new client has booked a screening at your facility.`)}
      ${infoTable([
        { label: 'Booking ID', value: `#${data.bookingId}` },
        { label: 'Client', value: data.clientName },
        { label: 'Package', value: data.packageName },
        { label: 'Scheduled', value: data.scheduledDate },
      ])}
      ${ctaButton('View Bookings', `${BRAND.url}/lab/bookings`)}
    `, `New booking from ${data.clientName}`);
  },

  // ─── 12. RESULTS READY → CLIENT ───
  resultsReady(data: { clientName: string; packageName: string; labName: string }) {
    return baseLayout(`
      ${heading('Your Results Are Ready!', '📊')}
      ${subtext(`Hi ${data.clientName}, your screening results from <strong>${data.labName}</strong> are now available. Log in to view your detailed report.`)}
      ${infoTable([
        { label: 'Package', value: data.packageName },
        { label: 'Laboratory', value: data.labName },
        { label: 'Status', value: '<span class="badge-approved">READY</span>' },
      ])}
      ${ctaButton('View My Results', `${BRAND.url}/client/results`)}
    `, `Your ${data.packageName} results are ready`);
  },

  // ─── 13. INTERPRETATION COMPLETE → CLIENT + LAB ───
  interpretationComplete(data: { recipientName: string; patientName: string; packageName: string; interpreterName: string }) {
    return baseLayout(`
      ${heading('Interpretation Complete', '🩺')}
      ${subtext(`The screening results for <strong>${data.patientName}</strong> have been interpreted by <strong>${data.interpreterName}</strong> and are ready for review.`)}
      ${infoTable([
        { label: 'Patient', value: data.patientName },
        { label: 'Package', value: data.packageName },
        { label: 'Interpreted By', value: data.interpreterName },
      ])}
      ${ctaButton('View Interpretation', `${BRAND.url}/results`)}
    `, `Interpretation complete for ${data.patientName}`);
  },

  // ─── 14. PAYMENT RECEIVED (RECEIPT) ───
  paymentReceipt(data: { clientName: string; amount: string; invoiceId: string; packageName: string; paymentMethod: string; date: string }) {
    return baseLayout(`
      ${heading('Payment Received', '💳')}
      ${subtext(`Hi ${data.clientName}, we've received your payment. Here's your receipt:`)}
      ${infoTable([
        { label: 'Invoice', value: `#${data.invoiceId}` },
        { label: 'Package', value: data.packageName },
        { label: 'Amount', value: `GHS ${data.amount}` },
        { label: 'Method', value: data.paymentMethod },
        { label: 'Date', value: data.date },
      ])}
      <div style="text-align:center;margin:24px 0;">
        <span class="badge-approved">PAID</span>
      </div>
      ${ctaButton('View Invoice', `${BRAND.url}/client/billing`)}
    `, `Payment of GHS ${data.amount} received`);
  },

  // ─── 15. INVOICE GENERATED ───
  invoiceGenerated(data: { clientName: string; amount: string; invoiceId: string; dueDate: string; packageName: string }) {
    return baseLayout(`
      ${heading('New Invoice', '🧾')}
      ${subtext(`Hi ${data.clientName}, a new invoice has been generated for your health screening.`)}
      ${infoTable([
        { label: 'Invoice', value: `#${data.invoiceId}` },
        { label: 'Package', value: data.packageName },
        { label: 'Amount Due', value: `GHS ${data.amount}` },
        { label: 'Due Date', value: data.dueDate },
      ])}
      ${ctaButton('Pay Now', `${BRAND.url}/client/billing`)}
    `, `Invoice #${data.invoiceId} — GHS ${data.amount} due`);
  },

  // ─── 16. NEW LAB REGISTRATION → ADMIN ───
  newLabRegistration(data: { labName: string; labCode: string; contactEmail: string; city: string }) {
    return baseLayout(`
      ${heading('New Laboratory Registered', '🏗️')}
      ${subtext('A new laboratory has just been registered on the CareBis Prime platform and requires your attention.')}
      ${infoTable([
        { label: 'Lab Name', value: data.labName },
        { label: 'Code', value: data.labCode },
        { label: 'Contact', value: data.contactEmail },
        { label: 'Location', value: data.city },
      ])}
      ${ctaButton('Review Labs', `${BRAND.url}/admin/laboratories`)}
    `, `New lab "${data.labName}" registered`);
  },

  // ─── 17. ACCOUNT DEACTIVATED ───
  accountDeactivated(data: { name: string; reason?: string }) {
    return baseLayout(`
      ${heading('Account Deactivated', '⚠️')}
      ${subtext(`Hi ${data.name}, your CareBis Prime account has been deactivated by an administrator.`)}
      ${data.reason ? commentBlock(data.reason) : ''}
      <p style="font-size:14px;color:${BRAND.textSecondary};line-height:1.6;margin:16px 0;">
        If you believe this is a mistake, please contact our support team for assistance.
      </p>
    `, 'Your account has been deactivated');
  },

  // ─── 18. BOOKING CANCELLED ───
  bookingCancelled(data: { recipientName: string; bookingId: string; packageName: string; date: string; canceledBy: string; reason?: string }) {
    return baseLayout(`
      ${heading('Booking Cancelled', '❌')}
      ${subtext(`Hi ${data.recipientName}, the booking for <strong>${data.packageName}</strong> scheduled on ${data.date} has been cancelled by ${data.canceledBy}.`)}
      ${infoTable([
        { label: 'Booking ID', value: `#${data.bookingId}` },
        { label: 'Package', value: data.packageName },
        { label: 'Date', value: data.date },
      ])}
      ${data.reason ? commentBlock(data.reason) : ''}
      <p style="font-size:14px;color:${BRAND.textSecondary};line-height:1.6;margin:16px 0;">
        If you need to reschedule, please visit your dashboard.
      </p>
      ${ctaButton('Go to Dashboard', BRAND.url)}
    `, `Booking #${data.bookingId} cancelled`);
  },

  // ─── 19. PAYMENT FAILED ───
  paymentFailed(data: { clientName: string; invoiceId: string; amount: string; packageName: string }) {
    return baseLayout(`
      ${heading('Payment Failed', '⚠️')}
      ${subtext(`Hi ${data.clientName}, we were unable to process your payment of <strong>GHS ${data.amount}</strong> for the <strong>${data.packageName}</strong> package.`)}
      ${infoTable([
        { label: 'Invoice', value: `#${data.invoiceId}` },
        { label: 'Package', value: data.packageName },
        { label: 'Amount', value: `GHS ${data.amount}` },
        { label: 'Status', value: '<span class="badge-rejected">FAILED</span>' },
      ])}
      <p style="font-size:14px;color:${BRAND.textSecondary};line-height:1.6;margin:16px 0;">
        Please update your payment method or try again to avoid any delays in your service.
      </p>
      ${ctaButton('Retry Payment', `${BRAND.url}/client/billing`)}
    `, `Action Required: Payment failed for Invoice #${data.invoiceId}`);
  },

  // ─── 20. CRITICAL RESULT ALERT ───
  criticalResultAlert(data: { adminName: string; patientName: string; labName: string; packageName: string; resultId: string }) {
    return baseLayout(`
      ${heading('URGENT: Critical Result Flagged', '🚨')}
      ${subtext(`Hi ${data.adminName}, a new result containing <strong>critical/abnormal values</strong> has just been uploaded and requires immediate attention.`)}
      ${infoTable([
        { label: 'Patient', value: data.patientName },
        { label: 'Laboratory', value: data.labName },
        { label: 'Package', value: data.packageName },
        { label: 'Priority', value: '<span class="badge-rejected" style="background:#DC2626;color:#FFF;border-color:#B91C1C;">CRITICAL</span>' },
      ])}
      ${ctaButton('Review Result Now', `${BRAND.url}/admin/results/${data.resultId}`)}
    `, `URGENT: Critical Result for ${data.patientName}`);
  },

  // ─── 21. NEW EDUCATIONAL CONTENT ───
  newEducationalContent(data: { clientName: string; title: string; type: string; summary: string }) {
    const isTip = data.type === 'PREVENTIVE_TIP';
    return baseLayout(`
      ${heading(isTip ? 'New Preventive Health Tip' : 'New Health Education Card', isTip ? '💡' : '📚')}
      ${subtext(`Hi ${data.clientName}, we've published new content to help you on your health journey!`)}
      <div style="background:#F1F5F9;border-radius:12px;padding:24px;margin:20px 0;">
        <h3 style="font-size:18px;font-weight:700;color:${BRAND.textPrimary};margin-bottom:12px;margin-top:0;">${data.title}</h3>
        <p style="font-size:15px;color:${BRAND.textSecondary};line-height:1.6;margin:0;">${data.summary}</p>
      </div>
      ${ctaButton('Read More', `${BRAND.url}/client/advocacy`)}
    `, `New Health Content: ${data.title}`);
  },

  // ─── 22. ADVOCACY TASK ASSIGNED ───
  advocacyTaskAssigned(data: { staffName: string; patientName: string; taskTitle: string; priority: string; dueDate: string }) {
    return baseLayout(`
      ${heading('New Task Assigned', '📋')}
      ${subtext(`Hi ${data.staffName}, a new patient advocacy task has been assigned to you.`)}
      ${infoTable([
        { label: 'Patient', value: data.patientName },
        { label: 'Task', value: data.taskTitle },
        { label: 'Priority', value: data.priority },
        { label: 'Due Date', value: data.dueDate },
      ])}
      ${ctaButton('View Task', `${BRAND.url}/staff/advocacy`)}
    `, `New Task: ${data.taskTitle}`);
  },

  // ─── 23. POST-SCREENING FEEDBACK REQUEST ───
  feedbackRequest(data: { clientName: string; labName: string; packageName: string }) {
    return baseLayout(`
      ${heading('How was your experience?', '⭐')}
      ${subtext(`Hi ${data.clientName}, thank you for completing your <strong>${data.packageName}</strong> screening with <strong>${data.labName}</strong>.`)}
      <p style="font-size:15px;color:${BRAND.textSecondary};line-height:1.6;margin:16px 0;">
        We constantly strive to improve our services and your feedback is incredibly valuable to us. Please take 2 minutes to let us know how we did.
      </p>
      ${ctaButton('Leave Feedback', `${BRAND.url}/client/feedback`)}
    `, `How was your screening at ${data.labName}?`);
  },

  // ─── GENERIC NOTIFICATION ───
  notification(data: { message: string; name?: string }) {
    return baseLayout(`
      ${heading('Notification', '🔔')}
      ${subtext(`Hi${data.name ? ` ${data.name}` : ''}, you have a new notification:`)}
      <div style="background:${BRAND.bg};border-radius:12px;padding:20px;margin:16px 0;">
        <p style="font-size:15px;color:${BRAND.textPrimary};line-height:1.7;margin:0;">${data.message}</p>
      </div>
      ${ctaButton('Go to Dashboard', BRAND.url)}
    `, data.message.substring(0, 100));
  },
};

export type EmailTemplateKey = keyof typeof emailTemplates;
