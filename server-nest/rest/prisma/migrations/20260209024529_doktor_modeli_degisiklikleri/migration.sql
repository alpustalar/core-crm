/*
  Warnings:

  - You are about to drop the column `email` on the `doctors` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "email",
DROP COLUMN "phone",
ADD COLUMN     "public_email" TEXT,
ADD COLUMN     "public_phone" TEXT;
