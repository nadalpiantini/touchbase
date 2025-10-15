<?php

use TouchBase\I18n;
use function TouchBase\__;

$currentLang = I18n::getCurrentLang();
?>
<!DOCTYPE html>
<html lang="<?= e($currentLang) ?>" data-theme="<?= e($tenant['theme_mode'] ?? 'dark') ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?= e(__('app.tagline')) ?>">
    <title><?= e(__('app.name')) ?> - <?= e($tenant['name'] ?? 'TouchBase') ?></title>
    
    <!-- Design System CSS -->
    <link rel="stylesheet" href="<?= BASE_PATH ?>/assets/css/tokens.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/assets/css/components.css">
    <link rel="stylesheet" href="<?= BASE_PATH ?>/assets/css/utilities.css">
    
    <!-- Tenant Branding -->
    <?php include TOUCHBASE_BASE . '/views/partials/branding.php'; ?>
    
    <!-- Skip Link for Accessibility -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
</head>
<body>
    <header>
        <nav class="navbar" role="navigation" aria-label="Main navigation">
            <div class="navbar-content">
                <a href="<?= url('/') ?>" class="navbar-brand">
                    ⚾ <?= e($tenant['name'] ?? __('app.name')) ?>
                </a>

                <ul class="navbar-nav">
                    <li><a href="<?= url('/teams') ?>" class="navbar-link <?= isActive('/teams') ? 'active' : '' ?>">
                        <?= e(__('nav.teams')) ?>
                    </a></li>
                    <li><a href="<?= url('/roster') ?>" class="navbar-link <?= isActive('/roster') ? 'active' : '' ?>">
                        <?= e(__('nav.roster')) ?>
                    </a></li>
                    <li><a href="<?= url('/schedule') ?>" class="navbar-link <?= isActive('/schedule') ? 'active' : '' ?>">
                        <?= e(__('nav.schedule')) ?>
                    </a></li>
                    <li><a href="<?= url('/attendance') ?>" class="navbar-link <?= isActive('/attendance') ? 'active' : '' ?>">
                        <?= e(__('nav.attendance')) ?>
                    </a></li>
                    <li><a href="<?= url('/stats') ?>" class="navbar-link <?= isActive('/stats') ? 'active' : '' ?>">
                        <?= e(__('nav.stats')) ?>
                    </a></li>
                    <li><a href="<?= url('/tournaments') ?>" class="navbar-link <?= isActive('/tournaments') ? 'active' : '' ?>">
                        <?= e(__('nav.tournaments')) ?>
                    </a></li>
                    <li><a href="<?= url('/standings') ?>" class="navbar-link <?= isActive('/standings') ? 'active' : '' ?>">
                        <?= e(__('nav.standings')) ?>
                    </a></li>
                </ul>

                <div class="flex items-center gap-3">
                    <form method="POST" action="<?= url('/lang/switch') ?>" id="lang-form" class="flex gap-2">
                        <input type="hidden" name="redirect" value="<?= e($_SERVER['REQUEST_URI'] ?? '/') ?>">
                        <button type="button" class="btn btn-ghost btn-sm <?= $currentLang === 'en' ? 'active' : '' ?>"
                                onclick="switchLang('en')" aria-label="Switch to English">EN</button>
                        <button type="button" class="btn btn-ghost btn-sm <?= $currentLang === 'es' ? 'active' : '' ?>"
                                onclick="switchLang('es')" aria-label="Cambiar a Español">ES</button>
                    </form>
                </div>
            </div>
        </nav>
    </header>

    <main id="main-content" class="container" style="margin-top: var(--space-6); margin-bottom: var(--space-6);">
        <?php
        // Include the actual view content
        $viewFile = TOUCHBASE_BASE . "/views/{$name}.php";
        if (file_exists($viewFile)) {
            include $viewFile;
        } else {
            echo '<div class="alert alert-error">View not found: ' . htmlspecialchars($name) . '</div>';
        }
        ?>
    </main>

    <script>
        function switchLang(lang) {
            const form = document.getElementById('lang-form');
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'lang';
            input.value = lang;
            form.appendChild(input);
            form.submit();
        }
    </script>
</body>
</html>
