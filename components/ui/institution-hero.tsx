'use client'

import Image from 'next/image'

interface InstitutionHeroProps {
  imageUrl: string | null | undefined
  alt: string
}

export function InstitutionHero({ imageUrl, alt }: InstitutionHeroProps) {
  if (!imageUrl) {
    return (
      <div
        aria-hidden="true"
        className="w-full"
        style={{
          height: 'clamp(200px, 30vw, 300px)',
          background:
            'linear-gradient(135deg, var(--pf-blue-700) 0%, var(--pf-blue-500) 100%)',
        }}
      />
    )
  }
  return (
    <div
      className="relative w-full"
      style={{
        height: 'clamp(200px, 30vw, 300px)',
        backgroundColor: 'var(--pf-blue-100)',
        overflow: 'hidden',
      }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      {/* Dark gradient overlay at bottom for legible overlay text */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0"
        style={{
          height: '40%',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />
    </div>
  )
}
