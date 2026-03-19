export default function AlienMascot({ size = 90 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="三眼仔"
    >
      {/* Antenna stem */}
      <line x1="40" y1="24" x2="40" y2="8" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Antenna ball */}
      <circle cx="40" cy="6" r="5.5" fill="#FFD700" />
      <circle cx="38" cy="4" r="1.8" fill="rgba(255,255,255,0.6)" />

      {/* Ears — drawn before head so they sit behind */}
      <ellipse cx="11" cy="48" rx="6.5" ry="8" fill="#4CA84C" />
      <ellipse cx="69" cy="48" rx="6.5" ry="8" fill="#4CA84C" />
      {/* Ear inner detail */}
      <ellipse cx="11" cy="48" rx="3.5" ry="5" fill="#3D953D" />
      <ellipse cx="69" cy="48" rx="3.5" ry="5" fill="#3D953D" />

      {/* Head */}
      <ellipse cx="40" cy="48" rx="27" ry="28" fill="#5DB85D" />
      {/* Head highlight */}
      <ellipse cx="32" cy="38" rx="10" ry="11" fill="rgba(255,255,255,0.14)" />

      {/* — Left eye — */}
      <ellipse cx="25" cy="46" rx="8" ry="9" fill="white" />
      <circle cx="26" cy="47" r="5.5" fill="#1A237E" />
      <circle cx="24.5" cy="45.5" r="2.2" fill="#0a0a0a" />
      <circle cx="22.5" cy="43.5" r="1.5" fill="white" />

      {/* — Center eye (slightly larger & higher) — */}
      <ellipse cx="40" cy="44" rx="9" ry="10" fill="white" />
      <circle cx="41" cy="45" r="6.5" fill="#1A237E" />
      <circle cx="39.5" cy="43.5" r="2.6" fill="#0a0a0a" />
      <circle cx="37" cy="41.5" r="1.8" fill="white" />

      {/* — Right eye — */}
      <ellipse cx="55" cy="46" rx="8" ry="9" fill="white" />
      <circle cx="56" cy="47" r="5.5" fill="#1A237E" />
      <circle cx="54.5" cy="45.5" r="2.2" fill="#0a0a0a" />
      <circle cx="52.5" cy="43.5" r="1.5" fill="white" />

      {/* Mouth — small friendly smile */}
      <path d="M 32 62 Q 40 69 48 62" stroke="#2E7D32" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
