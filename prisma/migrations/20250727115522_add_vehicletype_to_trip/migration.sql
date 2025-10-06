-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "vehicle_type_id" INTEGER;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
