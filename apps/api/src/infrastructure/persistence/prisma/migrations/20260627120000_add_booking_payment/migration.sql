-- CreateEnum
CREATE TYPE "BookingPaymentType" AS ENUM ('HOTEL', 'TRANSFER');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'PAID', 'BOOKED', 'EXPIRED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "BookingPaymentProvider" AS ENUM ('IYZICO', 'STRIPE');

-- CreateTable
CREATE TABLE "booking_payments" (
    "id" TEXT NOT NULL,
    "booking_type" "BookingPaymentType" NOT NULL,
    "status" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "sale_currency" "Currency" NOT NULL,
    "sale_amount" DECIMAL(12,2) NOT NULL,
    "try_amount" DECIMAL(12,2) NOT NULL,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "fx_rate" DECIMAL(12,6),
    "intent" JSONB NOT NULL,
    "iyzico_conversation_id" TEXT,
    "iyzico_token" TEXT,
    "iyzico_url" TEXT,
    "stripe_session_id" TEXT,
    "stripe_url" TEXT,
    "paid_provider" "BookingPaymentProvider",
    "paid_provider_ref" TEXT,
    "paid_at" TIMESTAMP(3),
    "booking_reference" TEXT,
    "booking_id" TEXT,
    "failure_reason" TEXT,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "lead_id" TEXT,
    "conversation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_iyzico_conversation_id_key" ON "booking_payments"("iyzico_conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_stripe_session_id_key" ON "booking_payments"("stripe_session_id");

-- CreateIndex
CREATE INDEX "booking_payments_clinic_id_idx" ON "booking_payments"("clinic_id");

-- CreateIndex
CREATE INDEX "booking_payments_patient_id_idx" ON "booking_payments"("patient_id");

-- CreateIndex
CREATE INDEX "booking_payments_lead_id_idx" ON "booking_payments"("lead_id");
