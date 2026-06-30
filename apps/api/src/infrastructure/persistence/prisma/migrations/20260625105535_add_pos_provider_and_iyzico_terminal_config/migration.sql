-- CreateEnum
CREATE TYPE "PosProvider" AS ENUM ('PAX', 'IYZICO_TERMINAL');

-- AlterTable
ALTER TABLE "pos_devices" ADD COLUMN     "device_unique_id" TEXT,
ADD COLUMN     "provider" "PosProvider" NOT NULL DEFAULT 'PAX',
ALTER COLUMN "terminal_id" DROP NOT NULL,
ALTER COLUMN "merchant_id" DROP NOT NULL,
ALTER COLUMN "host" DROP NOT NULL,
ALTER COLUMN "port" DROP NOT NULL,
ALTER COLUMN "port" DROP DEFAULT;

-- CreateTable
CREATE TABLE "clinic_iyzico_terminal_configs" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_iyzico_terminal_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_iyzico_terminal_configs_clinic_id_key" ON "clinic_iyzico_terminal_configs"("clinic_id");

-- AddForeignKey
ALTER TABLE "clinic_iyzico_terminal_configs" ADD CONSTRAINT "clinic_iyzico_terminal_configs_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
