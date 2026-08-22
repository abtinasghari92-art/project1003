export function MagazineCover({
  title = 'میراث از دست رفته',
  issue = 3,
  season = 'زمستان ۱۴۰۳',
  imageSrc,
}: {
  title?: string;
  issue?: number;
  season?: string;
  imageSrc?: string;
}) {
  if (imageSrc) {
    return (
      <div
        style={{
          position: 'relative',
          aspectRatio: '3 / 4.2',
          overflow: 'hidden',
          background: '#111',
          boxShadow: '0 18px 40px rgba(0,0,0,.28)',
        }}
      >
        <img
          src={imageSrc}
          alt={`${title} — شماره ${issue}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '3 / 4.2',
        overflow: 'hidden',
        background:
          'radial-gradient(120% 80% at 50% 20%, #5a534c 0%, #2c2723 42%, #12100e 100%)',
        color: '#fff',
        boxShadow: '0 18px 40px rgba(0,0,0,.28)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,.15), transparent 30%, rgba(0,0,0,.55) 100%)',
        }}
      />
      <div className="majara-scratch" style={{ position: 'absolute', inset: 0, opacity: 0.22 }} />
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          left: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          fontSize: 10,
          borderBottom: '1px solid rgba(255,255,255,.45)',
          paddingBottom: 6,
        }}
      >
        <span style={{ color: '#e20613', fontFamily: 'var(--font-display)', fontSize: 22 }}>
          ماجرا
        </span>
        <span style={{ opacity: 0.85 }}>تاریخی · سیاسی</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 48,
          bottom: 56,
          width: 18,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 10,
          letterSpacing: 1,
          opacity: 0.8,
        }}
      >
        شماره {issue} · {season}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 14,
          left: 32,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: '#e20613',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {issue}
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            lineHeight: 1.05,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  );
}
