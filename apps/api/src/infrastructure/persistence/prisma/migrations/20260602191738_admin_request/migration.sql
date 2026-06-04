-- CreateEnum
CREATE TYPE "AdminRequestType" AS ENUM ('CLINIC_DELETION', 'ORGANIZATION_DELETION');

-- CreateEnum
CREATE TYPE "AdminRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "admin_requests" (
    "id" TEXT NOT NULL,
    "type" "AdminRequestType" NOT NULL,
    "status" "AdminRequestStatus" NOT NULL DEFAULT 'PENDING',
    "target_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "organization_id" TEXT,
    "metadata" JSONB,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_requests_pkey" PRIMARY KEY ("id")
);
