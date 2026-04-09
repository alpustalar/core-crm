/*
  Warnings:

  - Added the required column `global_stataus` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "global_stataus" "GlobalStatus" NOT NULL;
