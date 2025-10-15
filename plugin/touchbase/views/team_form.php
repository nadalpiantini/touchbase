<?php
use function TouchBase\__;

$isEdit = ($mode ?? 'create') === 'edit';
$teamId = $id ?? null;
?>

<div class="card">
    <h1><?= $isEdit ? e(__('team.edit')) : e(__('team.create')) ?></h1>

    <form id="team-form" style="margin-top: 1.5rem;">
        <div class="form-group">
            <label for="club_id"><?= e(__('team.club')) ?> *</label>
            <input type="number" id="club_id" name="club_id" required value="1">
            <small style="color: #6b7280;">Club ID (temporary - will be replaced with dropdown)</small>
        </div>

        <div class="form-group">
            <label for="season_id"><?= e(__('team.season')) ?> *</label>
            <input type="number" id="season_id" name="season_id" required value="1">
            <small style="color: #6b7280;">Season ID (temporary - will be replaced with dropdown)</small>
        </div>

        <div class="form-group">
            <label for="name"><?= e(__('team.name')) ?> *</label>
            <input type="text" id="name" name="name" required placeholder="e.g., Tigers U12">
        </div>

        <div class="form-group">
            <label for="category"><?= e(__('team.category')) ?> *</label>
            <select id="category" name="category" required>
                <option value=""><?= e(__('form.select_option')) ?></option>
                <option value="U8">U8 (Under 8)</option>
                <option value="U10">U10 (Under 10)</option>
                <option value="U12">U12 (Under 12)</option>
                <option value="U14">U14 (Under 14)</option>
                <option value="U16">U16 (Under 16)</option>
                <option value="U18">U18 (Under 18)</option>
                <option value="Senior">Senior</option>
            </select>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">
                <?= e(__('action.save')) ?>
            </button>
            <a href="<?= url('/teams') ?>" class="btn btn-secondary">
                <?= e(__('action.cancel')) ?>
            </a>
        </div>
    </form>
</div>

<script>
const isEdit = <?= json_encode($isEdit) ?>;
const teamId = <?= json_encode($teamId) ?>;

if (isEdit && teamId) {
    loadTeamData();
}

async function loadTeamData() {
    try {
        const res = await fetch(`<?= url('/api/teams/') ?>${teamId}`);
        const data = await res.json();

        if (data.success && data.data) {
            document.getElementById('club_id').value = data.data.club_id;
            document.getElementById('season_id').value = data.data.season_id;
            document.getElementById('name').value = data.data.name;
            document.getElementById('category').value = data.data.category;
        }
    } catch (err) {
        console.error('Failed to load team:', err);
        alert('Error loading team data');
    }
}

document.getElementById('team-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        club_id: document.getElementById('club_id').value,
        season_id: document.getElementById('season_id').value,
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
    };

    try {
        const url = isEdit
            ? `<?= url('/api/teams/') ?>${teamId}`
            : '<?= url('/api/teams') ?>';

        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            window.location.href = '<?= url('/teams') ?>';
        } else {
            alert(data.message || 'Error saving team');
        }
    } catch (err) {
        console.error('Failed to save team:', err);
        alert('Error saving team');
    }
});
</script>
