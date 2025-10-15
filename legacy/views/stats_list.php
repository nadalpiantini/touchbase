<?php use function TouchBase\__; ?>

<div class="card">
    <h1><?= e(__('stats.title')) ?></h1>
    <p style="color: #9ca3af; margin: 1rem 0;">
        Player performance statistics (AVG, OBP, HR, RBI, etc.)
    </p>

    <div id="stats-container">
        <p style="color: #9ca3af;">Loading statistics...</p>
    </div>
</div>

<script>
async function loadStats() {
    try {
        const res = await fetch('<?= url('/api/stats') ?>');
        const data = await res.json();

        const container = document.getElementById('stats-container');

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af;">No statistics recorded yet</p>';
            return;
        }

        const table = `
            <table>
                <thead>
                    <tr>
                        <th><?= e(__('stats.player')) ?></th>
                        <th><?= e(__('stats.metric')) ?></th>
                        <th><?= e(__('stats.value')) ?></th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.data.map(stat => `
                        <tr>
                            <td>${escapeHtml(stat.firstname)} ${escapeHtml(stat.lastname)}</td>
                            <td><strong>${escapeHtml(stat.metric)}</strong></td>
                            <td>${escapeHtml(stat.value)}</td>
                            <td>${formatDateTime(stat.created_at)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    } catch (err) {
        console.error('Failed to load stats:', err);
        container.innerHTML = '<p style="color: #ef4444;">Error loading statistics</p>';
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

loadStats();
</script>
