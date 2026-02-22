/*
  Warnings:

  - You are about to drop the column `basePrice` on the `Treatment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Treatment" DROP COLUMN "basePrice",
ADD COLUMN     "masterTreatmentId" TEXT;

-- CreateTable
CREATE TABLE "MasterTreatment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TreatmentCategory" NOT NULL,
    "defaultDuration" INTEGER NOT NULL,

    CONSTRAINT "MasterTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterTreatment_name_key" ON "MasterTreatment"("name");

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_masterTreatmentId_fkey" FOREIGN KEY ("masterTreatmentId") REFERENCES "MasterTreatment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
