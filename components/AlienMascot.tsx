export default function AlienMascot({ size = 90 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="三眼仔"
    >
      {/* Antenna stem */}
      <line x1="40" y1="26" x2="40" y2="10" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Antenna ball */}
      <circle cx="40" cy="8" r="5.5" fill="#FFD700" />
      <circle cx="38" cy="6" r="1.8" fill="rgba(255,255,255,0.6)" />

      {/* Head */}
      <ellipse cx="40" cy="52" rx="27" ry="28" fill="#5DB85D" />
      {/* Head highlight */}
      <ellipse cx="32" cy="42" rx="10" ry="12" fill="rgba(255,255,255,0.14)" />

      {/* — Left eye — */}
      <ellipse cx="25" cy="51" rx="8" ry="9" fill="white" />
      <circle cx="26" cy="52" r="5.5" fill="#1A237E" />
      <circle cx="24.5" cy="50.5" r="2.2" fill="#0a0a0a" />
      <circle cx="22.5" cy="48.5" r="1.5" fill="white" />

      {/* — Center eye (slightly larger & higher) — */}
      <ellipse cx="40" cy="49" rx="9" ry="10" fill="white" />
      <circle cx="41" cy="50" r="6.5" fill="#1A237E" />
      <circle cx="39.5" cy="48.5" r="2.6" fill="#0a0a0a" />
      <circle cx="37" cy="46.5" r="1.8" fill="white" />

      {/* — Right eye — */}
      <ellipse cx="55" cy="51" rx="8" ry="9" fill="white" />
      <circle cx="56" cy="52" r="5.5" fill="#1A237E" />
      <circle cx="54.5" cy="50.5" r="2.2" fill="#0a0a0a" />
      <circle cx="52.5" cy="48.5" r="1.5" fill="white" />

      {/* Mouth — small friendly smile */}
      <path d="M 32 68 Q 40 75 48 68" stroke="#2E7D32" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Space suit collar */}
      <ellipse cx="40" cy="76" rx="22" ry="9" fill="#6A3D9B" />
      <ellipse cx="40" cy="76" rx="16" ry="6" fill="#7E57C2" />
      {/* Collar highlight */}
      <ellipse cx="35" cy="73" rx="5" ry="2.5" fill="rgba(255,255,255,0.18)" />

      {/* Suit body bottom */}
      <ellipse cx="40" cy="88" rx="19" ry="10" fill="#5E35B1" />
      <ellipse cx="40" cy="88" rx="13" ry="7" fill="#7E57C2" />
    </svg>
  )
}
