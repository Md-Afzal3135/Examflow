/**
 * emailService.js
 * ---------------
 * Thin wrapper around @emailjs/browser.
 * Both "welcome" and "password reset" emails use the same EmailJS
 * template (template_d1s8qbu). The template variable `email_type`
 * lets the template render the appropriate subject / body copy.
 *
 * Template variables expected by template_d1s8qbu:
 *   to_name     – recipient's display name
 *   to_email    – recipient's email address
 *   email_type  – "welcome" | "password_reset"
 *   reset_link  – one-time reset URL  (only used when email_type === "password_reset")
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
    to_name:    name,
    to_email:   email,
    email_type: "welcome",
    reset_link: "",           // not used for welcome emails
  });
}

/**
 * Send a password-reset email with a one-time link.
 * @param {{ name: string, email: string, resetLink: string }} params
 * @returns {Promise}
 */
export async function sendPasswordResetEmail({ name, email, resetLink }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name:    name,
    to_email:   email,
    email_type: "password_reset",
    reset_link: resetLink,
  });
}
