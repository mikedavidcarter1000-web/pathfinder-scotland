// Simple word-level diff using the longest-common-subsequence algorithm.
// Designed for short texts (max 4,000 characters per question), so the
// O(n*m) memory cost is fine. Output is a flat list of segments tagged
// as added / removed / unchanged so the renderer can colour them.

export type DiffSegment = {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

function tokenise(text: string): string[] {
  // Split on whitespace AND keep whitespace as its own token so that the
  // re-joined output preserves spacing. The split-with-capture approach is
  // cheaper than a token+separator round-trip.
  return text.split(/(\s+)/).filter((t) => t.length > 0)
}

export function diffWords(oldText: string, newText: string): DiffSegment[] {
  const a = tokenise(oldText)
  const b = tokenise(newText)
  const n = a.length
  const m = b.length

  // Build LCS lengths table.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Walk the table backwards to recover the diff. Build a reverse list and
  // reverse it once at the end (cheaper than unshift in a loop).
  const out: DiffSegment[] = []
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.push({ type: 'unchanged', text: a[i - 1] })
      i -= 1
      j -= 1
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.push({ type: 'removed', text: a[i - 1] })
      i -= 1
    } else {
      out.push({ type: 'added', text: b[j - 1] })
      j -= 1
    }
  }
  while (i > 0) {
    out.push({ type: 'removed', text: a[i - 1] })
    i -= 1
  }
  while (j > 0) {
    out.push({ type: 'added', text: b[j - 1] })
    j -= 1
  }
  out.reverse()

  // Coalesce adjacent same-type segments to avoid render churn.
  const merged: DiffSegment[] = []
  for (const seg of out) {
    const last = merged[merged.length - 1]
    if (last && last.type === seg.type) {
      last.text += seg.text
    } else {
      merged.push({ ...seg })
    }
  }
  return merged
}
