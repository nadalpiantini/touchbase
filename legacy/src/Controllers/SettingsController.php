<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\Utils\Tenant;

use function TouchBase\view;
use function TouchBase\__;

/**
 * Settings Controller - Tenant branding configuration
 * Allows admins to configure logo, colors, theme, and tenant identity
 */
final class SettingsController
{
    /**
     * Display settings page
     */
    public static function page(Request $request): Response
    {
        \TouchBase\Middleware\Auth::requireRole(['admin']);

        $tenant = Tenant::current();

        return new Response(view('settings', [
            'tenant' => $tenant,
        ]));
    }

    /**
     * Save branding settings
     */
    public static function save(Request $request): Response
    {
        \TouchBase\Middleware\Auth::requireRole(['admin']);

        $code = $request->input('code', 'DEFAULT');
        $name = $request->input('name', '');
        $theme = $request->input('theme', 'dark');
        $color1 = $request->input('color1', '#0284c7');
        $color2 = $request->input('color2', '#16a34a');
        $color3 = $request->input('color3', '#ea580c');
        $color4 = $request->input('color4', '#dc2626');

        // Validate
        if (empty($name)) {
            return Response::json(['error' => __('settings.name_required')], 400);
        }

        if (!in_array($theme, ['dark', 'light'])) {
            return Response::json(['error' => __('settings.invalid_theme')], 400);
        }

        // Validate hex colors
        foreach ([$color1, $color2, $color3, $color4] as $color) {
            if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
                return Response::json(['error' => __('settings.invalid_color')], 400);
            }
        }

        // Handle logo upload
        $logoUrl = null;

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');

            // Validate file type
            $allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
            if (!in_array($file['type'], $allowedTypes)) {
                return Response::json(['error' => __('settings.invalid_logo_type')], 400);
            }

            // Validate file size (max 2MB)
            if ($file['size'] > 2 * 1024 * 1024) {
                return Response::json(['error' => __('settings.logo_too_large')], 400);
            }

            // Move uploaded file
            $uploadsDir = dirname(__DIR__, 2) . '/public/uploads';
            if (!is_dir($uploadsDir)) {
                mkdir($uploadsDir, 0755, true);
            }

            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = 'logo_' . time() . '.' . $extension;
            $destination = $uploadsDir . '/' . $filename;

            if (move_uploaded_file($file['tmp_name'], $destination)) {
                $logoUrl = '/touchbase/uploads/' . $filename;
            }
        }

        // Check if logo URL provided instead of upload
        if (!$logoUrl && $request->input('logo_url')) {
            $logoUrl = $request->input('logo_url');
        }

        // Save to database
        $pdo = Database::pdo();

        // Check if tenant exists
        $stmt = $pdo->prepare('SELECT id FROM touchbase_tenants WHERE code = ?');
        $stmt->execute([$code]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update
            $sql = 'UPDATE touchbase_tenants SET name = ?, theme = ?, color1 = ?, color2 = ?, color3 = ?, color4 = ?';
            $params = [$name, $theme, $color1, $color2, $color3, $color4];

            if ($logoUrl) {
                $sql .= ', logo_url = ?';
                $params[] = $logoUrl;
            }

            $sql .= ' WHERE code = ?';
            $params[] = $code;

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            // Insert
            $stmt = $pdo->prepare('
                INSERT INTO touchbase_tenants (code, name, logo_url, color1, color2, color3, color4, theme)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([$code, $name, $logoUrl, $color1, $color2, $color3, $color4, $theme]);
        }

        // Return success with redirect
        if ($request->isJson()) {
            return Response::json([
                'success' => true,
                'message' => __('settings.saved_successfully'),
            ]);
        }

        // HTML form submission - redirect back to settings page
        $_SESSION['flash_message'] = __('settings.saved_successfully');
        return Response::redirect(BASE_PATH . '/settings');
    }

    /**
     * Upload logo API endpoint
     */
    public static function uploadLogo(Request $request): Response
    {
        \TouchBase\Middleware\Auth::requireRole(['admin']);

        if (!$request->hasFile('logo')) {
            return Response::json(['error' => __('settings.no_file_uploaded')], 400);
        }

        $file = $request->file('logo');

        // Validate
        $allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (!in_array($file['type'], $allowedTypes)) {
            return Response::json(['error' => __('settings.invalid_logo_type')], 400);
        }

        if ($file['size'] > 2 * 1024 * 1024) {
            return Response::json(['error' => __('settings.logo_too_large')], 400);
        }

        // Save file
        $uploadsDir = dirname(__DIR__, 2) . '/public/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'logo_' . time() . '.' . $extension;
        $destination = $uploadsDir . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return Response::json(['error' => __('settings.upload_failed')], 500);
        }

        $logoUrl = '/touchbase/uploads/' . $filename;

        return Response::json([
            'success' => true,
            'logo_url' => $logoUrl,
        ]);
    }
}
