<?php use function TouchBase\__; ?>

<div class="card">
    <h1><?= e(__('app.welcome')) ?></h1>
    <p style="color: #9ca3af; margin-top: 0.5rem;">
        <?= e(__('app.tagline')) ?>
    </p>
</div>

<div class="card">
    <h2><?= e(__('nav.teams')) ?></h2>
    <p style="color: #9ca3af; margin-bottom: 1rem;">
        Manage your baseball teams by category (U8, U10, U12, etc.)
    </p>
    <a href="<?= url('/teams') ?>" class="btn btn-primary">
        <?= e(__('nav.teams')) ?> →
    </a>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
    <div class="card">
        <h3><?= e(__('nav.roster')) ?></h3>
        <p style="color: #9ca3af; font-size: 0.9rem;">
            Player management and team rosters
        </p>
        <a href="<?= url('/roster') ?>" class="btn btn-secondary" style="margin-top: 1rem;">
            <?= e(__('action.view')) ?>
        </a>
    </div>

    <div class="card">
        <h3><?= e(__('nav.schedule')) ?></h3>
        <p style="color: #9ca3af; font-size: 0.9rem;">
            Practices and games calendar
        </p>
        <a href="<?= url('/schedule') ?>" class="btn btn-secondary" style="margin-top: 1rem;">
            <?= e(__('action.view')) ?>
        </a>
    </div>

    <div class="card">
        <h3><?= e(__('nav.attendance')) ?></h3>
        <p style="color: #9ca3af; font-size: 0.9rem;">
            Track player attendance
        </p>
        <a href="<?= url('/attendance') ?>" class="btn btn-secondary" style="margin-top: 1rem;">
            <?= e(__('action.view')) ?>
        </a>
    </div>

    <div class="card">
        <h3><?= e(__('nav.stats')) ?></h3>
        <p style="color: #9ca3af; font-size: 0.9rem;">
            Player statistics and performance
        </p>
        <a href="<?= url('/stats') ?>" class="btn btn-secondary" style="margin-top: 1rem;">
            <?= e(__('action.view')) ?>
        </a>
    </div>
</div>
