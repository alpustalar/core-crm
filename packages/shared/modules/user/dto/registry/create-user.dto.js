"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const create_user_schema_1 = require("../../schemas/registry/create-user.schema");
class CreateUserDto extends (0, nestjs_zod_1.createZodDto)(create_user_schema_1.CreateUserSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.CreateUserDto = CreateUserDto;
//# sourceMappingURL=create-user.dto.js.map