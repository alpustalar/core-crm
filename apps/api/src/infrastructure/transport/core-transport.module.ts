import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NatsClientModule } from '@src/transport';
import { PatientModule } from '@modules/crm/patient/patient.module';
import { LeadModule } from '@modules/crm/lead/lead.module';
import { AiToolsModule } from '@modules/platform/ai-tools/ai-tools.module';
import { CoreRpcController } from './core-rpc.controller';
import { ContactRpcService } from './contact-rpc.service';

/**
 * Core'un `apps/messaging`'e açtığı NATS yüzeyi.
 *
 * `NatsClientModule` de import edilir: core yalnız istek karşılamaz, ödeme onayı gibi
 * olayları messaging'e **yayınlar** da.
 *
 * `AiToolsModule` buradan import edilir çünkü artık **tek tüketicisi bu modüldür**:
 * eskiden messaging in-process çekiyordu ve o gidince (@Global olmasına rağmen) hiç
 * örneklenmiyordu — araç modülleri `AiToolSupport`'u bulamıyordu.
 */
@Module({
  imports: [
    CqrsModule,
    NatsClientModule,
    AiToolsModule,
    PatientModule,
    LeadModule,
  ],
  controllers: [CoreRpcController],
  providers: [ContactRpcService],
})
export class CoreTransportModule {}
