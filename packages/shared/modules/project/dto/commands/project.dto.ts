import { createZodDto } from 'nestjs-zod';
import {
  AllocateProjectResourceSchema,
  AssignProjectTaskSchema,
  ChangeProjectStatusSchema,
  CreateProjectPhaseSchema,
  CreateProjectSchema,
  CreateProjectTaskSchema,
  MoveProjectTaskSchema,
  RecordProjectCostSchema,
  UpdateProjectPhaseSchema,
  UpdateProjectSchema,
  UpdateProjectTaskSchema,
} from '../../schemas/commands';

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
export class UpdateProjectDto extends createZodDto(UpdateProjectSchema) {}
export class ChangeProjectStatusDto extends createZodDto(
  ChangeProjectStatusSchema
) {}
export class CreateProjectPhaseDto extends createZodDto(
  CreateProjectPhaseSchema
) {}
export class UpdateProjectPhaseDto extends createZodDto(
  UpdateProjectPhaseSchema
) {}
export class CreateProjectTaskDto extends createZodDto(
  CreateProjectTaskSchema
) {}
export class UpdateProjectTaskDto extends createZodDto(
  UpdateProjectTaskSchema
) {}
export class MoveProjectTaskDto extends createZodDto(MoveProjectTaskSchema) {}
export class AssignProjectTaskDto extends createZodDto(
  AssignProjectTaskSchema
) {}
export class RecordProjectCostDto extends createZodDto(
  RecordProjectCostSchema
) {}
export class AllocateProjectResourceDto extends createZodDto(
  AllocateProjectResourceSchema
) {}
