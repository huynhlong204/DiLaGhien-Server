/*
  Warnings:

  - You are about to drop the `seat_layout_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "seat_layout_items" DROP CONSTRAINT "seat_layout_items_template_id_fkey";

-- DropTable
DROP TABLE "seat_layout_items";
