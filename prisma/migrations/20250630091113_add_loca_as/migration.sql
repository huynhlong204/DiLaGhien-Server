-- CreateIndex
CREATE INDEX "districts_province_id_idx" ON "districts"("province_id");

-- CreateIndex
CREATE INDEX "locations_ward_id_idx" ON "locations"("ward_id");

-- CreateIndex
CREATE INDEX "payments_ticket_id_idx" ON "payments"("ticket_id");

-- CreateIndex
CREATE INDEX "provinces_name_idx" ON "provinces"("name");

-- CreateIndex
CREATE INDEX "routes_from_location_id_idx" ON "routes"("from_location_id");

-- CreateIndex
CREATE INDEX "routes_to_location_id_idx" ON "routes"("to_location_id");

-- CreateIndex
CREATE INDEX "shuttle_assignments_shuttle_request_id_idx" ON "shuttle_assignments"("shuttle_request_id");

-- CreateIndex
CREATE INDEX "shuttle_requests_ticket_id_idx" ON "shuttle_requests"("ticket_id");

-- CreateIndex
CREATE INDEX "shuttle_requests_pickup_location_id_idx" ON "shuttle_requests"("pickup_location_id");

-- CreateIndex
CREATE INDEX "shuttle_requests_dropoff_location_id_idx" ON "shuttle_requests"("dropoff_location_id");

-- CreateIndex
CREATE INDEX "stop_points_route_id_idx" ON "stop_points"("route_id");

-- CreateIndex
CREATE INDEX "stop_points_location_id_idx" ON "stop_points"("location_id");

-- CreateIndex
CREATE INDEX "tickets_customer_id_idx" ON "tickets"("customer_id");

-- CreateIndex
CREATE INDEX "tickets_trip_id_idx" ON "tickets"("trip_id");

-- CreateIndex
CREATE INDEX "trips_route_id_idx" ON "trips"("route_id");

-- CreateIndex
CREATE INDEX "trips_vehicle_id_idx" ON "trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "trips_company_id_idx" ON "trips"("company_id");

-- CreateIndex
CREATE INDEX "wards_district_id_idx" ON "wards"("district_id");
