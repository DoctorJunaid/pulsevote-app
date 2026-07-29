// ==================== MAILER UTILITY (mailer.js) ====================
// Configures Nodemailer transport with anti-spam best practices,
// high-deliverability MIME headers, dual HTML/Plaintext body support,
// and matching PulseVote design system branding.

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.MAIL_PASS,
  },
});

const APP_NAME = "PulseVote";
const SENDER_EMAIL = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@pulsevote.com";
const FROM_HEADER = `"${APP_NAME}" <${SENDER_EMAIL}>`;

/**
 * Builds email-safe HTML & Plaintext templates matching PulseVote UI aesthetic
 */
const buildPulseVoteEmail = ({ title, preheader, bodyText, otp, actionType = "verification" }) => {
  const isReset = actionType === "reset";
  const badgeText = isReset ? "Password Reset" : "Account Verification";
  const badgeColor = isReset ? "#E11D48" : "#FF5238";
  const badgeBg = isReset ? "rgba(225, 29, 72, 0.08)" : "rgba(255, 82, 56, 0.08)";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F2EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Hidden Preheader for Inbox Snippet -->
  <div style="display:none;font-size:1px;color:#F4F2EE;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F4F2EE;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#FFFFFF;border-radius:24px;border:1px solid rgba(0,0,0,0.08);box-shadow:0 12px 32px rgba(0,0,0,0.05);overflow:hidden;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding:28px 32px 20px;background-color:#FFFFFF;border-bottom:1px solid rgba(0,0,0,0.06);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" valign="middle">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="width:36px;height:36px;background-color:#111111;border-radius:10px;text-align:center;vertical-align:middle;">
                          <span style="color:#FFFFFF;font-size:18px;font-weight:bold;line-height:36px;">⚡</span>
                        </td>
                        <td style="padding-left:12px;font-size:22px;font-weight:800;color:#111111;letter-spacing:-0.05em;">
                          PulseVote.
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:6px 14px;background-color:${badgeBg};color:${badgeColor};border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.02em;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#111111;letter-spacing:-0.04em;line-height:1.2;">
                ${title}
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4D4A45;font-weight:500;">
                ${bodyText}
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background-color:#F9F8F6;border:2px dashed ${badgeColor};border-radius:16px;text-align:center;">
                <tr>
                  <td style="padding:24px 16px;">
                    <div style="font-size:12px;font-weight:700;color:#757169;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                      Your Verification Code
                    </div>
                    <div style="font-size:36px;font-weight:800;color:#111111;letter-spacing:10px;font-family:'Courier New',Consolas,Monaco,monospace;margin-left:10px;">
                      ${otp}
                    </div>
                    <div style="font-size:13px;font-weight:600;color:${badgeColor};margin-top:10px;">
                      ⏱️ Expires in 10 minutes
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Anti-Phishing & Security Callout -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F4F2EE;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;line-height:1.5;color:#757169;font-weight:500;">
                    🔒 <strong>Security Tip:</strong> PulseVote staff will never ask for your verification code. Do not share this code with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#FAF9F6;border-top:1px solid rgba(0,0,0,0.06);text-align:center;font-size:13px;color:#757169;line-height:1.5;">
              <p style="margin:0 0 6px;">If you did not request this email, please ignore it or secure your account.</p>
              <p style="margin:0;font-weight:600;color:#111111;">&copy; ${new Date().getFullYear()} PulseVote. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `
PulseVote - ${title}

${bodyText}

YOUR VERIFICATION CODE: ${otp}
(Valid for 10 minutes)

Security Notice: PulseVote will never ask for your code. If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} PulseVote. All rights reserved.
  `.trim();

  return { html, text };
};

/**
 * Helper: Sends account registration / resend OTP verification email
 */
export const sendVerificationOtpEmail = async (to, otp) => {
  const title = "Verify your account.";
  const preheader = `Your PulseVote verification code is ${otp}. Expires in 10 minutes.`;
  const bodyText = "Welcome to PulseVote! Please enter the 6-digit verification code below to complete your account registration:";

  const { html, text } = buildPulseVoteEmail({
    title,
    preheader,
    bodyText,
    otp,
    actionType: "verification"
  });

  return transporter.sendMail({
    from: FROM_HEADER,
    to,
    subject: `${otp} is your PulseVote verification code`,
    text,
    html,
    headers: {
      "X-Entity-Ref-ID": `pulsevote-verify-${Date.now()}`
    }
  });
};

/**
 * Helper: Sends password recovery / reset OTP email
 */
export const sendPasswordResetOtpEmail = async (to, otp) => {
  const title = "Reset your password.";
  const preheader = `Your PulseVote password reset code is ${otp}. Expires in 10 minutes.`;
  const bodyText = "We received a request to reset your PulseVote account password. Enter the 6-digit security code below to proceed:";

  const { html, text } = buildPulseVoteEmail({
    title,
    preheader,
    bodyText,
    otp,
    actionType: "reset"
  });

  return transporter.sendMail({
    from: FROM_HEADER,
    to,
    subject: `${otp} is your PulseVote password reset code`,
    text,
    html,
    headers: {
      "X-Entity-Ref-ID": `pulsevote-reset-${Date.now()}`
    }
  });
};

/**
 * Legacy / Generic dispatchers for backwards compatibility
 */
export const sendOtpMail = async (to, otp, reason = "verify your account") => {
  try {
    const isReset = reason.toLowerCase().includes("reset") || reason.toLowerCase().includes("password");
    const info = isReset 
      ? await sendPasswordResetOtpEmail(to, otp)
      : await sendVerificationOtpEmail(to, otp);

    console.log("Email sent successfully:", info?.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendOtpEmail = async (to, subject, text) => {
  try {
    // Extract 6-digit numeric OTP code if present in string
    const match = String(text).match(/\b\d{6}\b/);
    const otp = match ? match[0] : text;

    const isReset = String(subject).toLowerCase().includes("reset") || 
                    String(subject).toLowerCase().includes("password") ||
                    String(text).toLowerCase().includes("reset");

    const info = isReset 
      ? await sendPasswordResetOtpEmail(to, otp)
      : await sendVerificationOtpEmail(to, otp);

    console.log("Email sent successfully:", info?.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default transporter;