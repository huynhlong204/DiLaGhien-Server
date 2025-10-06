/*
  Warnings:

  - You are about to drop the column `ward_id` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the `provinces` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_ward_id_fkey";

-- DropForeignKey
ALTER TABLE "wards" DROP CONSTRAINT "wards_province_id_fkey";

-- AlterTable
ALTER TABLE "locations" DROP COLUMN "ward_id";

-- DropTable
DROP TABLE "provinces";

-- DropTable
DROP TABLE "wards";
