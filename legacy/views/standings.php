<?php
/**
 * Standings View
 * Real-time tournament/season standings with statistics
 */

use function TouchBase\__;
?>

<div class="mb-6">
    <h1 class="text-3xl font-bold"><?= e(__('standings.title')) ?></h1>
</div>

<!-- Filters -->
<div class="card mb-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="form-group">
            <label class="form-label">Season</label>
            <select class="form-select" id="season-filter" onchange="loadStandings()">
                <option value="">Loading...</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Tournament (Optional)</label>
            <select class="form-select" id="tournament-filter" onchange="loadStandings()">
                <option value="">All Tournaments</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Order By</label>
            <select class="form-select" id="order-filter" onchange="loadStandings()">
                <option value="win_percentage">Win Percentage</option>
                <option value="wins">Most Wins</option>
                <option value="run_differential">Run Differential</option>
            </select>
        </div>
    </div>
</div>

<!-- Standings Table -->
<div class="card">
    <div class="table-container">
        <table class="table" id="standings-table">
            <thead>
                <tr>
                    <th><?= e(__('standings.rank')) ?></th>
                    <th><?= e(__('standings.team')) ?></th>
                    <th class="text-center"><?= e(__('standings.games_played')) ?></th>
                    <th class="text-center"><?= e(__('standings.wins')) ?></th>
                    <th class="text-center"><?= e(__('standings.losses')) ?></th>
                    <th class="text-center"><?= e(__('standings.ties')) ?></th>
                    <th class="text-center"><?= e(__('standings.win_pct')) ?></th>
                    <th class="text-center"><?= e(__('standings.runs_for')) ?></th>
                    <th class="text-center"><?= e(__('standings.runs_against')) ?></th>
                    <th class="text-center"><?= e(__('standings.run_diff')) ?></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="10" class="text-center">
                        <div class="spinner mx-auto my-4"></div>
                        Loading standings...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script>
let seasons = [];
let tournaments = [];

async function loadFilters() {
    try {
        // Load seasons
        const seasonsResp = await fetch('<?= url('/api/teams') ?>');
        const seasonsData = await seasonsResp.json();
        
        // Extract unique seasons from teams
        const seasonSet = new Map();
        if (seasonsData.success && seasonsData.data) {
            seasonsData.data.forEach(team => {
                if (team.season_id && team.season_name) {
                    seasonSet.set(team.season_id, team.season_name);
                }
            });
        }
        
        seasons = Array.from(seasonSet, ([id, name]) => ({id, name}));
        
        const seasonSelect = document.getElementById('season-filter');
        if (seasons.length > 0) {
            seasonSelect.innerHTML = seasons.map(s => 
                `<option value="${s.id}">${escapeHtml(s.name)}</option>`
            ).join('');
            
            // Auto-select first season
            seasonSelect.value = seasons[0].id;
        } else {
            seasonSelect.innerHTML = '<option value="">No seasons available</option>';
        }
        
        // Load tournaments for selected season
        await loadTournamentFilter();
        
        // Load standings
        await loadStandings();
        
    } catch (error) {
        console.error('Failed to load filters:', error);
    }
}

async function loadTournamentFilter() {
    const seasonId = document.getElementById('season-filter').value;
    if (!seasonId) return;
    
    try {
        const response = await fetch(`<?= url('/api/tournaments') ?>?season_id=${seasonId}`);
        const result = await response.json();
        
        const tournamentSelect = document.getElementById('tournament-filter');
        tournamentSelect.innerHTML = '<option value="">All Tournaments</option>';
        
        if (result.success && result.data && result.data.length > 0) {
            tournamentSelect.innerHTML += result.data.map(t => 
                `<option value="${t.id}">${escapeHtml(t.name)}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Failed to load tournaments:', error);
    }
}

async function loadStandings() {
    const seasonId = document.getElementById('season-filter').value;
    const tournamentId = document.getElementById('tournament-filter').value;
    const orderBy = document.getElementById('order-filter').value;
    
    if (!seasonId) {
        return;
    }
    
    try {
        let url = `<?= url('/api/standings') ?>?season_id=${seasonId}&order_by=${orderBy}`;
        if (tournamentId) {
            url += `&tournament_id=${tournamentId}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        const tbody = document.querySelector('#standings-table tbody');
        
        if (!result.success || !result.data || result.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-8">
                        No standings available. Matches need to be played first.
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = result.data.map((standing, index) => `
            <tr>
                <td class="font-bold text-center">${index + 1}</td>
                <td class="font-semibold">${escapeHtml(standing.team_name)}</td>
                <td class="text-center">${standing.games_played || 0}</td>
                <td class="text-center text-success font-semibold">${standing.wins || 0}</td>
                <td class="text-center text-error">${standing.losses || 0}</td>
                <td class="text-center text-muted">${standing.ties || 0}</td>
                <td class="text-center font-bold">${parseFloat(standing.win_percentage || 0).toFixed(1)}%</td>
                <td class="text-center">${standing.runs_for || 0}</td>
                <td class="text-center">${standing.runs_against || 0}</td>
                <td class="text-center ${standing.run_differential >= 0 ? 'text-success' : 'text-error'} font-semibold">
                    ${standing.run_differential > 0 ? '+' : ''}${standing.run_differential || 0}
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load standings:', error);
        document.querySelector('#standings-table tbody').innerHTML = `
            <tr>
                <td colspan="10" class="text-center text-error py-8">
                    Error loading standings
                </td>
            </tr>
        `;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusClass(status) {
    const classes = {
        'draft': 'badge-outline',
        'scheduled': 'badge-info',
        'in_progress': 'badge-warning',
        'completed': 'badge-success',
        'cancelled': 'badge-error'
    };
    return classes[status] || 'badge-outline';
}

// Load on page ready
loadFilters();
</script>
