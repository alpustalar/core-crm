"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClinicDto = void 0;
const openapi = require("@nestjs/swagger");
const clinic_1 = require("..");
const nestjs_zod_1 = require("nestjs-zod");
class CreateClinicDto extends (0, nestjs_zod_1.createZodDto)(clinic_1.CreateClinicSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CreateClinicDto = CreateClinicDto;
//# sourceMappingURL=create-clinic.dto.js.map