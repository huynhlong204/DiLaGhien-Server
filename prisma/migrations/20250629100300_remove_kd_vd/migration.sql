/*
  Warnings:

  - You are about to drop the column `latitude` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `locations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "locations_latitude_longitude_idx";

-- AlterTable
ALTER TABLE "locations" DROP COLUMN "latitude",
DROP COLUMN "longitude";
