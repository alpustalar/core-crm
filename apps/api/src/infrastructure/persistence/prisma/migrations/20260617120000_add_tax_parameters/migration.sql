-- Parametrik vergi oranları (KDV/stopaj/tevkifat/kurumlar) — şube + tarih bazlı.
-- Bkz documents/finans/06-vergi.md §7. Additive (yalnızca yeni tablo + enum).

-- CreateEnum
CREATE TYPE "TaxParameterKey" AS ENUM ('VAT_HEALTH', 'VAT_STANDARD', 'VAT_REDUCED', 'WHT_SELF_EMPLOYMENT', 'WHT_RENT', 'CORP_TAX');

-- CreateTable
CREATE TABLE "tax_parameters" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" "TaxParameterKey" NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_parameters_clinic_id_key_valid_from_idx" ON "tax_parameters"("clinic_id", "key", "valid_from");

-- CreateIndex
CREATE INDEX "tax_parameters_organization_id_idx" ON "tax_parameters"("organization_id");

-- AddForeignKey
ALTER TABLE "tax_parameters" ADD CONSTRAINT "tax_parameters_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
