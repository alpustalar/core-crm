/*
  Warnings:

  - You are about to drop the column `global_stataus` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `deleted-at` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "global_stataus",
ADD COLUMN     "deleted-at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is-deleted" BOOLEAN NOT NULL DEFAULT false;
