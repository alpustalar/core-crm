-- CreateEnum
CREATE TYPE "ClinicLegalType" AS ENUM ('SERBEST_MESLEK', 'KURUM');

-- AlterTable
ALTER TABLE "clinic_government_specs" ADD COLUMN "legal_type" "ClinicLegalType" NOT NULL DEFAULT 'KURUM';
