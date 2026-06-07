-- CreateEnum
CREATE TYPE "HotelbedsBookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'PENDING');

-- CreateTable
CREATE TABLE "hotelbeds_hotels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_code" TEXT NOT NULL,
    "category_name" TEXT,
    "destination_code" TEXT NOT NULL,
    "destination_name" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "images" JSONB,
    "phones" JSONB,
    "last_synced_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotelbeds_hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotelbeds_bookings" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "hotel_code" TEXT NOT NULL,
    "patient_id" TEXT,
    "lead_id" TEXT,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "status" "HotelbedsBookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "total_net" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "holder_name" TEXT NOT NULL,
    "holder_surname" TEXT NOT NULL,
    "rooms" JSONB NOT NULL,
    "remarks" TEXT,
    "service_fee" DECIMAL(10,2),
    "organization_id" TEXT NOT NULL,
    "clinic_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotelbeds_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hotelbeds_hotels_destination_code_idx" ON "hotelbeds_hotels"("destination_code");

-- CreateIndex
CREATE UNIQUE INDEX "hotelbeds_bookings_reference_key" ON "hotelbeds_bookings"("reference");

-- CreateIndex
CREATE INDEX "hotelbeds_bookings_organization_id_idx" ON "hotelbeds_bookings"("organization_id");

-- CreateIndex
CREATE INDEX "hotelbeds_bookings_patient_id_idx" ON "hotelbeds_bookings"("patient_id");

-- CreateIndex
CREATE INDEX "hotelbeds_bookings_lead_id_idx" ON "hotelbeds_bookings"("lead_id");

-- AddForeignKey
ALTER TABLE "hotelbeds_bookings" ADD CONSTRAINT "hotelbeds_bookings_hotel_code_fkey" FOREIGN KEY ("hotel_code") REFERENCES "hotelbeds_hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
