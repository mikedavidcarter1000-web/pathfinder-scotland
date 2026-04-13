import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    product: [
      { label: 'Discover', href: '/discover' },
      { label: 'Careers', href: '/careers' },
      { label: 'AI & Careers', href: '/ai-careers' },
      { label: 'Subjects', href: '/subjects' },
      { label: 'Plan Choices', href: '/pathways' },
      { label: 'Alternative Pathways', href: '/pathways/alternatives' },
      { label: 'Simulator', href: '/simulator' },
      { label: 'Courses', href: '/courses' },
      { label: 'Universities', href: '/universities' },
      { label: 'Colleges', href: '/colleges' },
      { label: 'Cost Calculator', href: '/tools/roi-calculator' },
      { label: 'Grade Sensitivity', href: '/tools/grade-sensitivity' },
      { label: 'Widening Access', href: '/widening-access' },
      { label: 'Bursaries & Funding', href: '/bursaries' },
      { label: 'Student Benefits', href: '/benefits' },
      { label: 'For Parents', href: '/parents' },
      { label: 'Guides & Articles', href: '/blog' },
    ],
    schools: [
      { label: 'Demo', href: '/demo' },
      { label: 'Pilot programme', href: 'mailto:hello@pathfinderscot.co.uk?subject=Pilot%20school%20interest', external: true },
      { label: 'Funding enquiries', href: 'mailto:hello@pathfinderscot.co.uk?subject=Funding%20enquiry', external: true },
    ],
    useful: [
      { label: 'Qualifications Scotland', href: 'https://www.sqa.org.uk', external: true },
      { label: 'Education Scotland', href: 'https://education.gov.scot', external: true },
      { label: 'UCAS', href: 'https://www.ucas.com', external: true },
      { label: 'My World of Work', href: 'https://www.myworldofwork.co.uk', external: true },
      { label: 'apprenticeships.scot', href: 'https://www.apprenticeships.scot', external: true },
      { label: 'SAAS', href: 'https://www.saas.gov.uk', external: true },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Resources', href: '/resources' },
      { label: 'Help Centre', href: '/help' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  }

  const bodyLinkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.875rem',
  }

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    color: '#fff',
    fontSize: '0.9375rem',
    marginBottom: '16px',
    textTransform: 'none',
  }

  return (
    <footer
      style={{
        backgroundColor: 'var(--pf-blue-900)',
        color: '#fff',
        paddingTop: '48px',
        paddingBottom: '48px',
      }}
    >
      <div className="pf-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-center sm:text-left">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center justify-center sm:justify-start gap-2 mb-4 no-underline hover:no-underline"
              style={{ color: '#fff' }}
            >
              <Image
                src="/logo-white.svg"
                alt=""
                role="presentation"
                width={32}
                height={32}
                loading="lazy"
                style={{ display: 'block', flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: '#fff',
                }}
              >
                Pathfinder Scotland
              </span>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.6 }}>
              Your trusted guide through Scottish secondary and higher education.
            </p>
            <div className="flex gap-4 justify-center sm:justify-start">
              <a
                href="https://twitter.com/pathfinderscot"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                className="hover:opacity-100 transition-opacity no-underline hover:no-underline"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://instagram.com/pathfinderscot"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)' }}
                className="hover:opacity-100 transition-opacity no-underline hover:no-underline"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 style={headingStyle}>Product</h3>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={bodyLinkStyle} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Schools & Funders */}
          <div>
            <h3 style={headingStyle}>For Schools &amp; Funders</h3>
            <ul className="space-y-2">
              {links.schools.map((link) => (
                <li key={link.href}>
                  {'external' in link && link.external ? (
                    <a href={link.href} style={bodyLinkStyle} className="hover:text-white">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} style={bodyLinkStyle} className="hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Useful external links */}
          <div>
            <h3 style={headingStyle}>Useful Links</h3>
            <ul className="space-y-2">
              {links.useful.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={bodyLinkStyle}
                    className="inline-flex items-center gap-1 hover:text-white"
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 style={headingStyle}>Company</h3>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.href}>
                  {'external' in link && link.external ? (
                    <a href={link.href} style={bodyLinkStyle} className="hover:text-white">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} style={bodyLinkStyle} className="hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left"
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            &copy; {currentYear} Pathfinder Scotland. All rights reserved.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
            Built in Scotland, for Scottish students.
          </p>
        </div>
      </div>
    </footer>
  )
}
