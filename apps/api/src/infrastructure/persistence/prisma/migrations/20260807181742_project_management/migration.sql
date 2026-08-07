-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectPhaseStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ProjectTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProjectTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ProjectCostSource" AS ENUM ('MANUAL', 'PURCHASE_INVOICE', 'WORK_ORDER', 'PAYROLL');

-- CreateEnum
CREATE TYPE "ProjectResourceKind" AS ENUM ('EMPLOYEE', 'ROOM', 'EQUIPMENT');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "owner_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "budget" DECIMAL(16,2),
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_phases" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" "ProjectPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "start_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "budget" DECIMAL(16,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tasks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "parent_task_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "ProjectTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignee_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "board_order" INTEGER NOT NULL DEFAULT 0,
    "estimated_hours" DECIMAL(8,2),
    "actual_hours" DECIMAL(8,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_costs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source" "ProjectCostSource" NOT NULL DEFAULT 'MANUAL',
    "source_ref_id" TEXT,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "incurred_at" TIMESTAMP(3) NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_resource_allocations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "phase_id" TEXT,
    "clinic_id" TEXT NOT NULL,
    "kind" "ProjectResourceKind" NOT NULL,
    "resource_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "allocation_percent" INTEGER NOT NULL DEFAULT 100,
    "note" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_resource_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_clinic_id_status_idx" ON "projects"("clinic_id", "status");

-- CreateIndex
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");

-- CreateIndex
CREATE INDEX "projects_owner_id_status_idx" ON "projects"("owner_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "projects_clinic_id_code_key" ON "projects"("clinic_id", "code");

-- CreateIndex
CREATE INDEX "project_phases_project_id_status_idx" ON "project_phases"("project_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "project_phases_project_id_order_key" ON "project_phases"("project_id", "order");

-- CreateIndex
CREATE INDEX "project_tasks_project_id_status_idx" ON "project_tasks"("project_id", "status");

-- CreateIndex
CREATE INDEX "project_tasks_phase_id_idx" ON "project_tasks"("phase_id");

-- CreateIndex
CREATE INDEX "project_tasks_assignee_id_status_idx" ON "project_tasks"("assignee_id", "status");

-- CreateIndex
CREATE INDEX "project_tasks_clinic_id_due_at_idx" ON "project_tasks"("clinic_id", "due_at");

-- CreateIndex
CREATE INDEX "project_costs_project_id_incurred_at_idx" ON "project_costs"("project_id", "incurred_at");

-- CreateIndex
CREATE INDEX "project_costs_clinic_id_idx" ON "project_costs"("clinic_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_costs_project_id_source_source_ref_id_key" ON "project_costs"("project_id", "source", "source_ref_id");

-- CreateIndex
CREATE INDEX "project_resource_allocations_clinic_id_kind_resource_id_sta_idx" ON "project_resource_allocations"("clinic_id", "kind", "resource_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "project_resource_allocations_project_id_idx" ON "project_resource_allocations"("project_id");

-- AddForeignKey
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "project_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_costs" ADD CONSTRAINT "project_costs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_costs" ADD CONSTRAINT "project_costs_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_resource_allocations" ADD CONSTRAINT "project_resource_allocations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_resource_allocations" ADD CONSTRAINT "project_resource_allocations_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "project_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
