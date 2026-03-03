/*
  Warnings:

  - You are about to drop the column `fullName` on the `Doctor` table. All the data in the column will be lost.
  - Made the column `displayName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clinicId" TEXT,
ALTER COLUMN "displayName" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
