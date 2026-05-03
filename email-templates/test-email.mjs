/**
 * test-email.mjs
 * ─────────────────────────────────────────────────────────────
 * Sends a real test email via the EmailJS REST API.
 * No browser needed — just run:
 *
 *   node email-templates/test-email.mjs your@email.com [welcome|reset]
 *
 * Examples:
 *   node email-templates/test-email.mjs ajmal@example.com welcome
 *   node email-templates/test-email.mjs ajmal@example.com reset
 */

const SERVICE_ID  = "default_service";
const TEMPLATE_ID = "template_d1s8qbu";
const PUBLIC_KEY  = "dWem2aMiE4bJm8Lnj";
const PRIVATE_KEY = "uvUC-HRKuOI4pZiBt10ff";

const toEmail = process.argv[2];
const type    = process.argv[3] || "reset";   // "welcome" | "reset"

if (!toEmail) {
  console.error("Usage: node test-email.mjs <your@email.com> [welcome|reset]");
  process.exit(1);
}

const name = toEmail.split("@")[0];

// ── Build template params based on type ──────────────────────
const params =
  type === "welcome"
    ? {
        to_name:        name,
        to_email:       toEmail,
        email:          toEmail,
        link:           "https://examflow.vercel.app/login",
        email_title:    "Welcome to ExamFlow! 🎉",
        email_subtitle: "Your student account is ready",
        icon:           "🎓",
        body_text:
          "We're excited to have you on board! Your ExamFlow account has been created " +
          "successfully. You can now log in and start exploring available exams.",
        cta_label:  "Go to Dashboard →",
        extra_info:
          "💡 Tip: Browse the exam list on your dashboard and attempt any active exam. " +
          "Your results will be available immediately after submission.",
        sign_off: "Happy learning,",
      }
    : {
        to_name:        name,
        to_email:       toEmail,
        email:          toEmail,
        link:           "https://examflow.vercel.app/reset-password?token=TEST_TOKEN_123",
        email_title:    "Password Reset Request",
        email_subtitle: "We received a request to reset your password",
        icon:           "🔐",
        body_text:
          "Someone requested a password reset for your ExamFlow account. " +
          "Click the button below to choose a new password. " +
          "This link is valid for 1 hour.",
        cta_label:  "Reset My Password",
        extra_info:
          "⚠️ Didn't request this? If you didn't ask for a password reset, you can " +
          "safely ignore this email. Your account remains secure.",
        sign_off: "Best regards,",
      };

// ── Send via EmailJS REST API ────────────────────────────────
console.log(`\n📧 Sending "${type}" test email to ${toEmail} …\n`);

const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
  method:  "POST",
  headers: { "Content-Type": "application/json" },
  body:    JSON.stringify({
    service_id:      SERVICE_ID,
    template_id:     TEMPLATE_ID,
    user_id:         PUBLIC_KEY,
    accessToken:     PRIVATE_KEY,
    template_params: params,
  }),
});

if (res.ok) {
  console.log("✅ Email sent successfully! Check your inbox.");
} else {
  const body = await res.text();
  console.error(`❌ Failed (HTTP ${res.status}): ${body}`);
}
