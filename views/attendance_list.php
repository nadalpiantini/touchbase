<?php use function TouchBase\__; ?>

<div class="card">
    <h1><?= e(__('attendance.title')) ?></h1>
    <p style="color: #9ca3af; margin: 1rem 0;">
        Track player attendance at practices and games.
    </p>

    <div id="attendance-container">
        <p style="color: #9ca3af;">Loading attendance records...</p>
    </div>
</div>

<script>
async function loadAttendance() {
    try {
        const res = await fetch('<?= url('/api/attendance') ?>');
        const data = await res.json();

        const container = document.getElementById('attendance-container');

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af;">No attendance records found</p>';
            return;
        }

        const table = `
            <table>
                <thead>
                    <tr>
                        <th><?= e(__('attendance.date')) ?></th>
                        <th><?= e(__('roster.player_name')) ?></th>
                        <th><?= e(__('attendance.status')) ?></th>
                        <th><?= e(__('attendance.comment')) ?></th>
                    </tr>
                </thead>
                <tbody>
                    ${data.data.map(record => `
                        <tr>
                            <td>${escapeHtml(record.date)}</td>
                            <td>${escapeHtml(record.firstname)} ${escapeHtml(record.lastname)}</td>
                            <td>
                                <span style="background: ${getStatusColor(record.status)};
                                      padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.85rem;">
                                    ${getStatusLabel(record.status)}
                                </span>
                            </td>
                            <td>${escapeHtml(record.comment || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    } catch (err) {
        console.error('Failed to load attendance:', err);
        container.innerHTML = '<p style="color: #ef4444;">Error loading attendance</p>';
    }
}

function getStatusColor(status) {
    const colors = {
        present: '#10b981',
        late: '#f59e0b',
        absent: '#ef4444',
        excused: '#6b7280'
    };
    return colors[status] || '#6b7280';
}

function getStatusLabel(status) {
    const labels = {
        present: '<?= e(__('attendance.present')) ?>',
        late: '<?= e(__('attendance.late')) ?>',
        absent: '<?= e(__('attendance.absent')) ?>',
        excused: '<?= e(__('attendance.excused')) ?>'
    };
    return labels[status] || status;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

loadAttendance();
</script>
