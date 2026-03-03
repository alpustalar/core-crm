-- AlterTable
ALTER TABLE "Treatment" ALTER COLUMN "basePrice" DROP NOT NULL,
ALTER COLUMN "basePrice" SET DEFAULT 0;
