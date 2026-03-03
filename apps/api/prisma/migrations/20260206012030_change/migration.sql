/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `doctorId` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "patients_phone_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "doctor_availabilities" ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "doctor_treatments" ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "doctorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "patients_phone_clinic_id_idx" ON "patients"("phone", "clinic_id");

-- CreateIndex
CREATE INDEX "patients_clinic_id_idx" ON "patients"("clinic_id");

-- CreateIndex
CREATE INDEX "patients_doctorId_idx" ON "patients"("doctorId");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
