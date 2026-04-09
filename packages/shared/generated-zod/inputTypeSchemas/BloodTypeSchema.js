"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloodTypeSchema = void 0;
const zod_1 = require("zod");
exports.BloodTypeSchema = zod_1.z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG']);
exports.default = exports.BloodTypeSchema;
//# sourceMappingURL=BloodTypeSchema.js.map