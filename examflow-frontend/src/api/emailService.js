/**
 * emailService.js
 * ---------------
 * Thin wrapper around @emailjs/browser.
 *
 * A SINGLE EmailJS template (template_d1s8qbu) handles both email types.
 * The layout is fixed; only these content variables change per call:
 *
 *   to_name       – recipient's display name
 *   to_email      – EmailJS routing (recipient address)
 *   email         – {{email}}  shown in footer
 *   link          – {{link}}   CTA href + fallback URL
 *   email_title   – {{email_title}}   main heading
 *   email_subtitle– {{email_subtitle}} sub-heading
 *   icon          – {{icon}}   emoji in the circular badge
 *   body_text     – {{body_text}} paragraph body copy
 *   cta_label     – {{cta_label}} button text
 *   extra_info    – {{extra_info}} yellow info box content
 *   sign_off      – {{sign_off}} closing line
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;   // e.g. service_xxxxxxx
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;  // e.g. template_xxxxxxx
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;   // Public Key from EmailJS

// Validate env vars at startup so missing keys are obvious in the console
if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
  console.error(
    "[EmailJS] Missing env vars:",
    { SERVICE_ID: !!SERVICE_ID, TEMPLATE_ID: !!TEMPLATE_ID, PUBLIC_KEY: !!PUBLIC_KEY },
    "\nCheck your .env file for VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY"
  );
}

emailjs.init({ publicKey: PUBLIC_KEY });

// ── Welcome email ─────────────────────────────────────────────
export async function sendWelcomeEmail({ name, email }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name:        name,
    to_email:       email,
    email,
    link:           "https://examflow.vercel.app/login",
    email_title:    "Welcome to ExamFlow! 🎉",
    email_subtitle: "Your student account is ready",
    icon:           "🎓",
    body_text:
      "We're excited to have you on board! Your ExamFlow account has been created " +
      "successfully. You can now log in and start exploring available exams, track " +
      "your scores, and monitor your progress.",
    cta_label:  "Go to Dashboard →",
    extra_info:
      "💡 Tip: Browse the exam list on your dashboard and attempt any active exam. " +
      "Your results will be available immediately after submission.",
    sign_off: "Happy learning,",
  });
}

// ── Password-reset email ──────────────────────────────────────
export async function sendPasswordResetEmail({ name, email, resetLink }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name:        name,
    to_email:       email,
    email,
    link:           resetLink,
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
  });
}

// ── Email verification email ──────────────────────────────────
export async function sendVerificationEmail({ name, email, verifyLink }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name:        name,
    to_email:       email,
    email,
    link:           verifyLink,
    email_title:    "Verify Your Email Address ✉️",
    email_subtitle: "One quick step to activate your account",
    icon:           "✅",
    body_text:
      "Thanks for signing up for ExamFlow! Please verify your email address " +
      "by clicking the button below. This link is valid for 24 hours.",
    cta_label:  "Verify My Email",
    extra_info:
      "💡 If you didn't create an ExamFlow account, you can safely ignore this email.",
    sign_off: "Welcome aboard,",
  });
}
