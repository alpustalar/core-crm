"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAppointmentDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const schemas_1 = require("../schemas");
class CreateAppointmentDto extends (0, nestjs_zod_1.createZodDto)(schemas_1.CreateAppointmentSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CreateAppointmentDto = CreateAppointmentDto;
//# sourceMappingURL=create-appointment.dto.js.map