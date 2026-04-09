"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckEmailDto = void 0;
const openapi = require("@nestjs/swagger");
const check_email_schema_1 = require("../../schemas/registry/check-email.schema");
const nestjs_zod_1 = require("nestjs-zod");
class CheckEmailDto extends (0, nestjs_zod_1.createZodDto)(check_email_schema_1.CheckEmailSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CheckEmailDto = CheckEmailDto;
//# sourceMappingURL=check-email.dto.js.map