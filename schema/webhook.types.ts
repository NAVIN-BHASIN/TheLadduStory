/**
 * Meta Cloud Webhook Payloads (WhatsApp Business & Instagram DM)
 */

export interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: 'whatsapp' | 'instagram';
      metadata: {
        display_phone_number?: string;
        phone_number_id?: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        text?: { body: string };
        type: string;
      }>;
    };
    field: string;
  }>;
}

export interface MetaWebhookPayload {
  object: 'whatsapp_business_account' | 'instagram';
  entry: MetaWebhookEntry[];
}
