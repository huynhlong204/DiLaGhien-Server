/*
  Warnings:

  - You are about to drop the column `company_id` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the column `route_id` on the `trips` table. All the data in the column will be lost.
  - You are about to drop the `trip_stop_points` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `company_route_id` to the `trips` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "trip_stop_points" DROP CONSTRAINT "trip_stop_points_location_id_fkey";

-- DropForeignKey
ALTER TABLE "trip_stop_points" DROP CONSTRAINT "trip_stop_points_trip_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_company_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_route_id_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_vehicle_id_fkey";

-- DropIndex
DROP INDEX "company_routes_company_id_idx";

-- DropIndex
DROP INDEX "company_routes_route_id_idx";

-- AlterTable
ALTER TABLE "trips" DROP COLUMN "company_id",
DROP COLUMN "route_id",
ADD COLUMN     "company_route_id" INTEGER NOT NULL,
ADD COLUMN     "routesId" INTEGER,
ADD COLUMN     "seat_layout_templatesId" INTEGER,
ADD COLUMN     "transport_companiesId" INTEGER,
ALTER COLUMN "vehicle_id" DROP NOT NULL;

-- DropTable
DROP TABLE "trip_stop_points";

-- CreateTable
CREATE TABLE "company_route_stops" (
    "id" SERIAL NOT NULL,
    "company_route_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "is_pickup_point" BOOLEAN NOT NULL DEFAULT true,
    "is_dropoff_point" BOOLEAN NOT NULL DEFAULT true,
    "time_offset_minutes" INTEGER DEFAULT 0,
    "price_adjustment" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "company_route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_route_stops_company_route_id_stop_order_key" ON "company_route_stops"("company_route_id", "stop_order");

-- CreateIndex
CREATE UNIQUE INDEX "company_route_stops_company_route_id_location_id_key" ON "company_route_stops"("company_route_id", "location_id");

-- AddForeignKey
ALTER TABLE "company_route_stops" ADD CONSTRAINT "company_route_stops_company_route_id_fkey" FOREIGN KEY ("company_route_id") REFERENCES "company_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_route_stops" ADD CONSTRAINT "company_route_stops_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_company_route_id_fkey" FOREIGN KEY ("company_route_id") REFERENCES "company_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_transport_companiesId_fkey" FOREIGN KEY ("transport_companiesId") REFERENCES "transport_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_seat_layout_templatesId_fkey" FOREIGN KEY ("seat_layout_templatesId") REFERENCES "seat_layout_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_routesId_fkey" FOREIGN KEY ("routesId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
