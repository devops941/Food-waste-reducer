/**
 * WhatsApp Business Cloud API Service
 * Meta App ID: 1567130661734464
 * Business ID: 1636399334744443
 */

export const sendWhatsAppMessage = async ({ to, message }) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION || 'v20.0';

  if (!token || !phoneNumberId) {
    console.warn(
      '[WhatsApp Service] WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured in .env. Message skipped.'
    );
    return {
      success: false,
      skipped: true,
      reason: 'WhatsApp API credentials missing in .env',
    };
  }

  // Format recipient phone number (remove spaces, plus sign, dashes)
  const cleanPhone = to.replace(/[^0-9]/g, '');

  try {
    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp Service Error]', data);
      return { success: false, error: data };
    }

    console.log(`[WhatsApp Service] Message successfully sent to ${cleanPhone}:`, data);
    return { success: true, data };
  } catch (err) {
    console.error('[WhatsApp Service Exception]', err.message);
    return { success: false, error: err.message };
  }
};

export const sendExpiryAlertWhatsApp = async ({ userPhone, userName, expiringItems = [] }) => {
  if (!userPhone || expiringItems.length === 0) return;

  const itemList = expiringItems
    .map(
      (item) =>
        `• *${item.name}* (${item.quantity}) — ${
          item.daysRemaining <= 0
            ? '⚠️ Expired/Expires today'
            : `⏳ ${item.daysRemaining} day(s) left`
        }`
    )
    .join('\n');

  const text = `🌱 *Pantry Fresh Expiry Alert*\n\nHi ${userName || 'there'}, you have food items needing attention:\n\n${itemList}\n\n👉 Open Pantry Fresh to cook a zero-waste meal today: ${
    process.env.CLIENT_URL || 'http://localhost:5173'
  }`;

  return await sendWhatsAppMessage({ to: userPhone, message: text });
};

export default {
  sendWhatsAppMessage,
  sendExpiryAlertWhatsApp,
};
