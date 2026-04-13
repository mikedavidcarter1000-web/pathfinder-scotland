const FROM = 'Pathfinder Scotland <noreply@pathfinderscot.co.uk>'

interface LinkEmailPayload {
  parentName: string
  parentEmail: string
  studentName: string
  studentEmail: string
}

function parentEmailBody({ parentName, studentName }: LinkEmailPayload): {
  subject: string
  text: string
} {
  return {
    subject: `You're now linked to ${studentName}'s Pathfinder account`,
    text: [
      `Hi ${parentName},`,
      '',
      `You're now linked to ${studentName}'s Pathfinder Scotland account.`,
      '',
      'From your dashboard you can view their saved courses, progress, bursary matches, and grade summary. Your child controls their own profile — you can view their progress but not make changes.',
      '',
      'Sign in at https://pathfinderscot.co.uk/dashboard to get started.',
      '',
      "If you didn't expect this email, you can ignore it — your link will remain active until the student revokes it.",
      '',
      '— Pathfinder Scotland',
    ].join('\n'),
  }
}

function studentEmailBody({ parentName, studentName }: LinkEmailPayload): {
  subject: string
  text: string
} {
  return {
    subject: `${parentName} is now linked to your Pathfinder account`,
    text: [
      `Hi ${studentName},`,
      '',
      `${parentName} has successfully linked to your Pathfinder Scotland account using the invite code you shared.`,
      '',
      'They can view your saved courses, progress, bursary matches, and grade summary. They cannot edit your profile or make changes on your behalf.',
      '',
      'You can revoke their access at any time from your settings: https://pathfinderscot.co.uk/dashboard/settings',
      '',
      "If you didn't share a code with them, revoke access now.",
      '',
      '— Pathfinder Scotland',
    ].join('\n'),
  }
}

async function sendResend(
  to: string,
  subject: string,
  text: string,
  apiKey: string
): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, text }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Resend API error ${res.status}: ${detail}`)
  }
}

export async function sendParentLinkEmails(payload: LinkEmailPayload): Promise<{
  sent: boolean
  skipped?: string
}> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.info(
      '[parent-link] RESEND_API_KEY not set — skipping email send',
      payload
    )
    return { sent: false, skipped: 'resend-not-configured' }
  }

  const parent = parentEmailBody(payload)
  const student = studentEmailBody(payload)

  // Send in parallel. A failure of one should not block the other — but do
  // surface any failure via the thrown error so the API route can log it.
  const results = await Promise.allSettled([
    sendResend(payload.parentEmail, parent.subject, parent.text, apiKey),
    sendResend(payload.studentEmail, student.subject, student.text, apiKey),
  ])

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    const reasons = failures
      .map((f) => (f as PromiseRejectedResult).reason)
      .map((r) => (r instanceof Error ? r.message : String(r)))
      .join('; ')
    throw new Error(`parent-link email send failed: ${reasons}`)
  }

  return { sent: true }
}
