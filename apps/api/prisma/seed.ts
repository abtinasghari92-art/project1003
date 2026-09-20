import { hash } from 'bcryptjs';
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

  const issue = await prisma.issue.findFirst({
    where: { magazineId: magazine.id },
    orderBy: { number: 'desc' },
  });
  if (issue) {
    const fixtures = [
      { guestName: 'سارا', body: 'طراحی و روایت این شماره خیلی دوست‌داشتنی بود.', stars: 5 },
      { guestName: 'امیر', body: 'بریده‌های شماره کمک کرد تصمیم بگیرم آن را بخرم.', stars: 4 },
    ];
    for (const fixture of fixtures) {
      await prisma.comment.upsert({
        where: { id: `fixture-${issue.id}-${fixture.guestName}` },
        update: {},
        create: {
          id: `fixture-${issue.id}-${fixture.guestName}`,
          issueId: issue.id,
          guestName: fixture.guestName,
          body: fixture.body,
          stars: fixture.stars,
          status: 'APPROVED',
          moderatedAt: new Date(),
        },
      });
    }
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await hash(password, 10);
    await prisma.adminUser.upsert({
      where: { email: email.toLowerCase() },
      update: { passwordHash },
      create: {
        email: email.toLowerCase(),
        passwordHash,
        name: process.env.ADMIN_NAME ?? 'ادمین',
      },
    });
    console.log('Seeded admin', email);
  }

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
