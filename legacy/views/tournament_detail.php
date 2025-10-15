<?php
/**
 * Tournament Detail View
 * Shows tournament info, teams, matches, and brackets
 */

use function TouchBase\__;
use function TouchBase\url;
use function TouchBase\e;

$tournamentId = $id ?? 0;
?>

<div class="mb-6">
    <a href="<?= url('/tournaments') ?>" class="btn btn-ghost">
        ← Back to Tournaments
    </a>
</div>

<div class="grid grid-cols-1 gap-6">
    <!-- Tournament Info Card -->
    <div class="card" id="tournament-info">
        <div class="flex justify-between items-start">
            <div>
                <h1 class="text-3xl font-bold mb-2" id="tournament-name">Loading...</h1>
                <div class="flex gap-3 items-center">
                    <span class="badge" id="tournament-format"></span>
                    <span class="badge" id="tournament-status"></span>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="scheduleMatches()" class="btn btn-secondary">
                    Schedule Matches
                </button>
                <button onclick="generateBracket()" class="btn btn-primary">
                    Generate Bracket
                </button>
            </div>
        </div>
    </div>

    <!-- Teams Card -->
    <div class="card">
        <h2 class="text-xl font-bold mb-4">Participating Teams</h2>
        <div id="teams-list" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="spinner"></div>
        </div>
    </div>

    <!-- Matches Card -->
    <div class="card">
        <h2 class="text-xl font-bold mb-4">Matches</h2>
        <div class="table-container">
            <table class="table table-compact" id="matches-table">
                <thead>
                    <tr>
                        <th>Round</th>
                        <th>Match</th>
                        <th colspan="3">Teams</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="8" class="text-center">
                            <div class="spinner mx-auto my-4"></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
const TOURNAMENT_ID = <?= (int)$tournamentId ?>;

async function loadTournament() {
    try {
        const response = await fetch(`<?= url('/api/tournaments/') ?>${TOURNAMENT_ID}`);
        const result = await response.json();
        
        if (!result.success) {
            alert('Tournament not found');
            window.location.href = '<?= url('/tournaments') ?>';
            return;
        }
        
        const tournament = result.data;
        
        // Update info
        document.getElementById('tournament-name').textContent = tournament.name;
        document.getElementById('tournament-format').textContent = tournament.format;
        document.getElementById('tournament-format').className = 'badge badge-primary';
        document.getElementById('tournament-status').textContent = tournament.status;
        document.getElementById('tournament-status').className = `badge ${getStatusClass(tournament.status)}`;
        
        // Display teams
        const teamsList = document.getElementById('teams-list');
        if (tournament.teams && tournament.teams.length > 0) {
            teamsList.innerHTML = tournament.teams.map(team => `
                <div class="card card-interactive p-3">
                    <div class="font-semibold">${escapeHtml(team.team_name)}</div>
                    <div class="text-sm text-muted">${escapeHtml(team.category)}</div>
                    ${team.group_name ? `<span class="badge badge-sm mt-2">Group ${escapeHtml(team.group_name)}</span>` : ''}
                </div>
            `).join('');
        } else {
            teamsList.innerHTML = '<p class="text-muted col-span-full">No teams added yet</p>';
        }
        
        // Display matches
        const matchesBody = document.querySelector('#matches-table tbody');
        if (tournament.matches && tournament.matches.length > 0) {
            matchesBody.innerHTML = tournament.matches.map(match => `
                <tr>
                    <td>${match.round || '-'}</td>
                    <td>#${match.match_number || match.id}</td>
                    <td class="font-semibold">${escapeHtml(match.home_team_name)}</td>
                    <td class="text-center font-bold">
                        ${match.status === 'completed' ? `${match.score_home} - ${match.score_away}` : 'vs'}
                    </td>
                    <td class="font-semibold">${escapeHtml(match.away_team_name)}</td>
                    <td>${match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString() : 'TBD'}</td>
                    <td><span class="badge ${getMatchStatusClass(match.status)}">${match.status}</span></td>
                    <td>
                        ${match.status === 'scheduled' ? 
                            `<button onclick="enterScore(${match.id})" class="btn btn-sm btn-primary">Enter Score</button>` : 
                            `<button onclick="viewMatch(${match.id})" class="btn btn-sm btn-ghost">View</button>`
                        }
                    </td>
                </tr>
            `).join('');
        } else {
            matchesBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-8">
                        No matches yet. Click "Generate Bracket" to create fixtures.
                    </td>
                </tr>
            `;
        }
        
    } catch (error) {
        console.error('Failed to load tournament:', error);
        alert('Error loading tournament details');
    }
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

function getMatchStatusClass(status) {
    const classes = {
        'scheduled': 'badge-info',
        'in_progress': 'badge-warning',
        'completed': 'badge-success',
        'postponed': 'badge-outline',
        'cancelled': 'badge-error'
    };
    return classes[status] || 'badge-outline';
}

async function generateBracket() {
    if (!confirm('Generate bracket? This will create all tournament matches.')) {
        return;
    }
    
    try {
        const response = await fetch(`<?= url('/api/tournaments/') ?>${TOURNAMENT_ID}/generate-bracket`, {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`Bracket generated! ${result.matches_created} matches created.`);
            loadTournament(); // Reload
        } else {
            alert(`Error: ${result.error || 'Failed'}`);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function scheduleMatches() {
    const startDate = prompt('Start date (YYYY-MM-DD):');
    if (!startDate) return;
    
    try {
        const response = await fetch(`<?= url('/api/tournaments/') ?>${TOURNAMENT_ID}/schedule-matches`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                start_date: startDate,
                matches_per_day: 4,
                play_days: 'Saturday,Sunday'
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`Scheduled ${result.scheduled} matches from ${result.start_date} to ${result.end_date}`);
            loadTournament();
        } else {
            alert(`Error: ${result.message || 'Failed'}`);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function enterScore(matchId) {
    const scoreHome = prompt('Home team score:');
    if (scoreHome === null) return;
    
    const scoreAway = prompt('Away team score:');
    if (scoreAway === null) return;
    
    try {
        const response = await fetch(`<?= url('/api/matches/') ?>${matchId}/result`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                score_home: parseInt(scoreHome),
                score_away: parseInt(scoreAway)
            })
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`Score updated: ${result.score}`);
            loadTournament();
        } else {
            alert(`Error: ${result.error || 'Failed'}`);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function viewMatch(matchId) {
    // TODO: Open match detail modal
    alert('Match detail view - coming soon');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load on page ready
loadTournament();
</script>
