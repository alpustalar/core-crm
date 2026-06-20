/** WABA'da tanımlı bir WhatsApp mesaj şablonu (FE şablon seçici için). */
export interface WhatsappTemplateView {
  name: string;
  language: string;
  status: string; // APPROVED | PENDING | REJECTED | PAUSED | DISABLED
  category: string; // MARKETING | UTILITY | AUTHENTICATION
  components: unknown[];
}
