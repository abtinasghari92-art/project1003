export type CatalogCategory = 'historical' | 'political';
export type CatalogBadge = 'جدید' | 'ویژه';

export interface CatalogIssue {
  id: string;
  number: number;
  title: string;
  season: string;
  coverSrc?: string;
  priceRial: number;
  originalPriceRial?: number;
  summary: string;
  description?: string;
  meta: string;
  category?: CatalogCategory;
  badge?: CatalogBadge;
  pageCount?: number;
  bestseller?: boolean;
}

export interface CatalogPiece {
  id: string;
  title: string;
  summary: string;
  imageSrc?: string;
}

export interface CatalogExcerpt {
  quote: string;
  source: string;
  author?: string;
}

export interface CatalogComment {
  id?: string;
  name: string;
  body: string;
  stars: number;
  date?: string;
  recommended?: boolean;
  usefulCount?: number;
  helpfulDown?: number;
  adminReply?: string | null;
}

export const CATEGORY_LABEL: Record<CatalogCategory, string> = {
  historical: 'تاریخی',
  political: 'سیاسی',
};

export const CATALOG_ISSUES: CatalogIssue[] = [
  {
    id: '3',
    number: 3,
    title: 'میراث از دست رفته',
    season: 'زمستان ۱۴۰۳',
    coverSrc: '/issues/3/cover-card.png',
    priceRial: 250_000,
    summary: 'فصل‌نامه تاریخی-سیاسی؛ روایتی از جنگ بوسنی تا انتهای ماجرا راهیست طولانی.',
    description: 'شماره سوم ماجرا روایتی است از روزهایی که جنگ بوسنی تنها در میدان نبرد جریان نداشت؛ دوربین‌ها، اتاق‌های خبر و مسیرهای امداد نیز بخشی از ماجرا بودند. در این شماره سراغ عکاسان ایرانی، روایت‌های کمتر شنیده‌شده و تأثیر آن تجربه بر نگاه امروز ایران به بالکان رفته‌ایم؛ مجموعه‌ای از گفت‌وگوها، گزارش‌ها و اسنادی که یک تصویر کامل‌تر از آن روزها می‌سازند.',
    meta: 'شماره سوم | زمستان ۱۴۰۳ | ۲۰۰ صفحه',
    category: 'historical',
    badge: 'جدید',
    pageCount: 200,
  },
  {
    id: '2',
    number: 2,
    title: 'عهدهای ناتمام اروپا',
    season: 'تابستان ۱۴۰۳',
    coverSrc: '/issues/2/cover-card.png',
    priceRial: 250_000,
    summary: 'روایت عملیات‌ها و شبکه ایران در اروپا.',
    description: 'شماره دوم ماجرا به مسیرهای پنهان و آشکار حضور ایران در اروپا می‌پردازد؛ از عملیات‌ها و شبکه‌های انسانی تا تصمیم‌هایی که ردشان را در تاریخ سیاسی منطقه می‌توان دید. این شماره با تکیه بر روایت‌های مستند، چند پرونده را کنار هم می‌گذارد تا تصویری روشن‌تر از عهدهایی که ناتمام ماندند ارائه کند.',
    meta: 'شماره دوم | تابستان ۱۴۰۳',
    category: 'political',
    badge: 'ویژه',
    pageCount: 180,
    bestseller: true,
  },
  {
    id: '1',
    number: 1,
    title: 'پیروزی بدون جنگ',
    season: 'بهار ۱۴۰۳',
    coverSrc: '/issues/1/cover-card.png',
    priceRial: 220_000,
    summary: 'شماره نخست فصل‌نامه ماجرا.',
    description: 'شماره نخست ماجرا از روایت‌هایی آغاز می‌شود که پیروزی را فقط در میدان جنگ جست‌وجو نمی‌کنند. گزارش‌ها و گفت‌وگوهای این شماره سراغ تجربه‌هایی می‌روند که تصمیم، رسانه و ایستادگی مردم در آن‌ها نقشی تعیین‌کننده داشته است؛ روایتی برای خواندن دوبارهٔ تاریخ معاصر از زاویه‌ای متفاوت.',
    meta: 'شماره اول | بهار ۱۴۰۳',
    category: 'historical',
    pageCount: 160,
    bestseller: true,
  },
];

