/*
  Warnings:

  - You are about to drop the column `canAcceptExamination` on the `providers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clinic_whatsapp_channels" ADD COLUMN     "messaging_tier" TEXT,
ADD COLUMN     "quality_rating" TEXT;

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "marketing_opt_out" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "opt_out_at" TIMESTAMP(3),
ADD COLUMN     "window_expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "billable" BOOLEAN,
ADD COLUMN     "media_type" TEXT,
ADD COLUMN     "pricing_category" TEXT;

-- AlterTable
ALTER TABLE "providers" DROP COLUMN "canAcceptExamination",
ADD COLUMN     "acceptsConsultation" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "treatment_packages" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';
