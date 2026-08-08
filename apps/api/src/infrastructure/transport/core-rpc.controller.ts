import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AI_TOOL_EXECUTOR, IAiToolExecutor } from '@common/ai-tools';
import {
  ACTOR_CONTEXT_RESOLVER,
  IActorContextResolverPort,
} from '@src/auth';
import {
  AiToolDefinitionsResponse,
  ExecuteAiToolRequest,
  ExecuteAiToolResponse,
  FindPatientRequest,
  FindPatientResponse,
  NATS_SUBJECTS,
  RegisterAdReferralLeadRequest,
  RegisterAdReferralLeadResponse,
  ResolveActorRequest,
  ResolveActorResponse,
} from '@src/transport';
import { ContactRpcService } from './contact-rpc.service';

/**
 * `apps/messaging`'in core'a sorduğu her şeyin tek giriş kapısı.
 *
 * HTTP controller'ları gibi **ince**: iş mantığı yok, yalnız konu → servis eşlemesi.
 * Bu üç yetenek, messaging ayrı sürece çıktığında in-process erişimini kaybettiği
 * şeylerdir:
 *   1. AI araçları (randevu, otel, transfer… core'un aggregate'leri)
 *   2. `ActorContext` çözümlemesi (kullanıcı/rol tabloları core'da)
 *   3. Kontak çözümlemesi (hasta/lead core'da)
 */
@Controller()
export class CoreRpcController {
  constructor(
    @Inject(AI_TOOL_EXECUTOR)
    private readonly aiToolExecutor: IAiToolExecutor,
    @Inject(ACTOR_CONTEXT_RESOLVER)
    private readonly actorResolver: IActorContextResolverPort,
    private readonly contactRpc: ContactRpcService
  ) {}

  @MessagePattern(NATS_SUBJECTS.aiTool.definitions)
  getAiToolDefinitions(): AiToolDefinitionsResponse {
    return this.aiToolExecutor.getToolDefinitions();
  }

  @MessagePattern(NATS_SUBJECTS.aiTool.execute)
  executeAiTool(
    @Payload() payload: ExecuteAiToolRequest
  ): Promise<ExecuteAiToolResponse> {
    return this.aiToolExecutor.execute(payload.call, payload.context);
  }

  @MessagePattern(NATS_SUBJECTS.auth.resolveActor)
  resolveActor(
    @Payload() payload: ResolveActorRequest
  ): Promise<ResolveActorResponse> {
    return this.actorResolver.resolve(payload);
  }

  @MessagePattern(NATS_SUBJECTS.contact.findPatient)
  findPatient(
    @Payload() payload: FindPatientRequest
  ): Promise<FindPatientResponse> {
    return this.contactRpc.findPatientId(payload);
  }

  @MessagePattern(NATS_SUBJECTS.contact.registerAdReferralLead)
  registerAdReferralLead(
    @Payload() payload: RegisterAdReferralLeadRequest
  ): Promise<RegisterAdReferralLeadResponse> {
    return this.contactRpc.registerAdReferralLead(payload);
  }
}
