/**
 * emailService.js
 * ---------------
 * Thin wrapper around @emailjs/browser.
 * Both "welcome" and "password reset" emails use the same EmailJS
 * template (template_d1s8qbu).
 *
 * Template variables sent (match your EmailJS template exactly):
 *   to_name  – recipient's display name          → {{to_name}}
 *   to_email – used by EmailJS as recipient addr  → routing only
 *   email    – shown in the email footer          → {{email}}
 *   link     – password-reset URL                → {{link}}
 */

import emailjs from "@emailjs/browser";

const SERVICE_ID  = "default_service";           // EmailJS → Email Services → Service ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialise once so we don't need to pass the key on every send call
emailjs.init(PUBLIC_KEY);

/**
 * Send a welcome / account-created email.
 * @param {{ name: string, email: string }} user
 * @returns {Promise}
 */
export async function sendWelcomeEmail({ name, email }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name:  name,
    to_email: email,   // EmailJS uses this to address the email
    email:    email,   // {{email}} shown in template footer
    link:     "",      // not used for welcome emails
  });
}

/**
 * Send a password-reset email with a one-time link.
 * @param {{ name: string, email: string, resetLink: string }} params
 * @returns {Promise}
 */
export async function sendPasswordResetEmail({ name, email, resetLink }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name:  name,
    to_email: email,      // EmailJS uses this to address the email
    email:    email,      // {{email}} shown in template footer
    link:     resetLink,  // {{link}} used as the clickable reset URL
  });
}
