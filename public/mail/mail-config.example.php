<?php
/**
 * Copy this file to mail-config.php on the server (cPanel File Manager,
 * inside public_html/mail/) and fill in the real values there. Never commit
 * mail-config.php — it's gitignored on purpose, and this repo is public.
 */

const SMTP_HOST = 'mail.mailc2b.com';
const SMTP_PORT = 587; // unencrypted — this host rejects STARTTLS (confirmed live)
const SMTP_USER = 'info@svsguvenlik.com.tr';
const SMTP_PASS = 'REPLACE_ME';
const MAIL_TO = 'info@svsguvenlik.com.tr';
