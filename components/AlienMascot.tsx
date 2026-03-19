import Image from 'next/image'

export default function AlienMascot({ size = 90 }: { size?: number }) {
  return (
    <Image
      src="/alien.png"
      alt="三眼仔"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}
