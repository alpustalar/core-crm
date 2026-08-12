/*
  Warnings:

  - You are about to drop the column `discount_rate` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clinic_finance_settings" ADD COLUMN     "max_discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "discount_rate";

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY',
ADD COLUMN     "list_price" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "treatment_charges" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "list_price" DECIMAL(10,2) NOT NULL,
    "discount_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_reason" TEXT,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "vat_rate" INTEGER NOT NULL,
    "vat_amount" DECIMAL(12,2) NOT NULL,
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "discount_approved_by_id" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "voided_at" TIMESTAMP(3),
    "void_reason" TEXT,

    CONSTRAINT "treatment_charges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "treatment_charges_clinic_id_idx" ON "treatment_charges"("clinic_id");

-- CreateIndex
CREATE INDEX "treatment_charges_appointment_id_idx" ON "treatment_charges"("appointment_id");

-- CreateIndex
CREATE INDEX "treatment_charges_patient_id_idx" ON "treatment_charges"("patient_id");

-- CreateIndex
CREATE INDEX "treatment_charges_treatment_id_idx" ON "treatment_charges"("treatment_id");

-- AddForeignKey
ALTER TABLE "treatment_charges" ADD CONSTRAINT "treatment_charges_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatment_charges" ADD CONSTRAINT "treatment_charges_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
