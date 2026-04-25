import { AuthorityShell } from '@/components/authority/authority-shell'

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  return <AuthorityShell>{children}</AuthorityShell>
}
