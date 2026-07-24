/*
  Warnings:

  - You are about to drop the column `clinicId` on the `clinic_exceptions` table. All the data in the column will be lost.
  - You are about to drop the column `isClosed` on the `clinic_exceptions` table. All the data in the column will be lost.
  - The `status` column on the `purchase_invoices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[clinic_id,date]` on the table `clinic_exceptions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[custom_domain]` on the table `clinic_portal_settings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[metaLeadId]` on the table `leads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[firebaseUid]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,phone]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clinic_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clinic_id` to the `clinic_exceptions` table without a default value. This is not possible if the table is not empty.
  - Made the column `clinic_id` on table `hotelbeds_bookings` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organization_id` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `product_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `subscription_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinic_id` to the `suppliers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('CLINIC_INTERNAL', 'PATIENT_PORTAL', 'WEB_WIDGET', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "AppointmentCreatorType" AS ENUM ('CLINIC_STAFF', 'PATIENT', 'AI_AGENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PayoutTrigger" AS ENUM ('ON_PAYMENT', 'ON_TREATMENT_COMPLETED');

-- CreateEnum
CREATE TYPE "RoundingDirection" AS ENUM ('NONE', 'UP', 'DOWN', 'NEAREST');

-- CreateEnum
CREATE TYPE "LeadMedium" AS ENUM ('ORGANIC', 'AD', 'FORM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REQUESTED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_CANCELLED_LATE', 'APPOINTMENT_RESCHEDULED', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "PurchaseInvoiceStatus" AS ENUM ('DRAFT', 'RECORDED', 'PAID', 'PARTIALLY_PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingTarget" AS ENUM ('ORGANIZATION', 'CLINIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadSource" ADD VALUE 'INSTAGRAM';
ALTER TYPE "LeadSource" ADD VALUE 'MESSENGER';
ALTER TYPE "LeadSource" ADD VALUE 'TELEGRAM';
ALTER TYPE "LeadSource" ADD VALUE 'META_FORM';
ALTER TYPE "LeadSource" ADD VALUE 'GOOGLE_ADS';
ALTER TYPE "LeadSource" ADD VALUE 'WEBSITE';

-- DropForeignKey
ALTER TABLE "clinic_exceptions" DROP CONSTRAINT "clinic_exceptions_clinicId_fkey";

-- DropIndex
DROP INDEX "clinic_exceptions_clinicId_date_key";

-- DropIndex
DROP INDEX "patients_email_clinic_id_idx";

-- DropIndex
DROP INDEX "patients_phone_organization_id_key";

-- DropIndex
DROP INDEX "subscriptions_organization_id_key";

-- AlterTable
ALTER TABLE "admin_requests" ADD COLUMN     "clinic_id" TEXT;

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "created_by_real_name" TEXT,
ADD COLUMN     "creator_type" "AppointmentCreatorType" NOT NULL DEFAULT 'CLINIC_STAFF',
ADD COLUMN     "source" "AppointmentSource" NOT NULL DEFAULT 'CLINIC_INTERNAL';

-- AlterTable
ALTER TABLE "clinic_appointment_settings" ADD COLUMN     "allow_overbooking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allow_patient_booking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "max_active_patient_bookings" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "require_reminder_response" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "send_sms_reminder_hours" INTEGER NOT NULL DEFAULT 24;

-- AlterTable
ALTER TABLE "clinic_exceptions" DROP COLUMN "clinicId",
DROP COLUMN "isClosed",
ADD COLUMN     "clinic_id" TEXT NOT NULL,
ADD COLUMN     "is_closed" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "clinic_finance_settings" ADD COLUMN     "auto_send_debt_reminder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invoice_prefix" TEXT NOT NULL DEFAULT 'KLN',
ADD COLUMN     "is_e_invoice_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_negative_balance_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "provider_payout_trigger" "PayoutTrigger" NOT NULL DEFAULT 'ON_PAYMENT',
ADD COLUMN     "rounding_type" "RoundingDirection" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "clinic_portal_settings" ADD COLUMN     "allow_online_booking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "custom_domain" TEXT,
ADD COLUMN     "show_financials" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "show_medical_records" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_rays_and_images" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "hotelbeds_bookings" ADD COLUMN     "client_reference" TEXT,
ALTER COLUMN "clinic_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "journal_lines" ADD COLUMN     "fx_rate" DECIMAL(18,6),
ADD COLUMN     "original_credit" DECIMAL(14,2),
ADD COLUMN     "original_currency" "Currency",
ADD COLUMN     "original_debit" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "adId" TEXT,
ADD COLUMN     "adsetId" TEXT,
ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "campaignName" TEXT,
ADD COLUMN     "ctwaClid" TEXT,
ADD COLUMN     "medium" "LeadMedium",
ADD COLUMN     "metaLeadId" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "currency" "Currency" NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "firebaseUid" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "product_categories" ADD COLUMN     "clinic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "clinic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchase_invoices" DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseInvoiceStatus" NOT NULL DEFAULT 'RECORDED';

-- AlterTable
ALTER TABLE "subscription_items" ADD COLUMN     "currency" "Currency" NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "billing_target" "BillingTarget" NOT NULL DEFAULT 'ORGANIZATION',
ADD COLUMN     "clinic_id" TEXT;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "clinic_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "staff_notifications" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "params_json" JSONB,
    "deep_link" JSONB,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "delivery_status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_finance_settings" (
    "id" TEXT NOT NULL,
    "subscription_billing_target" "BillingTarget" NOT NULL DEFAULT 'ORGANIZATION',
    "organization_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_finance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "planId" "PlanId" NOT NULL,
    "name" TEXT NOT NULL,
    "monthly_price" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_modules" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,

    CONSTRAINT "plan_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_notifications_staff_id_is_read_created_at_idx" ON "staff_notifications"("staff_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "staff_notifications_clinic_id_idx" ON "staff_notifications"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_finance_settings_organization_id_key" ON "organization_finance_settings"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_planId_key" ON "plans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_modules_plan_id_module_id_key" ON "plan_modules"("plan_id", "module_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_exceptions_clinic_id_date_key" ON "clinic_exceptions"("clinic_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_portal_settings_custom_domain_key" ON "clinic_portal_settings"("custom_domain");

-- CreateIndex
CREATE INDEX "invoices_organization_id_idx" ON "invoices"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_metaLeadId_key" ON "leads"("metaLeadId");

-- CreateIndex
CREATE INDEX "leads_adId_idx" ON "leads"("adId");

-- CreateIndex
CREATE INDEX "leads_campaignId_idx" ON "leads"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_firebaseUid_key" ON "patients"("firebaseUid");

-- CreateIndex
CREATE INDEX "patients_clinic_id_email_idx" ON "patients"("clinic_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_organization_id_phone_key" ON "patients"("organization_id", "phone");

-- CreateIndex
CREATE INDEX "product_categories_clinic_id_idx" ON "product_categories"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_clinic_id_key" ON "subscriptions"("clinic_id");

-- CreateIndex
CREATE INDEX "subscriptions_organization_id_idx" ON "subscriptions"("organization_id");

-- AddForeignKey
ALTER TABLE "clinic_exceptions" ADD CONSTRAINT "clinic_exceptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_notifications" ADD CONSTRAINT "staff_notifications_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_finance_settings" ADD CONSTRAINT "organization_finance_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_modules" ADD CONSTRAINT "plan_modules_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_modules" ADD CONSTRAINT "plan_modules_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
