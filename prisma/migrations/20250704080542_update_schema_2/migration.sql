/*
  Warnings:

  - Made the column `company_id` on table `seat_layout_templates` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "seat_layout_templates" DROP CONSTRAINT "seat_layout_templates_company_id_fkey";

-- AlterTable
ALTER TABLE "seat_layout_templates" ALTER COLUMN "company_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "seat_layout_templates" ADD CONSTRAINT "seat_layout_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
