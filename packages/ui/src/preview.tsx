'use client';

export function PreviewScreen() {
  return (
    <article className="bg-white px-1 pb-8">
      <header className="mb-5 border-b border-black/10 pb-4">
        <p
          className="mb-1 text-3xl text-[var(--majara-red)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ماجرا
        </p>
        <p className="text-[11px] text-[var(--majara-muted)]">شماره سوم · زمستان ۱۴۰۳ · صفحه ۱۴</p>
      </header>
      <p className="mb-1 text-2xl font-black leading-tight">میراثی که جنگ</p>
      <p
        className="mb-4 text-3xl leading-tight text-[var(--majara-red)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        از دست رفت
      </p>
      <div className="mb-5 bg-black px-3 py-2 text-center text-[11px] text-white">
        گفت‌وگو با احسان رجبی، عکاس جنگ
      </div>
      <p className="mb-3 text-[13px] leading-7">
        <span className="ml-1 inline-block text-[10px] text-[var(--majara-red)]">▶</span>
        <span className="font-bold text-[var(--majara-red)]">
          از بوسنی چه چیزی برای روایت باقی مانده است؟
        </span>
      </p>
      <p className="text-[13px] leading-7 text-[#1b1b1b]">
        تا انتهای ماجرا راهیست طولانی. این شماره روی حافظه تصویری جنگ، خط مقدم بدون خط مقدم، و
        میراثی ایستاده که سیاست آن را پنهان کرد. پیش‌نمایش کامل صفحات بعد از خرید فعال می‌شود.
      </p>
    </article>
  );
}
