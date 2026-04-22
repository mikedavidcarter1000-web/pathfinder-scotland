// Generates a deterministic-ish school join code from the school name.
// First 5 letters of name, stripped to A-Z, uppercased + two-digit year.
// e.g. "Royal High School" + 2026 -> "ROYAL26". Duplicates are salted with
// a random 2-digit suffix.

export function generateInitialJoinCode(schoolName: string, year: number = new Date().getFullYear()): string {
  const letters = schoolName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'SCHOOL'
  const yy = String(year).slice(-2)
  return `${letters}${yy}`
}

// Salt an existing code with a random 2-digit suffix.
export function saltJoinCode(base: string): string {
  const suffix = Math.floor(Math.random() * 90 + 10).toString()
  return `${base}${suffix}`
}

// Slugify a school name for use in URLs and as the `slug` column value.
export function slugifySchoolName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+)|(-+$)/g, '')
    .slice(0, 80) || 'school'
}
