"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalJsLikeSchema = void 0;
const zod_1 = require("zod");
exports.DecimalJsLikeSchema = zod_1.z.object({
    d: zod_1.z.array(zod_1.z.number()),
    e: zod_1.z.number(),
    s: zod_1.z.number(),
    toFixed: zod_1.z.any(),
});
exports.default = exports.DecimalJsLikeSchema;
//# sourceMappingURL=DecimalJsLikeSchema.js.map