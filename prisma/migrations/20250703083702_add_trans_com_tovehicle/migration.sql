/*
  Warnings:

  - A unique constraint covering the columns `[company_id,plate_number]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_id` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "vehicles_company_id_idx" ON "vehicles"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_company_id_plate_number_key" ON "vehicles"("company_id", "plate_number");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
