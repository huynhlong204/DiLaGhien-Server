/*
  Warnings:

  - You are about to drop the column `layout_id` on the `seat_layout_items` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `seat_layout_templates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `plate_number` on the `vehicles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `brand` on the `vehicles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `status` on the `vehicles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the `seat_layouts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicle_layout` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[template_id,seat_code]` on the table `seat_layout_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,company_id]` on the table `seat_layout_templates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `template_id` to the `seat_layout_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seat_layout_items" DROP CONSTRAINT "seat_layout_items_layout_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_layouts" DROP CONSTRAINT "seat_layouts_company_id_fkey";

-- DropForeignKey
ALTER TABLE "seat_layouts" DROP CONSTRAINT "seat_layouts_template_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_layout" DROP CONSTRAINT "vehicle_layout_seat_layout_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicle_layout" DROP CONSTRAINT "vehicle_layout_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_company_id_fkey";

-- DropIndex
DROP INDEX "seat_layout_items_layout_id_seat_code_key";

-- DropIndex
DROP INDEX "seat_layout_templates_name_key";

-- DropIndex
DROP INDEX "vehicles_company_id_idx";

-- DropIndex
DROP INDEX "vehicles_plate_number_key";

-- AlterTable
ALTER TABLE "company_routes" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "customer_profiles" ALTER COLUMN "dateOfBirth" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "payment_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "seat_layout_items" DROP COLUMN "layout_id",
ADD COLUMN     "template_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "seat_layout_templates" ADD COLUMN     "company_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "last_used_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "shuttle_assignments" ALTER COLUMN "assigned_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "booking_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "transport_companies" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "trip_stop_points" ALTER COLUMN "estimated_time_from_start" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "trips" ALTER COLUMN "departure_time" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "seat_layout_template_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vehicle_type_id" INTEGER,
ALTER COLUMN "plate_number" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "brand" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "status" SET DATA TYPE VARCHAR(50);

-- DropTable
DROP TABLE "seat_layouts";

-- DropTable
DROP TABLE "vehicle_layout";

-- CreateTable
CREATE TABLE "vehicle_types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_name_key" ON "vehicle_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seat_layout_items_template_id_seat_code_key" ON "seat_layout_items"("template_id", "seat_code");

-- CreateIndex
CREATE UNIQUE INDEX "seat_layout_templates_name_company_id_key" ON "seat_layout_templates"("name", "company_id");

-- AddForeignKey
ALTER TABLE "seat_layout_templates" ADD CONSTRAINT "seat_layout_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_layout_items" ADD CONSTRAINT "seat_layout_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "seat_layout_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "transport_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_seat_layout_template_id_fkey" FOREIGN KEY ("seat_layout_template_id") REFERENCES "seat_layout_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
