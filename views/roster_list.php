<?php use function TouchBase\__; ?>

<div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h1><?= e(__('roster.title')) ?></h1>
        <button onclick="showAddPlayerForm()" class="btn btn-primary">
            + <?= e(__('roster.add_player')) ?>
        </button>
    </div>
    <p style="color: #9ca3af; margin: 1rem 0;">
        Player roster management - Link players to teams with positions and numbers.
    </p>

    <!-- Add Player Form (hidden by default) -->
    <div id="add-player-form" style="display: none; margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
        <h3>Add Player to Roster</h3>
        <form id="roster-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label for="team_id">Team *</label>
                    <select id="team_id" name="team_id" required>
                        <option value="">Select Team</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="user_id">Player *</label>
                    <select id="user_id" name="user_id" required>
                        <option value="">Select Player</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                    <label for="number">Jersey Number</label>
                    <input type="number" id="number" name="number" min="1" max="99">
                </div>
                <div class="form-group">
                    <label for="position">Position</label>
                    <select id="position" name="position">
                        <option value="">Select Position</option>
                        <option value="P">Pitcher (P)</option>
                        <option value="C">Catcher (C)</option>
                        <option value="1B">First Base (1B)</option>
                        <option value="2B">Second Base (2B)</option>
                        <option value="3B">Third Base (3B)</option>
                        <option value="SS">Shortstop (SS)</option>
                        <option value="LF">Left Field (LF)</option>
                        <option value="CF">Center Field (CF)</option>
                        <option value="RF">Right Field (RF)</option>
                        <option value="DH">Designated Hitter (DH)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="notes">Notes</label>
                    <input type="text" id="notes" name="notes" placeholder="Optional notes">
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary">Add Player</button>
                <button type="button" onclick="hideAddPlayerForm()" class="btn btn-secondary">Cancel</button>
            </div>
        </form>
    </div>

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

// Load teams and users for dropdowns
async function loadTeams() {
    try {
        const res = await fetch('<?= url('/api/teams') ?>');
        const data = await res.json();
        
        const teamSelect = document.getElementById('team_id');
        teamSelect.innerHTML = '<option value="">Select Team</option>';
        
        if (data.success && data.data) {
            data.data.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = `${team.name} (${team.category})`;
                teamSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load teams:', err);
    }
}

async function loadUsers() {
    try {
        const res = await fetch('<?= url('/api/users') ?>');
        const data = await res.json();
        
        const userSelect = document.getElementById('user_id');
        userSelect.innerHTML = '<option value="">Select Player</option>';
        
        if (data.success && data.data) {
            data.data.forEach(user => {
                const option = document.createElement('option');
                option.value = user.user_id;
                option.textContent = `${user.firstname} ${user.lastname} (${user.username})`;
                userSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load users:', err);
    }
}

function showAddPlayerForm() {
    document.getElementById('add-player-form').style.display = 'block';
    loadTeams();
    loadUsers();
}

function hideAddPlayerForm() {
    document.getElementById('add-player-form').style.display = 'none';
    document.getElementById('roster-form').reset();
}

// Handle form submission
document.getElementById('roster-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        team_id: parseInt(document.getElementById('team_id').value),
        user_id: parseInt(document.getElementById('user_id').value),
        number: document.getElementById('number').value || null,
        position: document.getElementById('position').value || null,
        notes: document.getElementById('notes').value || null,
    };
    
    if (isNaN(formData.team_id) || isNaN(formData.user_id)) {
        alert('Please select a team and player');
        return;
    }
    
    try {
        const res = await fetch('<?= url('/api/roster') ?>', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        
        const data = await res.json();
        
        if (data.success) {
            alert('Player added to roster successfully!');
            hideAddPlayerForm();
            loadRoster(); // Reload roster
        } else {
            alert(data.message || 'Error adding player to roster');
        }
    } catch (err) {
        console.error('Failed to add player:', err);
        alert('Error adding player to roster');
    }
});

loadRoster();
</script>
