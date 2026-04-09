"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalSystemSchema = void 0;
const zod_1 = require("zod");
exports.ExternalSystemSchema = zod_1.z.enum(['WHATSAPP', 'N8N', 'GOOGLE_CALENDAR']);
exports.default = exports.ExternalSystemSchema;
//# sourceMappingURL=ExternalSystemSchema.js.map