"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehicleTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_vehicle_type_dto_1 = require("./create-vehicle-type.dto");
class UpdateVehicleTypeDto extends (0, swagger_1.PartialType)(create_vehicle_type_dto_1.CreateVehicleTypeDto) {
}
exports.UpdateVehicleTypeDto = UpdateVehicleTypeDto;
//# sourceMappingURL=update-vehicle-type.dto.js.map