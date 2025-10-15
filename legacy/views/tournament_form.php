<?php
/**
 * Tournament Form View
 * Create/Edit tournament
 */

use function TouchBase\__;
use function TouchBase\url;
use function TouchBase\e;

$mode = $mode ?? 'create';
$tournamentId = $id ?? 0;
$isEdit = $mode === 'edit';
?>

<div class="mb-6">
    <a href="<?= url('/tournaments') ?>" class="btn btn-ghost">
        ← Back to Tournaments
    </a>
</div>

<div class="card max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">
        <?= $isEdit ? e(__('tournament.edit')) : e(__('tournament.create')) ?>
    </h1>

    <form id="tournament-form" class="grid gap-4">
        <div class="form-group">
            <label class="form-label form-label-required">
                <?= e(__('tournament.name')) ?>
            </label>
            <input 
                type="text" 
                name="name" 
                class="form-input" 
                placeholder="e.g., Spring Championship 2025"
                required
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
                <label class="form-label form-label-required">
                    <?= e(__('team.season')) ?>
                </label>
                <select name="season_id" class="form-select" required id="season-select">
                    <option value="">Loading...</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label form-label-required">
                    <?= e(__('tournament.format')) ?>
                </label>
                <select name="format" class="form-select" required>
                    <option value="round_robin"><?= e(__('tournament.format.round_robin')) ?></option>
                    <option value="knockout"><?= e(__('tournament.format.knockout')) ?></option>
                    <option value="groups_knockout"><?= e(__('tournament.format.groups_knockout')) ?></option>
                    <option value="double_elimination"><?= e(__('tournament.format.double_elimination')) ?></option>
                </select>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" name="start_date" class="form-input" />
            </div>

            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="date" name="end_date" class="form-input" />
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-textarea" rows="3" 
                      placeholder="Tournament details and rules..."></textarea>
        </div>

        <div class="card-footer mt-6">
            <button type="button" onclick="history.back()" class="btn btn-outline">
                Cancel
            </button>
            <button type="submit" class="btn btn-primary">
                <?= $isEdit ? 'Update Tournament' : 'Create Tournament' ?>
            </button>
        </div>
    </form>
</div>

<script>
async function loadSeasons() {
    try {
        // Get seasons from teams endpoint
        const response = await fetch('<?= url('/api/teams') ?>');
        const result = await response.json();
        
        if (result.success && result.data) {
            const seasonSet = new Map();
            result.data.forEach(team => {
                if (team.season_id && team.season_name) {
                    seasonSet.set(team.season_id, team.season_name);
                }
            });
            
            const seasons = Array.from(seasonSet, ([id, name]) => ({id, name}));
            const select = document.getElementById('season-select');
            
            if (seasons.length > 0) {
                select.innerHTML = seasons.map(s => 
                    `<option value="${s.id}">${escapeHtml(s.name)}</option>`
                ).join('');
            } else {
                select.innerHTML = '<option value="">No seasons available</option>';
            }
        }
    } catch (error) {
        console.error('Failed to load seasons:', error);
    }
}

document.getElementById('tournament-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('<?= url('/api/tournaments') ?>', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Tournament created successfully!');
            window.location.href = `<?= url('/tournaments/') ?>${result.id}`;
        } else {
            alert(`Error: ${result.message || result.error || 'Failed to create tournament'}`);
        }
    } catch (error) {
        alert('Error creating tournament: ' + error.message);
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load seasons on page load
loadSeasons();
</script>
