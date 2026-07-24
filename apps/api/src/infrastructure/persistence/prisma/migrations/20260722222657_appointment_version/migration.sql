-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;
