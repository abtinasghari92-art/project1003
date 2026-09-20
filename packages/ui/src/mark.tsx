import type { CSSProperties } from 'react';

export function DistressedMark({
  text = 'ماجرا',
  className,
  distressed = true,
}: {
  text?: string;
  className?: string;
  distressed?: boolean;
}) {
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          fontFamily: 'var(--font-mark)',
          fontWeight: 700,
          lineHeight: 0.8,
          color: 'currentColor',
          letterSpacing: '-0.04em',
          display: 'block',
          fontSize: '1em',
        }}
      >
        {text}
      </span>
      {distressed ? (
        <span
          aria-hidden
          className="majara-scratch"
          style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </span>
  );
}

export type LogoMarkVariant = 'red' | 'kraft' | 'charcoal';

export function LogoMark({
  size = 40,
  className,
  src = '/brand/logo.png?v=wordmark',
}: {
  variant?: LogoMarkVariant;
  size?: number;
  className?: string;
  src?: string;
}) {
  const style: CSSProperties = {
    display: 'block',
    height: size,
    width: 'auto',
    maxWidth: size * 2.4,
    objectFit: 'contain',
    objectPosition: 'right center',
    borderRadius: 0,
    flexShrink: 0,
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt="ماجرا"
      width={size}
      height={size}
      style={style}
    />
  );
}
