<?php
use function TouchBase\__;
$player = $player ?? [];
$stats = $stats ?? [];
$attendance = $attendance ?? ['total_events' => 0, 'attended' => 0, 'attendance_pct' => 0];
?>

<div class="grid" style="grid-template-columns: 1fr; gap: var(--space-6)">
    <!-- Header -->
    <div class="card">
        <h2 class="section-title">
            <?= __('analytics.player_analytics') ?>: <?= htmlspecialchars(($player['firstname'] ?? '') . ' ' . ($player['lastname'] ?? '')) ?>
        </h2>
        <div style="margin-top: var(--space-2); color: var(--muted)">
            <?= __('roster.position') ?>: <?= htmlspecialchars($player['position'] ?? 'N/A') ?> |
            <?= __('roster.jersey') ?>: #<?= htmlspecialchars($player['jersey_number'] ?? '-') ?>
        </div>
    </div>

    <!-- Attendance -->
    <div class="card">
        <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('analytics.attendance') ?></h3>

        <div style="display: flex; gap: var(--space-6); flex-wrap: wrap">
            <div class="stat-box" style="flex: 1; min-width: 150px; text-align: center; padding: var(--space-4); background: var(--bg); border-radius: var(--radius)">
                <div style="font-size: 36px; font-weight: 700; color: var(--brand-2)"><?= $attendance['attended'] ?></div>
                <div style="font-size: 14px; color: var(--muted); margin-top: var(--space-2)"><?= __('analytics.events_attended') ?></div>
            </div>

            <div class="stat-box" style="flex: 1; min-width: 150px; text-align: center; padding: var(--space-4); background: var(--bg); border-radius: var(--radius)">
                <div style="font-size: 36px; font-weight: 700; color: var(--muted)"><?= $attendance['total_events'] ?></div>
                <div style="font-size: 14px; color: var(--muted); margin-top: var(--space-2)"><?= __('analytics.total_events') ?></div>
            </div>

            <div class="stat-box" style="flex: 1; min-width: 150px; text-align: center; padding: var(--space-4); background: var(--bg); border-radius: var(--radius)">
                <div style="font-size: 36px; font-weight: 700; color: var(--brand-1)"><?= $attendance['attendance_pct'] ?>%</div>
                <div style="font-size: 14px; color: var(--muted); margin-top: var(--space-2)"><?= __('analytics.attendance_rate') ?></div>
            </div>
        </div>
    </div>

    <!-- Batting Stats -->
    <?php if (!empty($stats) && ($stats['avg_ba'] || $stats['total_hr'] || $stats['total_rbi'])): ?>
        <div class="card">
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('analytics.batting_stats') ?></h3>

            <div class="table-container" style="overflow-x: auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th>AVG</th>
                            <th>OBP</th>
                            <th>SLG</th>
                            <th>HR</th>
                            <th>RBI</th>
                            <th>SB</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><?= number_format($stats['avg_ba'] ?? 0, 3) ?></td>
                            <td><?= number_format($stats['avg_obp'] ?? 0, 3) ?></td>
                            <td><?= number_format($stats['avg_slg'] ?? 0, 3) ?></td>
                            <td><?= $stats['total_hr'] ?? 0 ?></td>
                            <td><?= $stats['total_rbi'] ?? 0 ?></td>
                            <td><?= $stats['total_sb'] ?? 0 ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>

    <!-- Pitching Stats -->
    <?php if (!empty($stats) && ($stats['avg_era'] || $stats['total_k'])): ?>
        <div class="card">
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('analytics.pitching_stats') ?></h3>

            <div class="table-container" style="overflow-x: auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ERA</th>
                            <th>K</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><?= number_format($stats['avg_era'] ?? 0, 2) ?></td>
                            <td><?= $stats['total_k'] ?? 0 ?></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>

    <?php if (empty($stats) || (!$stats['avg_ba'] && !$stats['avg_era'] && !$stats['total_hr'] && !$stats['total_k'])): ?>
        <div class="card">
            <p style="color: var(--muted)"><?= __('analytics.no_stats_yet') ?></p>
        </div>
    <?php endif; ?>
</div>
