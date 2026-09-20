import type { CSSProperties, ImgHTMLAttributes } from 'react';

export type BrandIconName = 'call' | 'iran' | 'play';

const SRC: Record<BrandIconName, string> = {
  call: '/brand/icon-call.png',
  iran: '/brand/icon-iran.png',
  play: '/brand/icon-play.png',
};

export function BrandIcon({
  name,
  size = 26,
  className,
  alt = '',
  ...props
}: {
  name: BrandIconName;
  size?: number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'>) {
  const style: CSSProperties = {
    width: size,
    height: size,
    objectFit: 'contain',
    flexShrink: 0,
    display: 'block',
    ...((props.style ?? {}) as CSSProperties),
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={className}
      src={SRC[name]}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      loading="eager"
      decoding="sync"
      style={style}
      aria-hidden={alt ? undefined : true}
    />
  );
}

/** High-contrast tile so gold/red marks stay readable on kraft. */
export function BrandIconTile({
  name,
  size = 26,
  className,
}: {
  name: BrandIconName;
  size?: number;
  className?: string;
}) {
  const dark = name === 'iran';
  return (
    <span
      className={className}
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size + 8,
        height: size + 8,
        flexShrink: 0,
        background: dark ? 'var(--majara-charcoal)' : 'color-mix(in srgb, var(--majara-white) 88%, transparent)',
      }}
    >
      <BrandIcon name={name} size={size} />
    </span>
  );
}
