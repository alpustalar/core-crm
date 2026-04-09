"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClinicDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const clinic_1 = require("..");
class UpdateClinicDto extends (0, nestjs_zod_1.createZodDto)(clinic_1.UpdateClinicSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateClinicDto = UpdateClinicDto;
//# sourceMappingURL=update-clinic.dto.js.map