/*
  Warnings:

  - You are about to drop the column `district_id` on the `wards` table. All the data in the column will be lost.
  - You are about to drop the `districts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[province_id,name]` on the table `wards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `province_id` to the `wards` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "districts" DROP CONSTRAINT "districts_province_id_fkey";

-- DropForeignKey
ALTER TABLE "wards" DROP CONSTRAINT "wards_district_id_fkey";

-- DropIndex
DROP INDEX "wards_district_id_name_key";

-- AlterTable
ALTER TABLE "wards" DROP COLUMN "district_id",
ADD COLUMN     "province_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "districts";

-- CreateIndex
CREATE UNIQUE INDEX "wards_province_id_name_key" ON "wards"("province_id", "name");

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
