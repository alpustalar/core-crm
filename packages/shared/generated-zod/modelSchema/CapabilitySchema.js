"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilitySchema = void 0;
const zod_1 = require("zod");
exports.CapabilitySchema = zod_1.z.object({
    id: zod_1.z.uuid(),
    name: zod_1.z.string(),
    module: zod_1.z.string(),
    action: zod_1.z.string(),
});
exports.default = exports.CapabilitySchema;
//# sourceMappingURL=CapabilitySchema.js.map