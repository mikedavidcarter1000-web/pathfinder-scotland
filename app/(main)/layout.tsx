export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The root layout already provides the <main id="main-content"> landmark,
  // so this nested layout is just a passthrough — avoids double <main>.
  return <>{children}</>
}
