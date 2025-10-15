<?php
use function TouchBase\__;
$children = $children ?? [];
$upcomingEvents = $upcomingEvents ?? [];
$attendanceSummary = $attendanceSummary ?? [];
?>

<div class="grid" style="grid-template-columns: 1fr; gap: var(--space-6)">
    <!-- Header -->
    <div class="card">
        <h2 class="section-title"><?= __('parent.dashboard_title') ?></h2>
        <p style="color: var(--muted); margin-top: var(--space-2)">
            <?= __('parent.dashboard_subtitle') ?>
        </p>
    </div>

    <?php if (empty($children)): ?>
        <!-- Empty State -->
        <div class="card" style="text-align: center; padding: var(--space-8)">
            <p style="font-size: var(--text-lg); color: var(--muted)">
                <?= __('parent.no_children_found') ?>
            </p>
            <p style="margin-top: var(--space-2); color: var(--muted)">
                <?= __('parent.contact_coach') ?>
            </p>
        </div>
    <?php else: ?>
        <!-- Children & Attendance Summary -->
        <div class="card">
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('parent.my_children') ?></h3>

            <div style="display: grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))">
                <?php foreach ($children as $child): ?>
                    <div class="child-card" style="padding: var(--space-4); background: var(--bg); border-radius: var(--radius); border: 1px solid var(--border)">
                        <div style="font-weight: 600; font-size: var(--text-lg)">
                            <?= htmlspecialchars($child['firstname'] . ' ' . $child['lastname']) ?>
                        </div>

                        <div style="margin-top: var(--space-2); color: var(--muted); font-size: 14px">
                            <?= htmlspecialchars($child['team_name']) ?>
                        </div>

                        <?php
                        $attendance = $attendanceSummary[$child['id']] ?? ['attended' => 0, 'total_events' => 0, 'attendance_pct' => 0];
                        ?>

                        <div style="margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border)">
                            <div style="font-size: 12px; color: var(--muted); margin-bottom: var(--space-1)">
                                <?= __('parent.attendance') ?>
                            </div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--brand-1)">
                                <?= $attendance['attendance_pct'] ?>%
                            </div>
                            <div style="font-size: 12px; color: var(--muted); margin-top: var(--space-1)">
                                <?= $attendance['attended'] ?> / <?= $attendance['total_events'] ?> <?= __('parent.events') ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Upcoming Events -->
        <div class="card">
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-4)"><?= __('parent.upcoming_events') ?></h3>

            <?php if (empty($upcomingEvents)): ?>
                <p style="color: var(--muted)"><?= __('parent.no_upcoming_events') ?></p>
            <?php else: ?>
                <div class="table-container" style="overflow-x: auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th><?= __('common.date') ?></th>
                                <th><?= __('common.time') ?></th>
                                <th><?= __('schedule.event_type') ?></th>
                                <th><?= __('common.title') ?></th>
                                <th><?= __('common.team') ?></th>
                                <th><?= __('common.location') ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($upcomingEvents as $event): ?>
                                <tr>
                                    <td><?= htmlspecialchars($event['date']) ?></td>
                                    <td><?= htmlspecialchars($event['time'] ?: '-') ?></td>
                                    <td>
                                        <span class="badge" style="background: <?= $event['type'] === 'game' ? 'var(--brand-1)' : 'var(--brand-3)' ?>; color: #fff">
                                            <?= strtoupper($event['type']) ?>
                                        </span>
                                    </td>
                                    <td><?= htmlspecialchars($event['title']) ?></td>
                                    <td><?= htmlspecialchars($event['team_name']) ?></td>
                                    <td><?= htmlspecialchars($event['location'] ?: '-') ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
    <?php endif; ?>
</div>
