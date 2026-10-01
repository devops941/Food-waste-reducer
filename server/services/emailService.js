import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('[Email Service] SMTP credentials not set in .env. Email dispatch will be simulated in logs.');
    return null;
  }

  // Create transporter with explicit Gmail / SMTP options
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // strip any inadvertent spaces in app passwords
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendExpiryReminderEmail = async ({ to, userName, expiringItems = [] }) => {
  if (!to || expiringItems.length === 0) return;

  const mailer = getTransporter();
  const from = process.env.SMTP_FROM || '"Pantry Fresh" <no-reply@pantryfresh.app>';
  const liveUrl = (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'))
    ? process.env.CLIENT_URL.replace(/\/+$/, '')
    : 'https://food-waste-reducer-1w7j.vercel.app';
  const targetLink = `${liveUrl}/recipes`;
  console.log(`[Email Service] reminder link target: ${targetLink}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysLeft = (item) => {
    if (typeof item.daysRemaining === 'number') return item.daysRemaining;
    if (item.expiryDate) {
      const target = new Date(item.expiryDate);
      target.setHours(0, 0, 0, 0);
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const itemRows = expiringItems
    .map(
      (item) => {
        const days = getDaysLeft(item);
        return `
        <tr style="border-bottom: 1px solid #E2E8E2;">
          <td style="padding: 10px 0; font-weight: 600; color: #1F2A24;">${item.name}</td>
          <td style="padding: 10px 0; color: #6B7A70;">${item.quantity || '1 item'}</td>
          <td style="padding: 10px 0; text-align: right; color: ${days <= 0 ? '#C9503F' : '#E0A030'}; font-weight: 600;">
            ${days <= 0 ? 'Expires today' : `${days} days left`}
          </td>
        </tr>`;
      }
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #FAF7F0; padding: 24px; border-radius: 16px;">
      <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #E2E8E2;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="font-size: 20px;">🌱</span>
          <span style="font-size: 18px; font-weight: bold; color: #1F2A24;">Pantry Fresh</span>
        </div>
        
        <h2 style="color: #1F2A24; font-size: 20px; margin-top: 0;">Hi ${userName || 'there'}, use these before they spoil!</h2>
        <p style="color: #6B7A70; font-size: 14px; line-height: 1.5;">
          You have <strong>${expiringItems.length}</strong> items in your pantry that will expire in the next couple of days:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #E2E8E2; text-align: left; color: #6B7A70;">
              <th style="padding-bottom: 8px;">Item</th>
              <th style="padding-bottom: 8px;">Quantity</th>
              <th style="padding-bottom: 8px; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="${targetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #4F7A4A; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Find Recipes for These Items →
          </a>
        </div>

        <div style="margin-top: 16px; text-align: center;">
          <p style="font-size: 12px; color: #6B7A70; margin-bottom: 4px;">Direct Link:</p>
          <a href="${targetLink}" target="_blank" rel="noopener noreferrer" style="font-size: 13px; color: #4F7A4A; word-break: break-all;">
            ${targetLink}
          </a>
        </div>
      </div>
      
      <p style="text-align: center; color: #9EABA3; font-size: 12px; margin-top: 16px;">
        Mindful cooking & zero food waste with Pantry Fresh.
      </p>
    </div>
  `;

  if (!mailer) {
    console.log(`[Email Simulation] Expiry reminder email prepared for: ${to} (${expiringItems.length} items)`);
    return { simulated: true, to, count: expiringItems.length };
  }

  try {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const info = await mailer.sendMail({
      from,
      to,
      subject: `🌱 ${expiringItems.length} items expiring soon [${timestamp}] — Pantry Fresh`,
      html,
    });
    console.log(`[Email Service] Sent expiry email to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email Service Error] Failed to send expiry email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

export const sendTestEmail = async ({ to, userName }) => {
  if (!to) {
    return { success: false, error: 'Recipient email is required' };
  }

  const mailer = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || '"Pantry Fresh" <no-reply@pantryfresh.app>';
  const liveUrl = (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost'))
    ? process.env.CLIENT_URL.replace(/\/+$/, '')
    : 'https://food-waste-reducer-1w7j.vercel.app';
  const targetLink = `${liveUrl}/dashboard`;
  console.log(`[Email Service] test email link target: ${targetLink}`);

  if (!mailer) {
    return {
      success: false,
      error: 'SMTP credentials (SMTP_USER / SMTP_PASS) not configured in server .env file.',
    };
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #FAF7F0; padding: 24px; border-radius: 16px;">
      <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #E2E8E2;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="font-size: 24px;">🌱</span>
          <span style="font-size: 20px; font-weight: bold; color: #1F2A24;">Pantry Fresh</span>
        </div>
        
        <h2 style="color: #1F2A24; font-size: 20px; margin-top: 0;">Email Alerts Verified! ✨</h2>
        <p style="color: #6B7A70; font-size: 14px; line-height: 1.6;">
          Hello <strong>${userName || 'Pantry Fresh User'}</strong>,<br/><br/>
          This is a fresh test notification confirming that your daily zero-waste expiry alert email system is configured and working on the live production app.
        </p>

        <div style="background: #F4F7F4; border-left: 4px solid #4F7A4A; padding: 12px 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #2E4B2A; font-size: 13px; font-weight: 500;">
            ✅ Daily morning expiry checks will alert you before your food spoils.
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="${targetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #4F7A4A; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Open Pantry Dashboard →
          </a>
        </div>

        <div style="margin-top: 16px; text-align: center;">
          <p style="font-size: 12px; color: #6B7A70; margin-bottom: 4px;">Direct Link:</p>
          <a href="${targetLink}" target="_blank" rel="noopener noreferrer" style="font-size: 13px; color: #4F7A4A; word-break: break-all;">
            ${targetLink}
          </a>
        </div>
      </div>
      
      <p style="text-align: center; color: #9EABA3; font-size: 12px; margin-top: 16px;">
        Pantry Fresh • AI-Powered Zero-Waste Kitchen Assistant
      </p>
    </div>
  `;

  try {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const info = await mailer.sendMail({
      from,
      to,
      subject: `🌱 Pantry Fresh Live Alert [${timestamp}] — Open Dashboard`,
      html,
    });
    console.log(`[Email Service] Sent test email to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send test email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendExpiryReminderEmail,
  sendTestEmail,
};
