const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { text: 'text-lg', dot: 'w-2 h-2' },
    md: { text: 'text-2xl', dot: 'w-3 h-3' },
    lg: { text: 'text-4xl', dot: 'w-4 h-4' },
  };

  return (
    <div className="flex items-center gap-2">
      {/* Icon mark */}
      <div className="relative flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          {/* Hexagon shape */}
          <path
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
          />
          {/* Lightning bolt inside */}
          <path
            d="M18 6L12 17H16L14 26L20 15H16L18 6Z"
            fill="#C9A84C"
          />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.08em',
            color: '#EDF2F7',
            fontSize: size === 'lg' ? '28px' : size === 'sm' ? '16px' : '22px',
          }}
        >
          EVENT
          <span style={{ color: '#C9A84C' }}>BOOST</span>
        </span>
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.25em',
            color: '#5A7A94',
            fontSize: size === 'lg' ? '11px' : '9px',
          }}
        >
          PRO
        </span>
      </div>
    </div>
  );
};

export default Logo;
