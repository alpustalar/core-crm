-- CreateEnum
CREATE TYPE "GlobalStatus" AS ENUM ('ACTIVE', 'DELETED', 'SUSPENDED', 'TRIAL');

-- AlterTable
ALTER TABLE "clinics" ADD COLUMN     "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE';
