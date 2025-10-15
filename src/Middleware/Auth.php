<?php
declare(strict_types=1);

namespace TouchBase\Middleware;

use function TouchBase\__;

/**
 * Authentication middleware
 * Integrates with Chamilo's session management
 */
final class Auth
{
    /**
     * Require user to be logged in
     *
     * @return void Exits with 401 if not logged in
     */
    public static function requireLogin(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $user = $_SESSION['_user'] ?? null;

        if (!$user || empty($user['user_id'])) {
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

        // Check for development mock user first
        $mockUser = $_SESSION['_user'] ?? null;
        $isAdmin = !empty($_SESSION['is_platformAdmin']) || ($mockUser && $mockUser['role'] === 'admin');
        $isTeacher = !empty($_SESSION['is_courseTutor']) || !empty($_SESSION['is_courseCoach']) || ($mockUser && $mockUser['role'] === 'coach');

        $roleMap = [
            'admin' => $isAdmin,
            'coach' => $isTeacher || $isAdmin,
            'user' => true, // All logged-in users
        ];

        foreach ($roles as $role) {
            if (!empty($roleMap[$role])) {
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
     * Get current logged-in user ID
     *
     * @return int|null
     */
    public static function currentUserId(): ?int
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return isset($_SESSION['_user']['user_id'])
            ? (int) $_SESSION['_user']['user_id']
            : null;
    }

    /**
     * Get current user information
     *
     * @return array<string, mixed>|null
     */
    public static function currentUser(): ?array
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return $_SESSION['_user'] ?? null;
    }

    /**
     * Check if current user is admin
     *
     * @return bool
     */
    public static function isAdmin(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return !empty($_SESSION['is_platformAdmin']);
    }

    /**
     * Check if current user is coach/teacher
     *
     * @return bool
     */
    public static function isCoach(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return !empty($_SESSION['is_courseTutor']) || !empty($_SESSION['is_courseCoach']);
    }
}
