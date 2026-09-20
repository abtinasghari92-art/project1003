CREATE TABLE "PromotionCampaign" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "active" BOOLEAN NOT NULL DEFAULT false,
  "code" TEXT NOT NULL DEFAULT '',
  "discountPercent" INTEGER NOT NULL DEFAULT 0,
  "title" TEXT NOT NULL DEFAULT 'هدیه برای شما',
  "description" TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromotionCampaign_pkey" PRIMARY KEY ("id")
);
