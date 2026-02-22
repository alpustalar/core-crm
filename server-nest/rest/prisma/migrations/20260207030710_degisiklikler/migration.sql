/*
  Warnings:

  - The values [PATIENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `organizationId` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `patients` table. All the data in the column will be lost.
  - Made the column `clinic_id` on table `appointments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `doctor_id` on table `appointments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `patients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ExternalSystem" AS ENUM ('WHATSAPP', 'N8N', 'GOOGLE_CALENDAR');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'ORGANIZATION_OWNER', 'BRANCH_MANAGER', 'CLINIC_OWNER', 'DOCTOR', 'RECEPTION', 'STAFF');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STAFF';
COMMIT;

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "clinics" DROP CONSTRAINT "clinics_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_doctorId_fkey";

-- DropIndex
DROP INDEX "master_treatments_category_idx";

-- DropIndex
DROP INDEX "patients_doctorId_idx";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "external_system" "ExternalSystem",
ALTER COLUMN "clinic_id" SET NOT NULL,
ALTER COLUMN "doctor_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "clinics" DROP COLUMN "organizationId",
ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "doctorId",
ALTER COLUMN "gender" SET NOT NULL;

-- AlterTable
ALTER TABLE "treatments" ALTER COLUMN "duration" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_organization_owners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_organization_owners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_clinic_managers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_clinic_managers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_organization_owners_B_index" ON "_organization_owners"("B");

-- CreateIndex
CREATE INDEX "_clinic_managers_B_index" ON "_clinic_managers"("B");

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organization_owners" ADD CONSTRAINT "_organization_owners_A_fkey" FOREIGN KEY ("A") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_organization_owners" ADD CONSTRAINT "_organization_owners_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clinic_managers" ADD CONSTRAINT "_clinic_managers_A_fkey" FOREIGN KEY ("A") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clinic_managers" ADD CONSTRAINT "_clinic_managers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
