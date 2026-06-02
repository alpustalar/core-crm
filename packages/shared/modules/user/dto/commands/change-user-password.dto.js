'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChangeUserPasswordDto = void 0;
const openapi = require('@nestjs/swagger');
const nestjs_zod_1 = require('nestjs-zod');
const command_1 = require('../../schemas/commands/index');
class ChangeUserPasswordDto extends (0, nestjs_zod_1.createZodDto)(
  command_1.ChangeUserPasswordSchema
) {
  static _OPENAPI_METADATA_FACTORY() {
    return {};
  }
}
exports.ChangeUserPasswordDto = ChangeUserPasswordDto;
//# sourceMappingURL=change-user-password.dto.js.map
