/*
  Warnings:

  - The `timezone` column on the `appointments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `timezone` column on the `clinics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `timezone` column on the `organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `is_consultation` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TimeZone" AS ENUM ('Europe_Istanbul', 'Europe_London', 'Europe_Paris', 'Europe_Berlin', 'Europe_Rome', 'Europe_Madrid', 'Europe_Amsterdam', 'Europe_Brussels', 'Europe_Vienna', 'Europe_Zurich', 'Europe_Athens', 'Europe_Bucharest', 'Europe_Warsaw', 'Europe_Kiev', 'Europe_Moscow', 'Asia_Riyadh', 'Asia_Dubai', 'Asia_Kuwait', 'Asia_Qatar', 'Asia_Bahrain', 'Asia_Muscat', 'Asia_Baghdad', 'Asia_Amman', 'Asia_Beirut', 'Asia_Damascus', 'Africa_Cairo', 'America_New_York', 'America_Chicago', 'America_Denver', 'America_Los_Angeles', 'America_Sao_Paulo', 'America_Mexico_City', 'Asia_Tokyo', 'Asia_Shanghai', 'Asia_Singapore', 'Asia_Hong_Kong', 'Asia_Seoul', 'Australia_Sydney', 'Africa_Johannesburg', 'Africa_Casablanca', 'Africa_Tunis', 'Etc_UTC');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "is_consultation" BOOLEAN NOT NULL,
DROP COLUMN "timezone",
ADD COLUMN     "timezone" "TimeZone" NOT NULL DEFAULT 'Europe_Istanbul';

-- AlterTable
ALTER TABLE "clinics" DROP COLUMN "timezone",
ADD COLUMN     "timezone" "TimeZone" NOT NULL DEFAULT 'Europe_Istanbul';

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "timezone",
ADD COLUMN     "timezone" "TimeZone" NOT NULL DEFAULT 'Europe_Istanbul';
