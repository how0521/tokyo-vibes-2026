interface CloudDecorProps {
  className?: string
  style?: React.CSSProperties
  opacity?: number
  width?: number
}

export default function CloudDecor({ className = '', style, opacity = 0.85, width = 110 }: CloudDecorProps) {
  const h = Math.round(width * 0.55)
  const fill = `rgba(255,255,255,${opacity})`
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 110 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Base body */}
      <ellipse cx="55" cy="52" rx="48" ry="14" fill={fill} />
      {/* Left puff */}
      <circle cx="28" cy="40" r="19" fill={fill} />
      {/* Center puff — tallest */}
      <circle cx="55" cy="28" r="25" fill={fill} />
      {/* Right puff */}
      <circle cx="82" cy="38" r="20" fill={fill} />
    </svg>
  )
}
