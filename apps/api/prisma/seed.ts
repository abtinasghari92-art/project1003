import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const magazine = await prisma.magazine.upsert({
    where: { slug: 'majara' },
    update: {},
    create: {
      slug: 'majara',
      title: 'ماجرا',
      description: 'فصل‌نامه تاریخی-سیاسی',
      coverUrl: '/brand/logo.png',
      issues: {
        create: {
          title: 'میراث از دست رفته',
          number: 3,
          priceRial: 250_000,
          publishedAt: new Date('2025-01-01'),
        },
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seeded magazine', magazine.slug);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