export const CATALOG_PIECES: CatalogPiece[] = [
  {
    id: '1',
    title: 'عزت بگوویچ گفت همه درها را به روی ما بسته‌اند',
    summary: 'گفت‌وگو با احسان رجبی، عکاس و مستندساز جنگ.',
    imageSrc: '/issues/3/page-14.jpg',
  },
  {
    id: '2',
    title: 'لنزهای جنگی',
    summary: 'فصل اول · رسانه؛ حضور عکاسان ایرانی در جنگ بوسنی.',
    imageSrc: '/issues/3/page-07.png',
  },
  {
    id: '3',
    title: 'میراث از دست رفته',
    summary: 'چرا ایران نمی‌تواند از نقش خود در نجات بوسنی بهره‌برداری کند؟',
    imageSrc: '/issues/3/cover-card.png',
  },
];

export const ISSUE_EXCERPTS: CatalogExcerpt[] = [
  {
    quote: 'فصل اول · رسانه · لنزهای جنگی. حضور عکاسان ایرانی در جنگ بوسنی فقط ثبت تصویر نبود؛ بخشی از روایت ماجرا بود.',
    source: 'صفحه ۷',
    author: 'احسان رجبی',
  },
  {
    quote: 'گفت‌وگو با احسان رجبی، عکاس و مستندساز جنگ؛ عزت بگوویچ گفت همه درها را به روی ما بسته‌اند.',
    source: 'صفحه ۱۴',
    author: 'هیئت تحریریه',
  },
];

export const ISSUE_COMMENTS: CatalogComment[] = [
  {
    name: 'خواننده شماره سوم',
    body: 'روایت عکاسان ایرانی در بوسنی را تا آخر خواندم. حس یک نشریه چاپی را دارد و از بقیه فروشگاه‌های کتاب دیجیتال متمایز است.',
    stars: 5,
    date: '۱۴۰۳/۱۰/۱۲',
    recommended: true,
    usefulCount: 13,
  },
  {
    name: 'آرشیو‌خوان',
    body: 'جلد و صفحه‌آرایی ماجرا را از بقیه فروشگاه‌های کتاب دیجیتال متمایز می‌کند.',
    stars: 4,
    date: '۱۴۰۳/۰۹/۲۸',
    recommended: true,
    usefulCount: 4,
  },
];

export const LATEST_ISSUE = CATALOG_ISSUES[0];
export const OPEN_ISSUE_EVENT = 'majara:open-issue';

export function requestIssueOpen(id: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(OPEN_ISSUE_EVENT, { detail: id }));
}

export function findCatalogIssue(id: string): CatalogIssue | undefined {
  return (
    CATALOG_ISSUES.find((issue) => issue.id === id) ??
    CATALOG_ISSUES.find((issue) => String(issue.number) === id)
  );
}

export function mergeCatalogWithApi(
  apiIssues: Array<{
    id: string;
    number: number;
    title: string;
    priceRial: number;
    originalPriceRial?: number | null;
    coverUrl?: string | null;
  }>,
): CatalogIssue[] {
  const byNumber = new Map(apiIssues.map((issue) => [issue.number, issue]));
  const merged = CATALOG_ISSUES.map((fixture) => {
    const live = byNumber.get(fixture.number);
    if (!live) return fixture;
    return {
      ...fixture,
      id: live.id,
      title: live.title,
      coverSrc: live.coverUrl || fixture.coverSrc,
      priceRial: live.priceRial,
      originalPriceRial: live.originalPriceRial ?? undefined,
    };
  });
  const extras = apiIssues
    .filter((issue) => !CATALOG_ISSUES.some((fixture) => fixture.number === issue.number))
    .map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      season: '',
      coverSrc: issue.coverUrl ?? undefined,
      priceRial: issue.priceRial,
      summary: issue.title,
      meta: `شماره ${issue.number}`,
      category: 'historical' as const,
    }));
  return [...merged, ...extras];
}

export function formatFa(amount: number) {
  return new Intl.NumberFormat('fa-IR-u-nu-latn').format(amount);
}

export function formatToman(amount: number) {
  return `${formatFa(amount)} تومان`;
}

export function issuePath(id: string) {
  return `/issues/${id}`;
}
