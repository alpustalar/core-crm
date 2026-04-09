"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDoctorDto = exports.UpdateDoctorSchema = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const zod_1 = require("zod");
const schemas_1 = require("../schemas");
exports.UpdateDoctorSchema = zod_1.z.lazy(() => schemas_1.CreateDoctorSchema.partial());
class UpdateDoctorDto extends (0, nestjs_zod_1.createZodDto)(exports.UpdateDoctorSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateDoctorDto = UpdateDoctorDto;
//# sourceMappingURL=update-doctor.dto.js.map