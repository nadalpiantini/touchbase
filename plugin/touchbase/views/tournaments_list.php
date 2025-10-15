<?php
/**
 * Tournaments List View
 * Shows all tournaments with create/manage options
 */

use function TouchBase\__;
use function TouchBase\url;
use function TouchBase\e;
?>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold"><?= e(__('tournament.title')) ?></h1>
    <a href="<?= url('/tournaments/create') ?>" class="btn btn-primary">
        + <?= e(__('tournament.create')) ?>
    </a>
</div>

<div class="card">
    <div class="table-container">
        <table class="table" id="tournaments-table">
            <thead>
                <tr>
                    <th><?= e(__('tournament.name')) ?></th>
                    <th><?= e(__('tournament.format')) ?></th>
                    <th><?= e(__('team.season')) ?></th>
                    <th><?= e(__('tournament.teams_count')) ?></th>
                    <th><?= e(__('tournament.matches_count')) ?></th>
                    <th><?= e(__('tournament.status')) ?></th>
                    <th class="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <!-- Loaded via JavaScript -->
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <div class="spinner mx-auto my-4"></div>
                        Loading tournaments...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script>
// Fetch and display tournaments
async function loadTournaments() {
    try {
        const response = await fetch('<?= url('/api/tournaments') ?>');
        const result = await response.json();
        
        const tbody = document.querySelector('#tournaments-table tbody');
        
        if (!result.success || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-8">
                        <?= e(__('tournament.no_tournaments')) ?>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = result.data.map(tournament => `
            <tr>
                <td>
                    <a href="<?= url('/tournaments/') ?>${tournament.id}" class="text-primary font-semibold">
                        ${escapeHtml(tournament.name)}
                    </a>
                </td>
                <td>
                    <span class="badge badge-outline">${escapeHtml(tournament.format)}</span>
                </td>
                <td>${escapeHtml(tournament.season_name || '')}</td>
                <td>${tournament.teams_count || 0}</td>
                <td>
                    ${tournament.matches_completed || 0} / ${tournament.matches_count || 0}
                </td>
                <td>
                    <span class="badge ${getStatusBadgeClass(tournament.status)}">
                        ${escapeHtml(tournament.status)}
                    </span>
                </td>
                <td class="text-right">
                    <div class="flex gap-2 justify-end">
                        <a href="<?= url('/tournaments/') ?>${tournament.id}" class="btn btn-sm btn-outline">
                            View
                        </a>
                        <button onclick="generateBracket(${tournament.id})" 
                                class="btn btn-sm btn-secondary"
                                ${tournament.teams_count < 2 ? 'disabled' : ''}>
                            Generate Bracket
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load tournaments:', error);
        document.querySelector('#tournaments-table tbody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-error py-8">
                    Error loading tournaments
                </td>
            </tr>
        `;
    }
}

function getStatusBadgeClass(status) {
    const classes = {
        'draft': 'badge-outline',
        'scheduled': 'badge-info',
        'in_progress': 'badge-warning',
        'completed': 'badge-success',
        'cancelled': 'badge-error'
    };
    return classes[status] || 'badge-outline';
}

async function generateBracket(tournamentId) {
    if (!confirm('Generate bracket for this tournament? Existing matches will be preserved.')) {
        return;
    }
    
    try {
        const response = await fetch(`<?= url('/api/tournaments/') ?>${tournamentId}/generate-bracket`, {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`Bracket generated! ${result.matches_created} matches created.`);
            loadTournaments(); // Reload
        } else {
            alert(`Error: ${result.error || 'Failed to generate bracket'}`);
        }
    } catch (error) {
        alert('Error generating bracket: ' + error.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load on page load
loadTournaments();
</script>
