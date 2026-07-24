'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CreateUserDto = void 0;
const openapi = require('@nestjs/swagger');
const nestjs_zod_1 = require('nestjs-zod');
const create_user_schema_1 = require('../../schemas/commands/register-user-or-provider-account.schema');
class RegisterUserOrProviderAccountDto extends (0, nestjs_zod_1.createZodDto)(
  create_user_schema_1.RegisterUserOrProviderAccountSchema
) {
  static _OPENAPI_METADATA_FACTORY() {
    return {};
  }
}
exports.CreateUserDto = RegisterUserOrProviderAccountDto;
//# sourceMappingURL=create-user.dto.js.map
