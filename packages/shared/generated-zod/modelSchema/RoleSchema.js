"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleSchema = void 0;
const zod_1 = require("zod");
exports.RoleSchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    priority: zod_1.z.number().int(),
    isSystemRole: zod_1.z.boolean(),
    createdAt: zod_1.z.coerce.date(),
    updatedAt: zod_1.z.coerce.date(),
});
exports.default = exports.RoleSchema;
//# sourceMappingURL=RoleSchema.js.map