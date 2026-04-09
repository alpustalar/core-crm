"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserByActorDto = void 0;
const openapi = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const command_1 = require("../../../schemas/root/command");
class UpdateUserByActorDto extends (0, nestjs_zod_1.createZodDto)(command_1.UpdateUserByActorSchema) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateUserByActorDto = UpdateUserByActorDto;
//# sourceMappingURL=update-user-by-actor.dto.js.map