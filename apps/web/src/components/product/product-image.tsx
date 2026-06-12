'use client'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
  src?: string | null
  alt: string
  fallbackEmoji?: string
  size: number
  padding?: number
}

export function ProductImage({ src, alt, fallbackEmoji = '📦', size, padding = 8 }: Props) {
  const [failed, setFailed] = useState(!src)

  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#f5f0ea',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {!failed && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: 'contain', padding }}
          onError={() => setFailed(true)}
          unoptimized
        />
      ) : (
        <span style={{ fontSize: size * 0.35 }}>{fallbackEmoji}</span>
      )}
    </div>
  )
}
