-- CreateTable
CREATE TABLE "purchase_invoices" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "line_account_code" TEXT NOT NULL,
    "vat_rate" INTEGER NOT NULL,
    "net_total" DECIMAL(12,2) NOT NULL,
    "vat_total" DECIMAL(12,2) NOT NULL,
    "grand_total" DECIMAL(12,2) NOT NULL,
    -- NOT: "Currency" enum tipi henüz oluşturulmadı (170914_currency_enum_common_schema'da yaratılıyor).
    -- Bu kolon TEXT olarak oluşturulur; 212226_currency migration'ı onu "Currency" enum'a çevirir.
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_invoices_clinic_id_idx" ON "purchase_invoices"("clinic_id");

-- CreateIndex
CREATE INDEX "purchase_invoices_organization_id_idx" ON "purchase_invoices"("organization_id");

-- CreateIndex
CREATE INDEX "purchase_invoices_supplier_id_idx" ON "purchase_invoices"("supplier_id");
