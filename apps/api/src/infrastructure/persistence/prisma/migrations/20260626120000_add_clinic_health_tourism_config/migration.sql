-- CreateTable
CREATE TABLE "clinic_health_tourism_configs" (
    "id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "destination_code" TEXT,
    "nearby_hotel_codes" TEXT[],
    "airport_iata" TEXT,
    "clinic_location_type" TEXT,
    "clinic_location_code" TEXT,
    "pickup_address" TEXT,
    "service_fee_percent" DECIMAL(5,2),
    "default_currency" "Currency" NOT NULL DEFAULT 'EUR',
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_health_tourism_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_health_tourism_configs_clinic_id_key" ON "clinic_health_tourism_configs"("clinic_id");

-- CreateIndex
CREATE INDEX "clinic_health_tourism_configs_organization_id_idx" ON "clinic_health_tourism_configs"("organization_id");

-- AddForeignKey
ALTER TABLE "clinic_health_tourism_configs" ADD CONSTRAINT "clinic_health_tourism_configs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
