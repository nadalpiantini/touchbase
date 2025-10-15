<?php
declare(strict_types=1);

namespace TouchBase\Http;

/**
 * HTTP Request wrapper
 */
final class Request
{
    public string $method;
    public string $path;
    public array $get;
    public array $post;
    public array $body;
    public array $headers;
    public array $files;

    /**
     * Create Request from PHP superglobals
     *
     * @return self
     */
    public static function fromGlobals(): self
    {
        $request = new self();

        $request->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $request->path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $request->get = $_GET;
        $request->post = $_POST;
        $request->files = $_FILES;

        // Parse JSON body
        $rawBody = file_get_contents('php://input') ?: '[]';
        $request->body = json_decode($rawBody, true) ?: [];

        // Capture headers
        $request->headers = function_exists('getallheaders')
            ? getallheaders()
            : self::parseHeaders();

        return $request;
    }

    /**
     * Fallback header parser for environments without getallheaders()
     *
     * @return array<string, string>
     */
    private static function parseHeaders(): array
    {
        $headers = [];

        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headerKey = str_replace('_', '-', substr($key, 5));
                $headers[$headerKey] = $value;
            }
        }

        return $headers;
    }

    /**
     * Get request parameter from body, post, or get (in order of priority)
     *
     * @param string $key Parameter key
     * @param mixed $default Default value
     * @return mixed
     */
    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $this->post[$key] ?? $this->get[$key] ?? $default;
    }

    /**
     * Check if request is JSON
     *
     * @return bool
     */
    public function isJson(): bool
    {
        return str_contains($this->headers['Content-Type'] ?? '', 'application/json');
    }

    /**
     * Get authorization token from header
     *
     * @return string|null
     */
    public function bearerToken(): ?string
    {
        $auth = $this->headers['Authorization'] ?? '';

        if (preg_match('/Bearer\s+(.+)/i', $auth, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
