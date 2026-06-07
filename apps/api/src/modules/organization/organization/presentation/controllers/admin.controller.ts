import { Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { SystemAdminGuard } from '@modules/identity/auth/auth/guards/system-admin/system-admin.guard';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller()
export class AdminController {
  constructor() {}

  @Post()
  create() {}

  @Delete(':organization-id')
  softDelete() {}
}
