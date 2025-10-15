<?php use function TouchBase\__; ?>

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1><?= e(__('team.title')) ?></h1>
        <a href="<?= url('/teams/create') ?>" class="btn btn-primary">
            + <?= e(__('team.create')) ?>
        </a>
    </div>

    <div id="teams-container">
        <p style="color: #9ca3af;"><?= e(__('team.no_teams')) ?></p>
    </div>
</div>

<script>
async function loadTeams() {
    try {
        const res = await fetch('<?= url('/api/teams') ?>');
        const data = await res.json();

        const container = document.getElementById('teams-container');

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<p style="color: #9ca3af;"><?= e(__('team.no_teams')) ?></p>';
            return;
        }

        const table = `
            <table>
                <thead>
                    <tr>
                        <th><?= e(__('team.name')) ?></th>
                        <th><?= e(__('team.category')) ?></th>
                        <th><?= e(__('team.club')) ?></th>
                        <th><?= e(__('team.season')) ?></th>
                        <th><?= e(__('action.edit')) ?></th>
                    </tr>
                </thead>
                <tbody>
                    ${data.data.map(team => `
                        <tr>
                            <td>${escapeHtml(team.name)}</td>
                            <td>${escapeHtml(team.category)}</td>
                            <td>${escapeHtml(team.club_name)}</td>
                            <td>${escapeHtml(team.season_name)}</td>
                            <td>
                                <a href="<?= url('/teams/') ?>${team.id}/edit" class="btn btn-secondary" style="padding: 0.4rem 0.8rem;">
                                    <?= e(__('action.edit')) ?>
                                </a>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = table;
    } catch (err) {
        console.error('Failed to load teams:', err);
        container.innerHTML = '<p style="color: #ef4444;">Error loading teams</p>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

loadTeams();
</script>
