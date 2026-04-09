"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTypeSchema = void 0;
const zod_1 = require("zod");
exports.FileTypeSchema = zod_1.z.enum(['XRAY', 'PRESCRIPTION', 'PHOTO', 'CONSENT_FORM', 'LAB_RESULT', 'OTHER']);
exports.default = exports.FileTypeSchema;
//# sourceMappingURL=FileTypeSchema.js.map