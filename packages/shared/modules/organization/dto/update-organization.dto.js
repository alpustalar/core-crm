"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrganizationDto = void 0;
const openapi = require("@nestjs/swagger");
const schemas_1 = require("../schemas");
const nestjs_zod_1 = require("nestjs-zod");
class UpdateOrganizationDto extends (0, nestjs_zod_1.createZodDto)(schemas_1.UpdateOrganizationSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateOrganizationDto = UpdateOrganizationDto;
//# sourceMappingURL=update-organization.dto.js.map