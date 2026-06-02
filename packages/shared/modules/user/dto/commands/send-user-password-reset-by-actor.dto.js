'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SendUserPasswordResetByActorDto = void 0;
const openapi = require('@nestjs/swagger');
const nestjs_zod_1 = require('nestjs-zod');
const command_1 = require('../../schemas/commands/index');
class SendUserPasswordResetByActorDto extends (0, nestjs_zod_1.createZodDto)(
  command_1.SendUserPasswordResetByActorSchema
) {
  static _OPENAPI_METADATA_FACTORY() {
    return {};
  }
}
exports.SendUserPasswordResetByActorDto = SendUserPasswordResetByActorDto;
//# sourceMappingURL=send-user-password-reset-by-actor.dto.js.map
