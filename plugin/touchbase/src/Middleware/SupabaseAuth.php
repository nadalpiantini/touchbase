<?php
declare(strict_types=1);

namespace TouchBase\Middleware;

use TouchBase\SupabaseClient;
use function TouchBase\__;

/**
 * Supabase Authentication Middleware
 * Replaces Chamilo session-based auth with Supabase JWT auth
 */
final class SupabaseAuth
{
    private static ?SupabaseClient $client = null;
    private static ?array $currentUser = null;

    /**
     * Get Supabase client instance
     *
     * @return SupabaseClient
     */
    private static function client(): SupabaseClient
    {
        if (self::$client === null) {
            self::$client = new SupabaseClient();
        }
        return self::$client;
    }

    /**
     * Require user to be logged in
     * Checks for valid JWT token in Authorization header or session
     *
     * @return void Exits with 401 if not logged in
     */
    public static function requireLogin(): void
    {
        $user = self::currentUser();

        if (!$user || empty($user['id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => true,
                'message' => __('error.unauthorized'),
                'status' => 401,
            ]);
            exit;
        }
    }

    /**
     * Require user to have one of the specified roles
     *
     * @param array<string> $roles Allowed roles: 'admin', 'coach', 'user'
     * @return void Exits with 403 if role not allowed
     */
    public static function requireRole(array $roles): void
    {
        self::requireLogin();

        $user = self::currentUser();
        $userRole = $user['user_metadata']['role'] ?? 'user';

        // Check if user has any of the required roles
        $roleHierarchy = [
            'admin' => ['admin'],
            'coach' => ['coach', 'admin'],
            'user' => ['user', 'coach', 'admin'],
        ];

        foreach ($roles as $requiredRole) {
            $allowedRoles = $roleHierarchy[$requiredRole] ?? [$requiredRole];
            if (in_array($userRole, $allowedRoles)) {
                return; // User has required role
            }
        }

        // No matching role found
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => true,
            'message' => __('error.forbidden'),
            'status' => 403,
        ]);
        exit;
    }

    /**
     * Get current logged-in user
     * Parses JWT token from Authorization header or session
     *
     * @return array<string, mixed>|null User data or null if not authenticated
     */
    public static function currentUser(): ?array
    {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        // Try to get token from Authorization header
        $token = self::getTokenFromHeader();

        // If no header token, try session
        if (!$token) {
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $token = $_SESSION['supabase_access_token'] ?? null;
        }

        if (!$token) {
            return null;
        }

        // Verify and decode token
        $payload = self::client()->verifyToken($token);

        if (!$payload) {
            // Token invalid or expired
            self::clearSession();
            return null;
        }

        // Fetch full user data from Supabase
        try {
            $user = self::client()->getUser($token);
            self::$currentUser = $user;

            // Store in session for subsequent requests
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['supabase_access_token'] = $token;
            $_SESSION['supabase_user'] = $user;

            return $user;
        } catch (\Exception $e) {
            self::clearSession();
            return null;
        }
    }

    /**
     * Get current logged-in user ID
     *
     * @return string|null UUID of user or null
     */
    public static function currentUserId(): ?string
    {
        $user = self::currentUser();
        return $user['id'] ?? null;
    }

    /**
     * Sign in user with email and password
     *
     * @param string $email User email
     * @param string $password User password
     * @return array<string, mixed> Session data with user and tokens
     * @throws \Exception On authentication failure
     */
    public static function signIn(string $email, string $password): array
    {
        $response = self::client()->signIn($email, $password);

        // Store in session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['supabase_access_token'] = $response['access_token'];
        $_SESSION['supabase_refresh_token'] = $response['refresh_token'] ?? null;
        $_SESSION['supabase_user'] = $response['user'];

        self::$currentUser = $response['user'];

        return $response;
    }

    /**
     * Sign up new user
     *
     * @param string $email User email
     * @param string $password User password
     * @param array<string, mixed> $metadata User metadata (role, name, etc.)
     * @return array<string, mixed> User data
     * @throws \Exception On signup failure
     */
    public static function signUp(string $email, string $password, array $metadata = []): array
    {
        return self::client()->signUp($email, $password, $metadata);
    }

    /**
     * Sign out current user
     *
     * @return bool Success
     */
    public static function signOut(): bool
    {
        $success = self::client()->signOut();
        self::clearSession();
        return $success;
    }

    /**
     * Check if current user is admin
     *
     * @return bool
     */
    public static function isAdmin(): bool
    {
        $user = self::currentUser();
        if (!$user) {
            return false;
        }

        $role = $user['user_metadata']['role'] ?? 'user';
        return $role === 'admin';
    }

    /**
     * Check if current user is coach/teacher
     *
     * @return bool
     */
    public static function isCoach(): bool
    {
        $user = self::currentUser();
        if (!$user) {
            return false;
        }

        $role = $user['user_metadata']['role'] ?? 'user';
        return in_array($role, ['coach', 'admin']);
    }

    /**
     * Get JWT token from Authorization header
     *
     * @return string|null Token or null if not present
     */
    private static function getTokenFromHeader(): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        return substr($authHeader, 7); // Remove "Bearer " prefix
    }

    /**
     * Clear authentication session
     */
    private static function clearSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        unset($_SESSION['supabase_access_token']);
        unset($_SESSION['supabase_refresh_token']);
        unset($_SESSION['supabase_user']);

        self::$currentUser = null;
    }

    /**
     * Refresh access token using refresh token
     *
     * @return bool Success
     */
    public static function refreshToken(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $refreshToken = $_SESSION['supabase_refresh_token'] ?? null;

        if (!$refreshToken) {
            return false;
        }

        try {
            $response = self::client()->refreshSession($refreshToken);

            $_SESSION['supabase_access_token'] = $response['access_token'];
            $_SESSION['supabase_refresh_token'] = $response['refresh_token'] ?? $refreshToken;
            $_SESSION['supabase_user'] = $response['user'];

            self::$currentUser = $response['user'];

            return true;
        } catch (\Exception $e) {
            self::clearSession();
            return false;
        }
    }
}
