/*
  Warnings:

  - You are about to drop the column `is_active` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `patients` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DECEASED', 'BLACKLISTED');

-- AlterTable
ALTER TABLE "clinics" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "is_active",
ADD COLUMN     "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE';
