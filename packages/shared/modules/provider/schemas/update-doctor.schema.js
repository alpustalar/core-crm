"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDoctorSchema = void 0;
const zod_1 = require("zod");
const create_doctor_schema_1 = require("./create-doctor.schema");
exports.UpdateDoctorSchema = zod_1.z.lazy(() => create_doctor_schema_1.CreateDoctorSchema.partial());
//# sourceMappingURL=update-doctor.schema.js.map