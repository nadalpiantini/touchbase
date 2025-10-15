<?php
declare(strict_types=1);

namespace TouchBase\Http;

/**
 * HTTP Response wrapper
 */
final class Response
{
    public int $status;
    public array $headers;
    public string $body;

    /**
     * Create a new Response
     *
     * @param string $body Response body
     * @param int $status HTTP status code
     * @param array<string, string> $headers Response headers
     */
    public function __construct(
        string $body = '',
        int $status = 200,
        array $headers = []
    ) {
        $this->body = $body;
        $this->status = $status;
        $this->headers = $headers + ['Content-Type' => 'text/html; charset=utf-8'];
    }

    /**
     * Create JSON response
     *
     * @param mixed $data Data to encode
     * @param int $status HTTP status code
     * @return self
     */
    public static function json(mixed $data, int $status = 200): self
    {
        return new self(
            json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $status,
            ['Content-Type' => 'application/json; charset=utf-8']
        );
    }

    /**
     * Create redirect response
     *
     * @param string $url Redirect URL
     * @param int $status HTTP status code (default 302)
     * @return self
     */
    public static function redirect(string $url, int $status = 302): self
    {
        return new self('', $status, ['Location' => $url]);
    }

    /**
     * Create error response
     *
     * @param string $message Error message
     * @param int $status HTTP status code
     * @return self
     */
    public static function error(string $message, int $status = 400): self
    {
        return self::json([
            'error' => true,
            'message' => $message,
            'status' => $status,
        ], $status);
    }

    /**
     * Send response to client
     */
    public function send(): void
    {
        http_response_code($this->status);

        foreach ($this->headers as $key => $value) {
            header("{$key}: {$value}");
        }

        echo $this->body;
    }
}
