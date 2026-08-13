<?php
/**
 * Contact form mail relay for the static site build.
 *
 * PHP-only on purpose: this deploys to a static host with no Node.js, so the
 * send step has to live server-side in something the host can execute
 * directly.
 *
 * Credentials are NOT in this file — they're never committed to git (this
 * repo is public). They live in mail-config.php, created once directly on
 * the server (see mail-config.example.php for the template) and excluded
 * from the deploy sync so it survives future "Pull or Deploy" runs.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method_not_allowed']);
    exit;
}

$configPath = __DIR__ . '/mail-config.php';
if (!file_exists($configPath)) {
    error_log('Contact form mail failed: mail-config.php missing');
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'not_configured']);
    exit;
}
require $configPath;

require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

$raw = json_decode(file_get_contents('php://input'), true);
$input = is_array($raw) ? $raw : $_POST;

// Honeypot: a field real visitors never see or fill. Bots that fill every
// input trip it; pretend success so they don't learn to skip it.
if (!empty($input['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name = trim((string) ($input['name'] ?? ''));
$company = trim((string) ($input['company'] ?? ''));
$email = trim((string) ($input['mail'] ?? ''));
$sector = trim((string) ($input['sector'] ?? ''));
$note = trim((string) ($input['note'] ?? ''));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'invalid_input']);
    exit;
}

$mailer = new PHPMailer(true);

try {
    $mailer->isSMTP();
    $mailer->Host = SMTP_HOST;
    $mailer->Port = SMTP_PORT;
    $mailer->SMTPAuth = true;
    $mailer->Username = SMTP_USER;
    $mailer->Password = SMTP_PASS;
    $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mailer->CharSet = 'UTF-8';

    $mailer->setFrom(SMTP_USER, 'SVS Güvenlik Web Sitesi');
    $mailer->addAddress(MAIL_TO);
    $mailer->addReplyTo($email, $name);

    $mailer->Subject = 'Yeni teklif talebi — ' . $name;
    $mailer->Body =
        "Ad Soyad: {$name}\n" .
        "Kurum: {$company}\n" .
        "E-posta: {$email}\n" .
        "İlgilendiği alan: {$sector}\n\n" .
        "Not:\n{$note}\n";

    $mailer->send();
    echo json_encode(['ok' => true]);
} catch (PHPMailerException $e) {
    error_log('Contact form mail failed: ' . $mailer->ErrorInfo);
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'send_failed']);
}
