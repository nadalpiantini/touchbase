<?php
/**
 * Unified App Layout for TouchBase
 * Integrated with Chamilo, branded per tenant
 */

declare(strict_types=1);

use TouchBase\Utils\Tenant;
use TouchBase\I18n;
use function TouchBase\__;

// Get tenant branding
$tenant = Tenant::current();
$currentLang = I18n::getLanguage();

?><!doctype html>
<html lang="<?= htmlspecialchars($currentLang) ?>" class="theme-dark">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="description" content="<?= __('app.description') ?>"/>
  <title><?= htmlspecialchars($pageTitle ?? 'TouchBase') ?></title>

  <!-- Theme CSS -->
  <link rel="stylesheet" href="<?= BASE_PATH ?>/../../main/css/themes/clubball/ui.css"/>

  <!-- Per-tenant branding override -->
  <style>
    :root {
      --brand-1: <?= htmlspecialchars($tenant['color1'] ?? '#0ea5e9') ?>;
      --brand-2: <?= htmlspecialchars($tenant['color2'] ?? '#22c55e') ?>;
      --brand-3: <?= htmlspecialchars($tenant['color3'] ?? '#f59e0b') ?>;
      --brand-4: <?= htmlspecialchars($tenant['color4'] ?? '#ef4444') ?>;
    }
  </style>
</head>
<body>
  <!-- Navigation Bar -->
  <nav class="navbar" role="navigation" aria-label="<?= __('nav.main') ?>">
    <div class="row container">
      <a href="<?= BASE_PATH ?>/" class="brand">
        <?php if (!empty($tenant['logo_url'])): ?>
          <img src="<?= htmlspecialchars($tenant['logo_url']) ?>" alt="<?= htmlspecialchars($tenant['name'] ?? 'TouchBase') ?>"/>
        <?php endif; ?>
        <strong><?= htmlspecialchars($tenant['name'] ?? 'TouchBase') ?></strong>
      </a>

      <nav class="nav">
        <a href="<?= BASE_PATH ?>/"><?= __('nav.dashboard') ?></a>
        <a href="<?= BASE_PATH ?>/teams"><?= __('nav.teams') ?></a>
        <a href="<?= BASE_PATH ?>/roster"><?= __('nav.roster') ?></a>
        <a href="<?= BASE_PATH ?>/schedule"><?= __('nav.schedule') ?></a>
        <a href="<?= BASE_PATH ?>/attendance"><?= __('nav.attendance') ?></a>
        <a href="<?= BASE_PATH ?>/stats"><?= __('nav.stats') ?></a>
        <a href="<?= BASE_PATH ?>/tournaments"><?= __('nav.tournaments') ?></a>
        <a href="<?= BASE_PATH ?>/standings"><?= __('nav.standings') ?></a>
        <a href="<?= BASE_PATH ?>/ai/assistant" style="background: var(--brand-3); padding: var(--space-2) var(--space-3); border-radius: var(--radius);">
          💬 <?= __('nav.ai_assistant') ?>
        </a>
      </nav>

      <div style="margin-left: auto;"></div>

      <!-- Language Switcher -->
      <form method="post" action="<?= BASE_PATH ?>/lang/switch" style="display: inline-flex; gap: 8px;">
        <input type="hidden" name="redirect" value="<?= htmlspecialchars($_SERVER['REQUEST_URI'] ?? BASE_PATH . '/') ?>"/>
        <button type="submit" name="lang" value="en" class="btn btn-ghost btn-sm"
                <?= $currentLang === 'en' ? 'aria-current="true"' : '' ?>>
          EN
        </button>
        <button type="submit" name="lang" value="es" class="btn btn-ghost btn-sm"
                <?= $currentLang === 'es' ? 'aria-current="true"' : '' ?>>
          ES
        </button>
      </form>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="container" role="main">
    <?php if (!empty($flashMessage)): ?>
      <div class="card" style="background: var(--brand-2); color: white; margin-bottom: var(--space-4);">
        <?= htmlspecialchars($flashMessage) ?>
      </div>
    <?php endif; ?>

    <?= $content ?? '' ?>
  </main>

  <!-- Footer -->
  <footer class="footer" role="contentinfo">
    <p>&copy; <?= date('Y') ?> <?= htmlspecialchars($tenant['name'] ?? 'TouchBase') ?></p>
    <p class="text-xs"><?= __('footer.powered_by') ?> <a href="https://chamilo.org" class="text-muted">Chamilo</a></p>
  </footer>
</body>
</html>
