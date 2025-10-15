<?php
use function TouchBase\__;
$team = $team ?? [];
$attendanceTrend = $attendanceTrend ?? [];
$record = $record ?? ['wins' => 0, 'losses' => 0, 'ties' => 0];
?>

<div class="grid" style="grid-template-columns: 1fr; gap: var(--space-6)">
    <!-- Header -->
    <div class="card">
        <h2 class="section-title"><?= __('analytics.team_analytics') ?>: <?= htmlspecialchars($team['name'] ?? '') ?></h2>
    </div>

    <!-- Win/Loss Record -->
    <div class="card">
        <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('analytics.record') ?></h3>

        <div style="display: flex; gap: var(--space-6); flex-wrap: wrap">
            <div class="stat-box" style="flex: 1; min-width: 150px; text-align: center; padding: var(--space-4); background: var(--bg); border-radius: var(--radius)">
                <div style="font-size: 36px; font-weight: 700; color: var(--brand-2)"><?= $record['wins'] ?></div>
                <div style="font-size: 14px; color: var(--muted); margin-top: var(--space-2)"><?= __('analytics.wins') ?></div>
            </div>

            <div class="stat-box" style="flex: 1; min-width: 150px; text-align: center; padding: var(--space-4); background: var(--bg); border-radius: var(--radius)">
                <div style="font-size: 36px; font-weight: 700; color: var(--brand-4)"><?= $record['losses'] ?></div>
                <div style="font-size: 14px; color: var(--muted); margin-top: var(--space-2)"><?= __('analytics.losses') ?></div>
            </div>

            <div class="stat-box" style="flex: 1; min-width: 150px; text-align: center; padding: var(--space-4); background: var(--bg); border-radius: var(--radius)">
                <div style="font-size: 36px; font-weight: 700; color: var(--muted)"><?= $record['ties'] ?></div>
                <div style="font-size: 14px; color: var(--muted); margin-top: var(--space-2)"><?= __('analytics.ties') ?></div>
            </div>
        </div>
    </div>

    <!-- Attendance Trend -->
    <div class="card">
        <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('analytics.attendance_trend') ?></h3>

        <?php if (empty($attendanceTrend)): ?>
            <p style="color: var(--muted)"><?= __('analytics.no_data') ?></p>
        <?php else: ?>
            <canvas id="attendance-chart" width="800" height="300" style="max-width: 100%; height: auto"></canvas>

            <div class="table-container" style="margin-top: var(--space-4); overflow-x: auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th><?= __('common.date') ?></th>
                            <th><?= __('analytics.present') ?></th>
                            <th><?= __('analytics.total') ?></th>
                            <th><?= __('analytics.percentage') ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($attendanceTrend as $record): ?>
                            <tr>
                                <td><?= htmlspecialchars($record['date']) ?></td>
                                <td><?= $record['present_count'] ?></td>
                                <td><?= $record['total_members'] ?></td>
                                <td><?= $record['attendance_pct'] ?>%</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
// Simple attendance trend chart (no dependencies)
const canvas = document.getElementById('attendance-chart');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const data = <?= json_encode(array_values(array_map(fn($r) => [
        'date' => $r['date'],
        'pct' => $r['attendance_pct']
    ], $attendanceTrend))) ?>;

    if (data.length > 0) {
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--panel').trim();
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Y-axis labels
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText((100 - (i * 20)) + '%', padding - 10, y + 4);
        }

        // Line chart
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--brand-1').trim();
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - (chartHeight * (point.pct / 100));

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Data points
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--brand-2').trim();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.stroke();

        // X-axis labels
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim();
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';

        data.forEach((point, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const label = new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            ctx.fillText(label, x, height - padding + 20);
        });
    }
}
</script>
