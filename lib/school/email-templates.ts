// School-branded email templates for Pathfinder Scotland.
//
// Every template returns { subject, html, text } so callers can pass all
// three to Resend without re-deriving anything. All HTML is 600px-max
// single-column responsive; text fallback is always populated.
//
// The wrapper escapes nothing -- template functions are expected to
// escape user-supplied data via `escapeHtml` before calling.

export type EmailOut = {
  subject: string
  html: string
  text: string
}

export type BrandContext = {
  schoolName: string
  headerColour: string
  logoUrl: string | null
}

export function escapeHtml(input: string | null | undefined): string {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Common HTML wrapper. Body parameter is pre-escaped trusted HTML.
export function wrapSchoolEmail(brand: BrandContext, bodyHtml: string): string {
  const safeName = escapeHtml(brand.schoolName)
  const colour = isValidHexColour(brand.headerColour) ? brand.headerColour : '#1B3A5C'
  const logo = brand.logoUrl
    ? `<img src="${escapeHtml(brand.logoUrl)}" alt="${safeName} logo" style="max-height:40px;width:auto;display:block;margin-bottom:6px;" />`
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${safeName}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f4f5f7;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:${colour};padding:20px 24px;color:#ffffff;">
              ${logo}
              <div style="font-size:18px;font-weight:700;">${safeName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;line-height:1.5;font-size:15px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f4f5f7;font-size:12px;color:#555555;">
              This email was sent by Pathfinder Scotland on behalf of ${safeName}.
              Manage your notification preferences at
              <a href="https://pathfinderscot.co.uk" style="color:#1B3A5C;">pathfinderscot.co.uk</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function isValidHexColour(value: string | null | undefined): boolean {
  if (!value) return false
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value)
}

function ctaButton(href: string, label: string, colour: string): string {
  return `<div style="margin:20px 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 20px;background:${escapeHtml(
    colour
  )};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${escapeHtml(label)}</a>
  </div>`
}

function bookingTableHtml(
  rows: Array<{ teacherName: string; subject: string; time: string; room: string | null }>
): string {
  if (rows.length === 0) return ''
  const headerCell = 'padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:left;font-weight:600;font-size:13px;'
  const bodyCell = 'padding:8px 10px;border-bottom:1px solid #f1f3f5;font-size:14px;'
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:12px 0;border:1px solid #e5e7eb;border-radius:6px;border-collapse:separate;border-spacing:0;">
    <thead>
      <tr style="background:#f8fafc;">
        <th style="${headerCell}">Time</th>
        <th style="${headerCell}">Teacher</th>
        <th style="${headerCell}">Subject</th>
        <th style="${headerCell}">Room</th>
      </tr>
    </thead>
    <tbody>
      ${rows
        .map(
          (r) => `<tr>
        <td style="${bodyCell}">${escapeHtml(r.time)}</td>
        <td style="${bodyCell}">${escapeHtml(r.teacherName)}</td>
        <td style="${bodyCell}">${escapeHtml(r.subject)}</td>
        <td style="${bodyCell}">${escapeHtml(r.room ?? '—')}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>`
}

function bookingTableText(
  rows: Array<{ teacherName: string; subject: string; time: string; room: string | null }>
): string {
  if (rows.length === 0) return ''
  return rows
    .map((r) => `  - ${r.time}  ${r.teacherName}  (${r.subject})  Room ${r.room ?? '—'}`)
    .join('\n')
}

// 5a reportReady
export function reportReadyEmail(data: {
  schoolName: string
  studentName: string
  cycleName: string
  dashboardUrl: string
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Tracking report available for ${data.studentName}`
  const body = `<p>Dear parent or carer,</p>
    <p>The <strong>${escapeHtml(data.cycleName)}</strong> tracking report for
    <strong>${escapeHtml(data.studentName)}</strong> is now available.
    You can view it on your Pathfinder dashboard.</p>
    ${ctaButton(data.dashboardUrl, 'View report', data.headerColour)}
    <p style="font-size:13px;color:#555;">If you have questions about the report,
    please contact the school office.</p>`
  const text = `Dear parent or carer,

The ${data.cycleName} tracking report for ${data.studentName} is now available.
View it on your Pathfinder dashboard: ${data.dashboardUrl}

If you have questions about the report, please contact the school office.

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5b parentEveningOpen
export function parentEveningOpenEmail(data: {
  schoolName: string
  eveningName: string
  eventDate: string
  bookingCloses: string
  bookingUrl: string
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Book your parents' evening appointments`
  const body = `<p>Dear parent or carer,</p>
    <p>Booking is now open for <strong>${escapeHtml(data.eveningName)}</strong>
    on <strong>${escapeHtml(data.eventDate)}</strong>.</p>
    <p>Please book your appointments before <strong>${escapeHtml(data.bookingCloses)}</strong>.</p>
    ${ctaButton(data.bookingUrl, 'Book appointments', data.headerColour)}`
  const text = `Dear parent or carer,

Booking is now open for ${data.eveningName} on ${data.eventDate}.
Please book your appointments before ${data.bookingCloses}.

Book now: ${data.bookingUrl}

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5c parentEveningConfirmation
export function parentEveningConfirmationEmail(data: {
  schoolName: string
  eveningName: string
  eventDate: string
  bookings: Array<{ teacherName: string; subject: string; time: string; room: string | null }>
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Parents' evening appointments confirmed`
  const body = `<p>Dear parent or carer,</p>
    <p>Your appointments for <strong>${escapeHtml(data.eveningName)}</strong>
    on <strong>${escapeHtml(data.eventDate)}</strong> are confirmed:</p>
    ${bookingTableHtml(data.bookings)}
    <p>Please arrive 5 minutes before your first appointment.</p>`
  const text = `Dear parent or carer,

Your appointments for ${data.eveningName} on ${data.eventDate} are confirmed:

${bookingTableText(data.bookings)}

Please arrive 5 minutes before your first appointment.

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5d parentEveningReminder
export function parentEveningReminderEmail(data: {
  schoolName: string
  eveningName: string
  eventDate: string
  firstTime: string
  bookings: Array<{ teacherName: string; subject: string; time: string; room: string | null }>
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Reminder: Parents' evening tomorrow`
  const body = `<p>Dear parent or carer,</p>
    <p>Your parents' evening appointments are tomorrow.
    Your first appointment is at <strong>${escapeHtml(data.firstTime)}</strong>.</p>
    ${bookingTableHtml(data.bookings)}`
  const text = `Dear parent or carer,

Your parents' evening appointments are tomorrow (${data.eventDate}).
Your first appointment is at ${data.firstTime}.

${bookingTableText(data.bookings)}

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5e choiceDeadline
export function choiceDeadlineEmail(data: {
  schoolName: string
  studentName: string
  roundName: string
  closesAt: string
  choiceUrl: string
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Subject choices close on ${data.closesAt}`
  const body = `<p>Dear parent or carer,</p>
    <p><strong>${escapeHtml(data.studentName)}</strong> has not yet submitted their subject choices for
    <strong>${escapeHtml(data.roundName)}</strong>.</p>
    <p>Choices close on <strong>${escapeHtml(data.closesAt)}</strong>.</p>
    ${ctaButton(data.choiceUrl, 'View choices', data.headerColour)}`
  const text = `Dear parent or carer,

${data.studentName} has not yet submitted their subject choices for ${data.roundName}.
Choices close on ${data.closesAt}.

View choices: ${data.choiceUrl}

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5f choiceSubmitted
export function choiceSubmittedEmail(data: {
  schoolName: string
  studentName: string
  subjects: string[]
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Subject choices received for ${data.studentName}`
  const list = data.subjects.length
    ? data.subjects.map((s) => `<li>${escapeHtml(s)}</li>`).join('')
    : '<li>(no subjects listed)</li>'
  const body = `<p>Dear parent or carer,</p>
    <p><strong>${escapeHtml(data.studentName)}</strong> has submitted their subject choices:</p>
    <ul>${list}</ul>
    <p>The school will confirm these in due course.</p>`
  const text = `Dear parent or carer,

${data.studentName} has submitted their subject choices:

${data.subjects.length ? data.subjects.map((s) => `  - ${s}`).join('\n') : '  (no subjects listed)'}

The school will confirm these in due course.

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5g choiceApprovalNeeded
export function choiceApprovalNeededEmail(data: {
  schoolName: string
  studentName: string
  approvalUrl: string
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - Please review ${data.studentName}'s subject choices`
  const body = `<p>Dear parent or carer,</p>
    <p><strong>${escapeHtml(data.studentName)}</strong> has submitted their subject choices and your approval is required.</p>
    <p>Please review and approve before the school can finalise the selection.</p>
    ${ctaButton(data.approvalUrl, 'Review choices', data.headerColour)}`
  const text = `Dear parent or carer,

${data.studentName} has submitted their subject choices and your approval is required.
Please review and approve: ${data.approvalUrl}

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, body), text }
}

// 5h genericSchoolMessage
export function genericSchoolMessageEmail(data: {
  schoolName: string
  title: string
  body: string
  headerColour: string
  logoUrl: string | null
}): EmailOut {
  const brand: BrandContext = { schoolName: data.schoolName, headerColour: data.headerColour, logoUrl: data.logoUrl }
  const subject = `${data.schoolName} - ${data.title}`
  // User-supplied body text -- escape + preserve paragraph breaks.
  const paragraphs = data.body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('')
  const bodyHtml = `<h2 style="margin:0 0 12px 0;font-size:18px;">${escapeHtml(data.title)}</h2>${paragraphs}`
  const text = `${data.title}

${data.body}

-- Pathfinder Scotland on behalf of ${data.schoolName}`
  return { subject, html: wrapSchoolEmail(brand, bodyHtml), text }
}
