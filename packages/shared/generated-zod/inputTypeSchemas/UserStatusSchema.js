"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatusSchema = void 0;
const zod_1 = require("zod");
exports.UserStatusSchema = zod_1.z.enum(['ACTIVE', 'DELETED', 'SUSPENDED']);
exports.default = exports.UserStatusSchema;
//# sourceMappingURL=UserStatusSchema.js.map