import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function isImageAvatar(avatar) {
  return typeof avatar === 'string' && avatar.startsWith('/avatars/')
}

export function getAvatarImageSrc(avatar) {
  if (!isImageAvatar(avatar)) return avatar

  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = avatar.replace(/^\/+/, '')

  return `${normalizedBase}${normalizedPath}`
}

export default function Avatar({
  avatar,
  label = 'Avatar',
  className = '',
  imageClassName = '',
  fallback = '⚽',
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [avatar])

  if (isImageAvatar(avatar) && !failed) {
    return (
      <img
        src={getAvatarImageSrc(avatar)}
        alt={label}
        onError={() => setFailed(true)}
        className={clsx('rounded-full object-cover', imageClassName || 'h-6 w-6')}
      />
    )
  }

  return <span className={className}>{avatar && !isImageAvatar(avatar) ? avatar : fallback}</span>
}
