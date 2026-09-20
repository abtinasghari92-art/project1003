import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true as const,
    ...props,
  };
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.2 2.8 11h2.4v9.2h5.2v-6h3.2v6h5.2V11h2.4L12 3.2Z" />
    </svg>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4h3.2v16H4V4Zm5.2 0H20v16H9.2V4Zm2.4 2.4v11.2h6.8V6.4h-6.8Z" />
    </svg>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.2 4h2.1l.4 1.6h14.1l-1.6 8.2H7.2L6.5 17.6h12.3v2H5.2l1.2-5.2L4.6 5.6H3.2V4Zm4.4 16.4a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Zm9.2 0a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 12.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4ZM4.4 20.4c.6-3.6 3.7-6 7.6-6s7 2.4 7.6 6H4.4Z" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.8 6.4 12 3.2 9.2 6.4h2v6.4h1.6V6.4h2ZM5.2 10h3.2v1.8H6.8v7.4h10.4v-7.4h-1.6V10h3.2v11H5.2V10Z" />
    </svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M11.1 7.2H4.8v3.2h6.3V7.2Zm8.1 0h-6.3v3.2h6.3V7.2ZM4.8 12v8.8h6.3V12H4.8Zm8.1 0v8.8h6.3V12h-6.3ZM8.4 3.2c-1.2 0-2 .8-2 1.8 0 1.3 1.4 2.2 3.2 2.2h1.5C10.4 5.6 9.6 3.2 8.4 3.2Zm7.2 0c-1.2 0-2 2.4-2.7 4h1.5c1.8 0 3.2-.9 3.2-2.2 0-1-.8-1.8-2-1.8Z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10.2 3.6a6.6 6.6 0 1 0 4.1 11.7l4.3 4.3 1.4-1.4-4.3-4.3A6.6 6.6 0 0 0 10.2 3.6Zm0 1.8a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Z" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 5.6v12.8L18.4 12 8 5.6Z" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.4 5.2 12 10.8 17.6 5.2 18.8 6.4 13.2 12l5.6 5.6-1.2 1.2L12 13.2 6.4 18.8 5.2 17.6 10.8 12 5.2 6.4 6.4 5.2Z" />
    </svg>
  );
}
