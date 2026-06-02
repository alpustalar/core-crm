'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.UserUpdateBySelfDto = void 0;
const openapi = require('@nestjs/swagger');
const nestjs_zod_1 = require('nestjs-zod');
const user_update_by_self_schema_1 = require('../../schemas/commands/user-update-by-self.schema');
class UserUpdateBySelfDto extends (0, nestjs_zod_1.createZodDto)(
  user_update_by_self_schema_1.UserUpdateBySelfSchema
) {
  static _OPENAPI_METADATA_FACTORY() {
    return {};
  }
}
exports.UserUpdateBySelfDto = UserUpdateBySelfDto;
//# sourceMappingURL=user-update-by-self.dto.js.map
