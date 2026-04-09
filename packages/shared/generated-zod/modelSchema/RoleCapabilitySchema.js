"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCapabilitySchema = void 0;
const zod_1 = require("zod");
exports.RoleCapabilitySchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    roleId: zod_1.z.string(),
    capabilityId: zod_1.z.string(),
    createdAt: zod_1.z.coerce.date(),
});
exports.default = exports.RoleCapabilitySchema;
//# sourceMappingURL=RoleCapabilitySchema.js.map