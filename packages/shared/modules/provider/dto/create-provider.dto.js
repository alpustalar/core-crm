"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDoctorDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const schemas_1 = require("../schemas");
class CreateProviderDto extends (0, nestjs_zod_1.createZodDto)(schemas_1.CreateDoctorSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CreateDoctorDto = CreateProviderDto;
//# sourceMappingURL=create-doctor.dto.js.map