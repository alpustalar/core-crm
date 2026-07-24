/*
  Warnings:

  - Made the column `patient_id` on table `appointments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'ARRIVED';

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "checked_in_at" TIMESTAMP(3),
ADD COLUMN     "reminder_sent_at" TIMESTAMP(3),
ALTER COLUMN "patient_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
