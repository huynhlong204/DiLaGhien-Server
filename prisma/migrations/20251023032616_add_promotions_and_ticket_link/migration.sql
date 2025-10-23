-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "company_id" INTEGER;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "applied_discount_amount" DOUBLE PRECISION,
ADD COLUMN     "promotion_id" INTEGER;

-- CreateIndex
CREATE INDEX "promotions_company_id_idx" ON "promotions"("company_id");

-- CreateIndex
CREATE INDEX "tickets_promotion_id_idx" ON "tickets"("promotion_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
