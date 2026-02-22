/*
  Warnings:

  - The `title` column on the `doctors` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DoctorTitle" AS ENUM ('DT', 'UZM_DT', 'DR_DT', 'ASST_PROF_DR', 'ASSOC_PROF_DR', 'PROF_DR', 'ORD_PROF_DR', 'RES_ASST_DR', 'CLINIC_CHIEF', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('XRAY', 'PRESCRIPTION', 'PHOTO', 'CONSENT_FORM', 'LAB_RESULT', 'OTHER');

-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "title",
ADD COLUMN     "title" "DoctorTitle";

-- CreateTable
CREATE TABLE "medical_files" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "treatmentId" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" "FileType" NOT NULL,

    CONSTRAINT "medical_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_files_patient_id_idx" ON "medical_files"("patient_id");

-- CreateIndex
CREATE INDEX "medical_files_doctor_id_idx" ON "medical_files"("doctor_id");

-- CreateIndex
CREATE INDEX "medical_files_clinic_id_idx" ON "medical_files"("clinic_id");

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_files" ADD CONSTRAINT "medical_files_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
