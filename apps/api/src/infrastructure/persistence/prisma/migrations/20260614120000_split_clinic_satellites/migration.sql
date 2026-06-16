-- Clinic'ten finans (ödeme altyapısı) ve devlet (regülasyon) konfigürasyonunu
-- 1:1 satellite modellere ayrıştırır. Mevcut değerler yeni tablolara taşınır,
-- ardından clinics'ten kaldırılır.

-- CreateTable
CREATE TABLE "clinic_payment_gateways" (
    "id" TEXT NOT NULL,
    "iyzico_sub_merchant_key" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_government_specs" (
    "id" TEXT NOT NULL,
    "health_facility_code" TEXT NOT NULL,
    "uss_password" TEXT,
    "company_tax_number" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_government_specs_pkey" PRIMARY KEY ("id")
);

-- DataMigration: mevcut clinics değerlerini satellite tablolara taşı (kolon drop'tan ÖNCE)
INSERT INTO "clinic_payment_gateways" ("id", "iyzico_sub_merchant_key", "clinic_id", "created_at", "updated_at")
SELECT gen_random_uuid(), "iyzico_sub_merchant_key", "id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clinics"
WHERE "iyzico_sub_merchant_key" IS NOT NULL;

INSERT INTO "clinic_government_specs" ("id", "health_facility_code", "clinic_id", "created_at", "updated_at")
SELECT gen_random_uuid(), "health_facility_code", "id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clinics"
WHERE "health_facility_code" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clinic_payment_gateways_iyzico_sub_merchant_key_key" ON "clinic_payment_gateways"("iyzico_sub_merchant_key");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_payment_gateways_clinic_id_key" ON "clinic_payment_gateways"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_government_specs_health_facility_code_key" ON "clinic_government_specs"("health_facility_code");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_government_specs_clinic_id_key" ON "clinic_government_specs"("clinic_id");

-- AlterTable: artık satellite'lerde yaşayan kolonları kaldır
ALTER TABLE "clinics" DROP COLUMN "health_facility_code",
DROP COLUMN "iyzico_sub_merchant_key";

-- AddForeignKey
ALTER TABLE "clinic_payment_gateways" ADD CONSTRAINT "clinic_payment_gateways_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_government_specs" ADD CONSTRAINT "clinic_government_specs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
