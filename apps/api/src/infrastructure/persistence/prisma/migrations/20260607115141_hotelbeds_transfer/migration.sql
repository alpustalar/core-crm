-- CreateEnum
CREATE TYPE "HotelbedsTransferBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'MODIFIED');

-- CreateTable
CREATE TABLE "hotelbeds_transfer_bookings" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "client_reference" TEXT,
    "status" "HotelbedsTransferBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "holder_name" TEXT NOT NULL,
    "holder_surname" TEXT NOT NULL,
    "holder_email" TEXT NOT NULL,
    "holder_phone" TEXT NOT NULL,
    "transfers" JSONB NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "remarks" TEXT,
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "patient_id" TEXT,
    "lead_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotelbeds_transfer_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotelbeds_transfer_bookings_reference_key" ON "hotelbeds_transfer_bookings"("reference");

-- CreateIndex
CREATE INDEX "hotelbeds_transfer_bookings_organization_id_idx" ON "hotelbeds_transfer_bookings"("organization_id");

-- CreateIndex
CREATE INDEX "hotelbeds_transfer_bookings_clinic_id_idx" ON "hotelbeds_transfer_bookings"("clinic_id");

-- CreateIndex
CREATE INDEX "hotelbeds_transfer_bookings_patient_id_idx" ON "hotelbeds_transfer_bookings"("patient_id");

-- CreateIndex
CREATE INDEX "hotelbeds_transfer_bookings_lead_id_idx" ON "hotelbeds_transfer_bookings"("lead_id");
