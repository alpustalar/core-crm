"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalStatusSchema = void 0;
const zod_1 = require("zod");
exports.GlobalStatusSchema = zod_1.z.enum(['ACTIVE', 'DELETED', 'SUSPENDED', 'TRIAL']);
exports.default = exports.GlobalStatusSchema;
//# sourceMappingURL=GlobalStatusSchema.js.map