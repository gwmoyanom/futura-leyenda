import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function isImageAvatar(avatar) {
  return typeof avatar === 'string' && avatar.startsWith('/avatars/')
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
        src={avatar}
        alt={label}
        onError={() => setFailed(true)}
        className={clsx('rounded-full object-cover', imageClassName || 'h-6 w-6')}
      />
    )
  }

  return <span className={className}>{avatar && !isImageAvatar(avatar) ? avatar : fallback}</span>
}
