-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('POST', 'COURIER_TEHRAN');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'POST';

-- CreateTable
CREATE TABLE "DeliverySettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "postShippingRial" INTEGER NOT NULL DEFAULT 70000,
    "courierTehranEnabled" BOOLEAN NOT NULL DEFAULT false,
    "courierTehranRial" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySettings_pkey" PRIMARY KEY ("id")
);
