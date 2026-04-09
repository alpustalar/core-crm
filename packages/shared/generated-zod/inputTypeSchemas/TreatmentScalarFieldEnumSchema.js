"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentScalarFieldEnumSchema = void 0;
const zod_1 = require("zod");
exports.TreatmentScalarFieldEnumSchema = zod_1.z.enum(['id', 'name', 'category', 'duration', 'minDuration', 'maxDuration', 'description', 'isActive', 'requiresApproval', 'isPackageOnly', 'displayOrder', 'clinicId', 'masterTreatmentId', 'createdAt', 'deletedAt', 'updatedAt']);
exports.default = exports.TreatmentScalarFieldEnumSchema;
//# sourceMappingURL=TreatmentScalarFieldEnumSchema.js.map