"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertUserToDoctorDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const schemas_1 = require("../schemas");
class ConvertUserToDoctorDto extends (0, nestjs_zod_1.createZodDto)(schemas_1.ConvertUserToDoctorSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.ConvertUserToDoctorDto = ConvertUserToDoctorDto;
//# sourceMappingURL=convert-user-to-doctor.dto.js.map