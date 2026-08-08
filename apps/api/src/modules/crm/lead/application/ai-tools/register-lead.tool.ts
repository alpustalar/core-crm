import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { MessageChannelType } from '@shared';
import {
  AiToolContext,
  AiToolDefinition,
  AiToolResult,
} from '@common/ai-tools';
import { AiTool, IAiSubToolHandler } from '@common/ai-tools';
import { AI_TOOL_NAMES } from '@common/ai-tools';
import { AiToolSupport } from '@modules/platform/ai-tools/application/ai-tool.support';
import { CreateLeadCommand } from '@modules/crm/lead/application/commands/create-lead/create-lead.command';
import { CreateLeadDto } from '@shared/modules/lead/dto/commands';
import { FindPatientByContactQuery } from '@modules/crm/patient/application/queries/find-patient-by-contact/find-patient-by-contact.query';

const RegisterLeadInputSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1).optional(),
  consent: z.literal(true),
});

/**
 * Yeni müşteriyi (lead) kaydeder. KVKK onayı zorunludur. Telefon: WhatsApp'ta yazışılan
 * numara otomatik; hasta farklı numara verdiyse o. Telegram/Instagram'da numara açıkça
 * gerekir. Mükerrer önleme: zaten kayıtlı hasta/numara varsa yeni lead açılmaz.
 */
@AiTool()
@Injectable()
export class RegisterLeadTool implements IAiSubToolHandler {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus,
    private readonly support: AiToolSupport
  ) {}

  get name(): string {
    return AI_TOOL_NAMES.REGISTER_LEAD;
  }

  get definition(): AiToolDefinition {
    return {
      name: AI_TOOL_NAMES.REGISTER_LEAD,
      description:
        "Yeni bir müşteriyi (lead) sisteme kaydeder. Hasta kayıt olmak/üye olmak istediğinde kullan. ÖNCE adını öğren ve kişisel verilerinin işlenmesine (KVKK) açık onayını al; onay verilmeden çağırma (consent=true ancak hasta açıkça kabul ettiyse). Telefon: WhatsApp'ta yazdığı numara otomatik kullanılır (phone boş bırak); hasta FARKLI bir numara verdiyse onu phone olarak gönder. Telegram/Instagram'da numara yazmadıysa phone gerekir.",
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Müşterinin adı soyadı.',
          },
          phone: {
            type: 'string',
            description:
              "Telefon numarası. WhatsApp'ta boş bırakılırsa yazışılan (doğrulanmış) numara kullanılır. Hasta farklı bir numara belirttiyse burada gönder.",
          },
          consent: {
            type: 'boolean',
            description:
              'Hasta kişisel verilerinin işlenmesine (KVKK) açıkça onay verdiyse true. Onay yoksa kayıt yapılmaz.',
          },
        },
        required: ['name', 'consent'],
        additionalProperties: false,
      },
    };
  }

  async execute(
    input: Record<string, unknown>,
    context: AiToolContext
  ): Promise<AiToolResult> {
    const parsed = RegisterLeadInputSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      if (fieldErrors.consent) {
        return {
          content:
            'Kayıt için kişisel verilerin işlenmesine (KVKK) açık onay gerekli. Lütfen önce onayı al.',
        };
      }
      return { content: 'Kayıt için ad soyad gerekli.' };
    }
    const { name } = parsed.data;

    const isWhatsApp = context.channel === 'WHATSAPP';
    // WhatsApp'ta contactPhone = doğrulanmış numara; diğer kanallarda kimlik (chatId/IGSID).
    const phone = parsed.data.phone || (isWhatsApp ? context.contactPhone : '');
    if (!phone) {
      return {
        content:
          'Telefon numarası gerekli. Lütfen müşteriden numarasını paylaşmasını iste.',
      };
    }

    // Mükerrer önleme: yazışma zaten bir hastaya bağlıysa ya da numarayla kayıt varsa açma.
    if (context.patientId) {
      return {
        content: JSON.stringify({
          alreadyRegistered: true,
          message: 'Bu kişi sistemde zaten kayıtlı.',
        }),
      };
    }
    try {
      const { data: patient } = await this.queryBus.execute(
        new FindPatientByContactQuery({ clinicId: context.clinicId, phone })
      );
      if (patient) {
        return {
          content: JSON.stringify({
            alreadyRegistered: true,
            message: 'Bu numarayla zaten bir kayıt mevcut.',
          }),
        };
      }
    } catch {
      // Kayıt bulunamadı → yeni lead oluşturmaya devam.
    }

    const ctx = this.support.buildClinicContext(context);
    const dto: CreateLeadDto = {
      // Kanal LeadSource ile örtüşür (WHATSAPP/INSTAGRAM/TELEGRAM); değilse MANUAL.
      source: this.channelToLeadSource(context.channel),
      medium: 'ORGANIC',
      name,
      phone,
      notes: `AI sohbet asistanı üzerinden kayıt (kanal: ${context.channel}).`,
    } as CreateLeadDto;

    await this.commandBus.execute(
      new CreateLeadCommand({ data: dto, clinicId: context.clinicId, ctx })
    );

    return {
      content: JSON.stringify({
        success: true,
        message: `${name} adına kaydınız oluşturuldu.`,
      }),
    };
  }

  /** Mesajlaşma kanalını LeadSource'a eşler (örtüşenler direkt; diğerleri MANUAL). */
  private channelToLeadSource(
    channel: MessageChannelType
  ): CreateLeadDto['source'] {
    switch (channel) {
      case 'WHATSAPP':
        return 'WHATSAPP';
      case 'INSTAGRAM':
        return 'INSTAGRAM';
      case 'TELEGRAM':
        return 'TELEGRAM';
      default:
        return 'MANUAL';
    }
  }
}
