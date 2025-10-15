<?php use function TouchBase\__; ?>

<div class="card">
    <h1><?= e(__('roster.title')) ?></h1>
    <p style="color: #9ca3af; margin: 1rem 0;">
        Player roster management - Link players to teams with positions and numbers.
    </p>

    <div id="roster-container">
        <p style="color: #9ca3af;">Loading roster...</p>
    </div>
</div>

<script>
async function loadRoster() {
    try {
        const res = await fetch('<?= url('/api/roster') ?>');
        const data = await res.json();

        const container = document.getElementById('roster-container');

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af;"><?= e(__('roster.no_players')) ?></p>';
            return;
        }

        const table = `
            <table>
                <thead>
                    <tr>
                        <th><?= e(__('roster.player_name')) ?></th>
                        <th><?= e(__('roster.number')) ?></th>
                        <th><?= e(__('roster.position')) ?></th>
                        <th><?= e(__('roster.notes')) ?></th>
                    </tr>
                </thead>
                <tbody>
                    ${data.data.map(entry => `
                        <tr>
                            <td>${escapeHtml(entry.firstname)} ${escapeHtml(entry.lastname)}</td>
                            <td>${escapeHtml(entry.number || '-')}</td>
                            <td>${escapeHtml(entry.position || '-')}</td>
                            <td>${escapeHtml(entry.notes || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    } catch (err) {
        console.error('Failed to load roster:', err);
        container.innerHTML = '<p style="color: #ef4444;">Error loading roster</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

loadRoster();
</script>
