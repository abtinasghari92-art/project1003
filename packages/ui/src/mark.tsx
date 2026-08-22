export function DistressedMark({
  text = 'ماجرا',
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          lineHeight: 0.8,
          color: '#e20613',
          letterSpacing: '-0.04em',
          display: 'block',
          fontSize: '1em',
        }}
      >
        {text}
      </span>
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
    </span>
  );
}
