/*
  Warnings:

  - You are about to drop the column `latitude` on the `locations` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `locations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "districts_province_id_idx";

-- DropIndex
DROP INDEX "locations_ward_id_idx";

-- DropIndex
DROP INDEX "payments_ticket_id_idx";

-- DropIndex
DROP INDEX "provinces_name_idx";

-- DropIndex
DROP INDEX "routes_from_location_id_idx";

-- DropIndex
DROP INDEX "routes_to_location_id_idx";

-- DropIndex
DROP INDEX "shuttle_assignments_shuttle_request_id_idx";

-- DropIndex
DROP INDEX "shuttle_requests_dropoff_location_id_idx";

-- DropIndex
DROP INDEX "shuttle_requests_pickup_location_id_idx";

-- DropIndex
DROP INDEX "shuttle_requests_ticket_id_idx";

-- DropIndex
DROP INDEX "stop_points_location_id_idx";

-- DropIndex
DROP INDEX "stop_points_route_id_idx";

-- DropIndex
DROP INDEX "tickets_customer_id_idx";

-- DropIndex
DROP INDEX "tickets_trip_id_idx";

-- DropIndex
DROP INDEX "trips_company_id_idx";

-- DropIndex
DROP INDEX "trips_route_id_idx";

-- DropIndex
DROP INDEX "trips_vehicle_id_idx";

-- DropIndex
DROP INDEX "wards_district_id_idx";

-- AlterTable
ALTER TABLE "locations" DROP COLUMN "latitude",
DROP COLUMN "longitude";
