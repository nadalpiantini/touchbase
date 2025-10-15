<?php
declare(strict_types=1);

namespace TouchBase\Utils;

use TouchBase\Config;

/**
 * Simple SMTP mailer for TouchBase notifications
 * Supports basic SMTP authentication with minimal dependencies
 */
final class Mailer
{
    private string $host;
    private int $port;
    private string $from;
    private ?string $username;
    private ?string $password;
    private bool $useTLS;

    public function __construct(?array $config = null)
    {
        $this->host = $config['host'] ?? Config::env('SMTP_HOST', 'localhost');
        $this->port = (int)($config['port'] ?? Config::env('SMTP_PORT', '25'));
        $this->from = $config['from'] ?? Config::env('SMTP_FROM', 'noreply@touchbase.local');
        $this->username = $config['username'] ?? Config::env('SMTP_USERNAME');
        $this->password = $config['password'] ?? Config::env('SMTP_PASSWORD');
        $this->useTLS = (bool)($config['use_tls'] ?? Config::env('SMTP_USE_TLS', '0'));
    }

    /**
     * Send email to one or more recipients
     *
     * @param string|array $to Single email or array of emails
     * @param string $subject Email subject
     * @param string $body Email body (plain text or HTML)
     * @param array $options Additional options (cc, bcc, is_html, headers)
     * @return bool Success status
     */
    public function send(string|array $to, string $subject, string $body, array $options = []): bool
    {
        $recipients = is_array($to) ? $to : [$to];
        $isHtml = $options['is_html'] ?? false;
        $cc = $options['cc'] ?? [];
        $bcc = $options['bcc'] ?? [];
        $customHeaders = $options['headers'] ?? [];

        // Build headers
        $headers = [
            'From: ' . $this->from,
            'Reply-To: ' . $this->from,
            'X-Mailer: TouchBase-Mailer/1.0',
            'MIME-Version: 1.0',
        ];

        if ($isHtml) {
            $headers[] = 'Content-Type: text/html; charset=UTF-8';
        } else {
            $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        }

        if (!empty($cc)) {
            $headers[] = 'Cc: ' . implode(', ', $cc);
        }

        if (!empty($bcc)) {
            $headers[] = 'Bcc: ' . implode(', ', $bcc);
        }

        foreach ($customHeaders as $key => $value) {
            $headers[] = "$key: $value";
        }

        // Try PHP mail() first for simple environments
        if ($this->port === 25 && empty($this->username) && empty($this->password)) {
            foreach ($recipients as $email) {
                $success = mail($email, $subject, $body, implode("\r\n", $headers));
                if (!$success) {
                    error_log("TouchBase Mailer: Failed to send email to $email");
                    return false;
                }
            }
            return true;
        }

        // Use SMTP with authentication
        return $this->sendViaSMTP($recipients, $subject, $body, $headers);
    }

    /**
     * Send email via raw SMTP socket connection
     * Minimal SMTP client implementation for compatibility
     */
    private function sendViaSMTP(array $recipients, string $subject, string $body, array $headers): bool
    {
        $socket = @fsockopen($this->host, $this->port, $errno, $errstr, 10);

        if (!$socket) {
            error_log("TouchBase Mailer: SMTP connection failed: $errstr ($errno)");
            return false;
        }

        // Read server greeting
        fgets($socket, 512);

        // EHLO
        fputs($socket, "EHLO " . gethostname() . "\r\n");
        fgets($socket, 512);

        // STARTTLS if needed
        if ($this->useTLS) {
            fputs($socket, "STARTTLS\r\n");
            fgets($socket, 512);
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

            // EHLO again after TLS
            fputs($socket, "EHLO " . gethostname() . "\r\n");
            fgets($socket, 512);
        }

        // AUTH LOGIN if credentials provided
        if ($this->username && $this->password) {
            fputs($socket, "AUTH LOGIN\r\n");
            fgets($socket, 512);
            fputs($socket, base64_encode($this->username) . "\r\n");
            fgets($socket, 512);
            fputs($socket, base64_encode($this->password) . "\r\n");
            $authResponse = fgets($socket, 512);

            if (substr($authResponse, 0, 3) !== '235') {
                error_log("TouchBase Mailer: SMTP authentication failed");
                fclose($socket);
                return false;
            }
        }

        // MAIL FROM
        fputs($socket, "MAIL FROM: <" . $this->extractEmail($this->from) . ">\r\n");
        fgets($socket, 512);

        // RCPT TO (for each recipient)
        foreach ($recipients as $email) {
            fputs($socket, "RCPT TO: <$email>\r\n");
            fgets($socket, 512);
        }

        // DATA
        fputs($socket, "DATA\r\n");
        fgets($socket, 512);

        // Headers
        foreach ($headers as $header) {
            fputs($socket, "$header\r\n");
        }

        fputs($socket, "Subject: $subject\r\n");
        fputs($socket, "To: " . implode(', ', $recipients) . "\r\n");
        fputs($socket, "\r\n");

        // Body
        fputs($socket, $body . "\r\n");
        fputs($socket, ".\r\n");

        $dataResponse = fgets($socket, 512);

        // QUIT
        fputs($socket, "QUIT\r\n");
        fclose($socket);

        if (substr($dataResponse, 0, 3) !== '250') {
            error_log("TouchBase Mailer: SMTP DATA command failed: $dataResponse");
            return false;
        }

        return true;
    }

    /**
     * Extract email address from "Name <email@domain.com>" format
     */
    private function extractEmail(string $from): string
    {
        if (preg_match('/<(.+?)>/', $from, $matches)) {
            return $matches[1];
        }
        return $from;
    }

    /**
     * Validate email address format
     */
    public static function isValidEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Batch send to multiple recipients (queued via email_queue table)
     * Returns array of [success_count, failure_count]
     */
    public function sendBatch(array $emails, string $subject, string $body, array $options = []): array
    {
        $successCount = 0;
        $failureCount = 0;

        foreach ($emails as $email) {
            if (!self::isValidEmail($email)) {
                $failureCount++;
                continue;
            }

            $success = $this->send($email, $subject, $body, $options);

            if ($success) {
                $successCount++;
            } else {
                $failureCount++;
            }

            // Rate limiting: small delay between emails
            usleep(100000); // 100ms
        }

        return [$successCount, $failureCount];
    }
}
