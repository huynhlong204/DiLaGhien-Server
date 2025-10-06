/*
  Warnings:

  - You are about to drop the column `code` on the `districts` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `provinces` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `wards` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "provinces_code_key";

-- AlterTable
ALTER TABLE "districts" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "provinces" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "wards" DROP COLUMN "code";
