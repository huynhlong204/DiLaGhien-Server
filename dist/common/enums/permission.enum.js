"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionBit = void 0;
var PermissionBit;
(function (PermissionBit) {
    PermissionBit[PermissionBit["VIEW"] = 1] = "VIEW";
    PermissionBit[PermissionBit["CREATE"] = 2] = "CREATE";
    PermissionBit[PermissionBit["UPDATE"] = 4] = "UPDATE";
    PermissionBit[PermissionBit["DELETE"] = 8] = "DELETE";
    PermissionBit[PermissionBit["APPROVE"] = 16] = "APPROVE";
    PermissionBit[PermissionBit["EXPORT"] = 32] = "EXPORT";
})(PermissionBit || (exports.PermissionBit = PermissionBit = {}));
//# sourceMappingURL=permission.enum.js.map