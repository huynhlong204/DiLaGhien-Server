/*
  Warnings:

  - You are about to drop the `stop_points` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "stop_points" DROP CONSTRAINT "stop_points_location_id_fkey";

-- DropForeignKey
ALTER TABLE "stop_points" DROP CONSTRAINT "stop_points_route_id_fkey";

-- DropTable
DROP TABLE "stop_points";

-- CreateTable
CREATE TABLE "trip_stop_points" (
    "id" SERIAL NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "is_pickup_point" BOOLEAN NOT NULL DEFAULT true,
    "is_dropoff_point" BOOLEAN NOT NULL DEFAULT true,
    "estimated_time_from_start" TIMESTAMP(3),
    "price_adjustment" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "trip_stop_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_stop_points_trip_id_idx" ON "trip_stop_points"("trip_id");

-- CreateIndex
CREATE INDEX "trip_stop_points_location_id_idx" ON "trip_stop_points"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_stop_points_trip_id_stop_order_key" ON "trip_stop_points"("trip_id", "stop_order");

-- AddForeignKey
ALTER TABLE "trip_stop_points" ADD CONSTRAINT "trip_stop_points_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stop_points" ADD CONSTRAINT "trip_stop_points_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
