<?php
declare(strict_types=1);

namespace TouchBase;

/**
 * Supabase API Client
 * Wrapper for Supabase REST API and Auth
 */
final class SupabaseClient
{
    private string $url;
    private string $anonKey;
    private string $serviceKey;
    private ?string $accessToken = null;

    public function __construct()
    {
        $this->url = SUPABASE_URL;
        $this->anonKey = SUPABASE_ANON_KEY;
        $this->serviceKey = SUPABASE_SERVICE_KEY;
    }

    /**
     * Sign in with email and password
     *
     * @param string $email User email
     * @param string $password User password
     * @return array<string, mixed> Auth response with user and session
     * @throws \Exception
     */
    public function signIn(string $email, string $password): array
    {
        $response = $this->request('POST', '/auth/v1/token?grant_type=password', [
            'email' => $email,
            'password' => $password,
        ], $this->anonKey);

        if (!empty($response['access_token'])) {
            $this->accessToken = $response['access_token'];
        }

        return $response;
    }

    /**
     * Sign up with email and password
     *
     * @param string $email User email
     * @param string $password User password
     * @param array<string, mixed> $metadata Additional user metadata
     * @return array<string, mixed> Auth response
     * @throws \Exception
     */
    public function signUp(string $email, string $password, array $metadata = []): array
    {
        return $this->request('POST', '/auth/v1/signup', [
            'email' => $email,
            'password' => $password,
            'data' => $metadata,
        ], $this->anonKey);
    }

    /**
     * Sign out current user
     *
     * @return bool Success
     */
    public function signOut(): bool
    {
        if (!$this->accessToken) {
            return false;
        }

        try {
            $this->request('POST', '/auth/v1/logout', [], $this->accessToken);
            $this->accessToken = null;
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get current user from access token
     *
     * @param string $token Access token
     * @return array<string, mixed>|null User data or null if invalid
     */
    public function getUser(string $token): ?array
    {
        try {
            $response = $this->request('GET', '/auth/v1/user', [], $token);
            return $response;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Verify and decode JWT token
     *
     * @param string $token JWT token
     * @return array<string, mixed>|null Decoded payload or null if invalid
     */
    public function verifyToken(string $token): ?array
    {
        try {
            // Split JWT
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return null;
            }

            // Decode payload (middle part)
            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return null; // Token expired
            }

            return $payload;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Refresh access token
     *
     * @param string $refreshToken Refresh token
     * @return array<string, mixed> New session with access_token
     * @throws \Exception
     */
    public function refreshSession(string $refreshToken): array
    {
        $response = $this->request('POST', '/auth/v1/token?grant_type=refresh_token', [
            'refresh_token' => $refreshToken,
        ], $this->anonKey);

        if (!empty($response['access_token'])) {
            $this->accessToken = $response['access_token'];
        }

        return $response;
    }

    /**
     * Make HTTP request to Supabase API
     *
     * @param string $method HTTP method (GET, POST, etc.)
     * @param string $path API path
     * @param array<string, mixed> $data Request payload
     * @param string $apiKey API key (anon, service, or access token)
     * @return array<string, mixed> Response data
     * @throws \Exception On request failure
     */
    private function request(
        string $method,
        string $path,
        array $data = [],
        string $apiKey = ''
    ): array {
        $url = $this->url . $path;
        $headers = [
            'Content-Type: application/json',
            'apikey: ' . ($apiKey ?: $this->anonKey),
        ];

        if ($apiKey && str_starts_with($apiKey, 'ey')) {
            // This is a JWT token, use as Authorization Bearer
            $headers[] = 'Authorization: Bearer ' . $apiKey;
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        if ($method !== 'GET' && !empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception('Supabase request failed: ' . $error);
        }

        $responseData = json_decode($response ?: '{}', true);

        if ($httpCode >= 400) {
            throw new \Exception(
                $responseData['message'] ?? $responseData['error_description'] ?? 'Unknown error',
                $httpCode
            );
        }

        return $responseData;
    }

    /**
     * Set access token manually (e.g., from session)
     *
     * @param string|null $token Access token
     */
    public function setAccessToken(?string $token): void
    {
        $this->accessToken = $token;
    }

    /**
     * Get current access token
     *
     * @return string|null
     */
    public function getAccessToken(): ?string
    {
        return $this->accessToken;
    }
}
