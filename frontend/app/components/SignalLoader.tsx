'use client'

export function SignalLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Signal bars with staggered animation */}
      <div className="absolute inset-0 flex items-end justify-center gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className="bg-primary-container rounded-t-sm"
            style={{
              width: '18%',
              height: `${bar * 25}%`,
              animation: `signalPulse 1.2s ease-in-out ${bar * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        @keyframes signalPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scaleY(0.8);
          }
          50% {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  )
}

export function WifiLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* WiFi waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((wave) => (
          <div
            key={wave}
            className="absolute border-2 border-primary-container rounded-full"
            style={{
              width: `${wave * 33}%`,
              height: `${wave * 33}%`,
              animation: `wifiPulse 1.5s ease-out ${wave * 0.2}s infinite`,
            }}
          />
        ))}
        {/* Center dot */}
        <div className="w-2 h-2 bg-primary-container rounded-full" />
      </div>
      
      <style jsx>{`
        @keyframes wifiPulse {
          0% {
            opacity: 1;
            transform: scale(0.5);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <SignalLoader size="lg" />
        <p className="mt-4 text-sm text-on-surface-variant">{message}</p>
      </div>
    </div>
  )
}

export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <SignalLoader size="sm" />
      {message && <span className="text-sm text-on-surface-variant">{message}</span>}
    </div>
  )
}
