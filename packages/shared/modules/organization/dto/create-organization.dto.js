"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const schemas_1 = require("../schemas");
class CreateOrganizationDto extends (0, nestjs_zod_1.createZodDto)(schemas_1.CreateOrganizationSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CreateOrganizationDto = CreateOrganizationDto;
//# sourceMappingURL=create-organization.dto.js.map