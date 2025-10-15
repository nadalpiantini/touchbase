<?php use function TouchBase\__; ?>

<div class="card">
    <h1><?= e(__('schedule.title')) ?></h1>
    <p style="color: #9ca3af; margin: 1rem 0;">
        Manage practices and games schedule.
    </p>

    <div id="schedule-container">
        <p style="color: #9ca3af;">Loading schedule...</p>
    </div>
</div>

<script>
async function loadSchedule() {
    try {
        const res = await fetch('<?= url('/api/schedule') ?>');
        const data = await res.json();

        const container = document.getElementById('schedule-container');

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af;"><?= e(__('schedule.no_events')) ?></p>';
            return;
        }

        const table = `
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th><?= e(__('schedule.start_time')) ?></th>
                        <th><?= e(__('schedule.opponent')) ?></th>
                        <th><?= e(__('schedule.venue')) ?></th>
                        <th><?= e(__('schedule.notes')) ?></th>
                    </tr>
                </thead>
                <tbody>
                    ${data.data.map(event => `
                        <tr>
                            <td>
                                <span style="background: ${event.type === 'game' ? '#3b82f6' : '#6b7280'};
                                      padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.85rem;">
                                    ${event.type === 'game' ? '<?= e(__('schedule.game')) ?>' : '<?= e(__('schedule.practice')) ?>'}
                                </span>
                            </td>
                            <td>${formatDateTime(event.start_at)}</td>
                            <td>${escapeHtml(event.opponent || '-')}</td>
                            <td>${escapeHtml(event.venue || '-')}</td>
                            <td>${escapeHtml(event.notes || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    } catch (err) {
        console.error('Failed to load schedule:', err);
        container.innerHTML = '<p style="color: #ef4444;">Error loading schedule</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTime(datetime) {
    return new Date(datetime).toLocaleString();
}

loadSchedule();
</script>
