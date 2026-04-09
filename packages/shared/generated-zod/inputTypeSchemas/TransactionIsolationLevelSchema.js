"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionIsolationLevelSchema = void 0;
const zod_1 = require("zod");
exports.TransactionIsolationLevelSchema = zod_1.z.enum(['ReadUncommitted', 'ReadCommitted', 'RepeatableRead', 'Serializable']);
exports.default = exports.TransactionIsolationLevelSchema;
//# sourceMappingURL=TransactionIsolationLevelSchema.js.map