<?php
/**
 * Dynamic Tenant Branding Partial
 * Injects tenant-specific CSS variables and styles
 * Include this in the <head> of all pages
 */

use TouchBase\Utils\Tenant;

$tenant = Tenant::current();

// Track session for analytics
Tenant::trackSession();
?>
<style id="tenant-branding">
<?= Tenant::getCssVariables() ?>

/* Tenant-specific overrides */
<?php if (!empty($tenant['logo_url'])): ?>
.navbar-brand::before {
    content: '';
    display: inline-block;
    width: 2rem;
    height: 2rem;
    background-image: url('<?= htmlspecialchars($tenant['logo_url']) ?>');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    margin-right: var(--space-2);
}
<?php endif; ?>

<?php if (!empty($tenant['logo_dark_url']) && $tenant['theme_mode'] === 'dark'): ?>
@media (prefers-color-scheme: dark) {
    .navbar-brand::before {
        background-image: url('<?= htmlspecialchars($tenant['logo_dark_url']) ?>');
    }
}
<?php endif; ?>

<?php if (!empty($tenant['font_family'])): ?>
@import url('https://fonts.googleapis.com/css2?family=<?= urlencode($tenant['font_family']) ?>:wght@400;500;600;700&display=swap');
<?php endif; ?>
</style>

<!-- Tenant Metadata -->
<meta name="tenant-code" content="<?= htmlspecialchars($tenant['code']) ?>">
<meta name="tenant-name" content="<?= htmlspecialchars($tenant['name']) ?>">
<meta name="theme-color" content="<?= htmlspecialchars($tenant['color_primary']) ?>">

<?php if (!empty($tenant['favicon_url'])): ?>
<link rel="icon" href="<?= htmlspecialchars($tenant['favicon_url']) ?>">
<?php endif; ?>

<!-- Tenant Configuration for JavaScript -->
<script id="tenant-config" type="application/json">
<?= json_encode([
    'id' => $tenant['id'],
    'code' => $tenant['code'],
    'name' => $tenant['name'],
    'theme' => $tenant['theme_mode'],
    'colors' => [
        'primary' => $tenant['color_primary'],
        'secondary' => $tenant['color_secondary'],
        'accent' => $tenant['color_accent'],
        'danger' => $tenant['color_danger'],
    ],
    'features' => $tenant['features'] ?? [],
    'locale' => $tenant['locale'] ?? 'en_US',
    'timezone' => $tenant['timezone'] ?? 'America/Santo_Domingo',
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
