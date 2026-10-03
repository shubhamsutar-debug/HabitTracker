interface LogoProps {
  size?: number
  showText?: boolean
  textColor?: string
  animate?: boolean
  variant?: 'default' | 'compact' | 'splash'
}

export function Logo({ size = 40, showText = false, textColor = '#FFFFFF', animate = false, variant = 'default' }: LogoProps) {
  const isSplash = variant === 'splash'
  const bgSize = isSplash ? size : size
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showText ? 10 : 0 }}>
      {/* Animated icon mark */}
      <div style={{
        width: bgSize,
        height: bgSize,
        borderRadius: bgSize * 0.28,
        background: 'linear-gradient(135deg, #1a5c3e 0%, #2E7D5B 45%, #4CAF78 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: isSplash
          ? `0 ${bgSize * 0.25}px ${bgSize * 0.6}px rgba(46,125,91,0.45), 0 0 0 ${bgSize * 0.05}px rgba(76,175,120,0.2)`
          : `0 4px 16px rgba(46,125,91,0.35)`,
        flexShrink: 0,
        animation: animate ? 'logoBreathe 4s ease-in-out infinite' : undefined,
        overflow: 'hidden',
      }}>
        {/* Shimmer effect overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }} />

        {/* Orbiting ring */}
        <svg
          width={bgSize}
          height={bgSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            inset: 0,
            animation: animate ? 'logoRingPulse 3s ease-in-out infinite' : undefined,
          }}
          aria-hidden="true"
        >
          {/* Outer ring arc */}
          <circle
            cx="24" cy="24" r="18"
            stroke="rgba(76,175,120,0.4)"
            strokeWidth="1.5"
            strokeDasharray="72 40"
            strokeLinecap="round"
          />
          {/* Inner circle */}
          <circle
            cx="24" cy="24" r="12"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="48 28"
            strokeLinecap="round"
          />
        </svg>

        {/* Checkmark + streak dot */}
        <svg
          width={bgSize * 0.58}
          height={bgSize * 0.58}
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 1 }}
          aria-hidden="true"
        >
          {/* Check path */}
          <path
            d="M5 14.5L11 20.5L23 8.5"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Gold accent dot */}
        <div style={{
          position: 'absolute',
          top: bgSize * 0.1,
          right: bgSize * 0.12,
          width: bgSize * 0.18,
          height: bgSize * 0.18,
          borderRadius: '50%',
          background: '#F59E0B',
          boxShadow: '0 0 6px rgba(245,158,11,0.8)',
          animation: animate ? 'dotPulse 2s ease-in-out infinite' : undefined,
        }} />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: size * 0.5,
            fontWeight: 800,
            color: textColor,
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            Habit<span style={{ color: '#4CAF78' }}>Track</span>
          </span>
          {isSplash && (
            <span style={{
              fontSize: size * 0.2,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              Build Better Days
            </span>
          )}
        </div>
      )}

      <style>{`
        @keyframes logoBreathe {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(46,125,91,0.35); }
          50% { transform: scale(1.04); box-shadow: 0 8px 28px rgba(46,125,91,0.5); }
        }
        @keyframes logoRingPulse {
          0%, 100% { opacity: 1; transform: rotate(0deg); }
          50% { opacity: 0.6; transform: rotate(180deg); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
