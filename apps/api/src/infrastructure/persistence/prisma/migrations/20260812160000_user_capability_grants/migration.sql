-- CreateTable
CREATE TABLE "user_capabilities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "capability_id" TEXT NOT NULL,
    "granted_by_id" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_capabilities_user_id_idx" ON "user_capabilities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_capabilities_user_id_capability_id_key" ON "user_capabilities"("user_id", "capability_id");

-- AddForeignKey
ALTER TABLE "user_capabilities" ADD CONSTRAINT "user_capabilities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_capabilities" ADD CONSTRAINT "user_capabilities_capability_id_fkey" FOREIGN KEY ("capability_id") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_capabilities" ADD CONSTRAINT "user_capabilities_granted_by_id_fkey" FOREIGN KEY ("granted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
