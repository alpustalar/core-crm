-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TRY', 'USD', 'EUR', 'GBP');

-- CreateTable
CREATE TABLE "clinic_portal_settings" (
    "id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL DEFAULT '#00bcd4',
    "custom_title" TEXT,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_portal_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_appointment_settings" (
    "id" TEXT NOT NULL,
    "reschedule_limit_hours" INTEGER NOT NULL DEFAULT 6,
    "cancel_limit_hours" INTEGER NOT NULL DEFAULT 24,
    "allow_patient_cancel" BOOLEAN NOT NULL DEFAULT true,
    "require_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "max_future_booking_days" INTEGER NOT NULL DEFAULT 90,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_appointment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_finance_settings" (
    "id" TEXT NOT NULL,
    "default_currency" TEXT NOT NULL DEFAULT 'TRY',
    "auto_invoice_on_payment" BOOLEAN NOT NULL DEFAULT true,
    "default_vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "use_cost_tracking" BOOLEAN NOT NULL DEFAULT true,
    "allow_negative_balance" BOOLEAN NOT NULL DEFAULT false,
    "max_installment_count" INTEGER NOT NULL DEFAULT 12,
    "fiscal_year_start_month" INTEGER NOT NULL DEFAULT 1,
    "clinic_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_finance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_portal_settings_api_key_key" ON "clinic_portal_settings"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_portal_settings_clinic_id_key" ON "clinic_portal_settings"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_appointment_settings_clinic_id_key" ON "clinic_appointment_settings"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_finance_settings_clinic_id_key" ON "clinic_finance_settings"("clinic_id");

-- AddForeignKey
ALTER TABLE "clinic_portal_settings" ADD CONSTRAINT "clinic_portal_settings_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_appointment_settings" ADD CONSTRAINT "clinic_appointment_settings_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_finance_settings" ADD CONSTRAINT "clinic_finance_settings_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
