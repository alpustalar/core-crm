-- CreateTable
CREATE TABLE "subscription_payment_methods" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'IYZICO',
    "card_user_key" TEXT NOT NULL,
    "card_token" TEXT NOT NULL,
    "masked_number" TEXT,
    "card_association" TEXT,
    "card_family" TEXT,
    "buyer_name" TEXT NOT NULL,
    "buyer_surname" TEXT NOT NULL,
    "buyer_email" TEXT NOT NULL,
    "buyer_gsm_number" TEXT NOT NULL,
    "buyer_ip" TEXT NOT NULL,
    "buyer_city" TEXT,
    "buyer_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_payment_methods_subscription_id_key" ON "subscription_payment_methods"("subscription_id");

-- AddForeignKey
ALTER TABLE "subscription_payment_methods" ADD CONSTRAINT "subscription_payment_methods_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
