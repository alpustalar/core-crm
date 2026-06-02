'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserSoftDeleteByActorDto = void 0;
const openapi = require('@nestjs/swagger');
const nestjs_zod_1 = require('nestjs-zod');
const command_1 = require('../../schemas/commands/index');
class UserSoftDeleteByActorDto extends (0, nestjs_zod_1.createZodDto)(
  command_1.UserSoftDeleteByActorSchema
) {
  static _OPENAPI_METADATA_FACTORY() {
    return {};
  }
}
exports.UserSoftDeleteByActorDto = UserSoftDeleteByActorDto;
//# sourceMappingURL=user-soft-delete-by-actor.dto.js.map
