<?php
/**
 * AI Coach Assistant View
 * Interactive LLM-powered coaching insights
 */

use function TouchBase\__;

$pageTitle = __('ai.assistant_title');
$teamId = $teamId ?? 0;
$question = htmlspecialchars($question ?? '');
$answer = $answer ?? '';
$error = $error ?? null;
$providerAvailable = $providerAvailable ?? false;
$providerName = $providerName ?? 'Unknown';

ob_start();
?>

<div class="grid">
  <!-- Header -->
  <div class="card">
    <div class="flex-between">
      <div>
        <h1 class="title"><?= __('ai.assistant_title') ?></h1>
        <p class="text-muted"><?= __('ai.assistant_description') ?></p>
      </div>
      <div>
        <?php if ($providerAvailable): ?>
          <span class="badge badge-success"><?= __('ai.status_online') ?></span>
        <?php else: ?>
          <span class="badge badge-warning"><?= __('ai.status_offline') ?></span>
        <?php endif; ?>
        <p class="text-xs text-muted mt-1"><?= htmlspecialchars($providerName) ?></p>
      </div>
    </div>
  </div>

  <!-- Question Form -->
  <div class="card">
    <h2 class="section-title"><?= __('ai.ask_question') ?></h2>

    <?php if ($error): ?>
      <div class="card" style="background: var(--brand-4); color: white; margin-bottom: var(--space-4);">
        <?= htmlspecialchars($error) ?>
      </div>
    <?php endif; ?>

    <form method="post" action="<?= BASE_PATH ?>/ai/ask">
      <div class="form-group">
        <label class="label"><?= __('ai.team_context') ?></label>
        <select class="select" name="team_id">
          <option value="0"><?= __('ai.no_team_context') ?></option>
          <?php
          // Fetch teams for dropdown
          $teams = \TouchBase\Database::fetchAll('SELECT id, name FROM touchbase_teams ORDER BY name');
          foreach ($teams as $team):
          ?>
            <option value="<?= $team['id'] ?>" <?= $team['id'] == $teamId ? 'selected' : '' ?>>
              <?= htmlspecialchars($team['name']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="form-group">
        <label class="label"><?= __('ai.your_question') ?></label>
        <textarea
          class="textarea"
          name="q"
          rows="4"
          placeholder="<?= __('ai.question_placeholder') ?>"
          required
        ><?= $question ?></textarea>
      </div>

      <button type="submit" class="btn btn-primary">
        <span>💬</span> <?= __('ai.ask_button') ?>
      </button>
    </form>
  </div>

  <!-- Answer Display -->
  <?php if (!empty($answer)): ?>
    <div class="card">
      <h2 class="section-title"><?= __('ai.answer_title') ?></h2>

      <?php if (!empty($question)): ?>
        <div class="card" style="background: var(--bg-elevated); margin-bottom: var(--space-4);">
          <strong><?= __('ai.your_question') ?>:</strong>
          <p><?= nl2br(htmlspecialchars($question)) ?></p>
        </div>
      <?php endif; ?>

      <div style="line-height: var(--leading-relaxed);">
        <?= nl2br(htmlspecialchars($answer)) ?>
      </div>

      <p class="text-xs text-muted mt-4">
        <?= __('ai.disclaimer') ?>
      </p>
    </div>
  <?php endif; ?>

  <!-- Suggested Questions -->
  <div class="card">
    <h2 class="section-title"><?= __('ai.suggested_questions') ?></h2>
    <div class="grid grid-3">
      <div>
        <h3 class="subtitle"><?= __('ai.category_practice') ?></h3>
        <ul style="list-style: none; padding: 0;">
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_drills') ?>
          </a></li>
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_batting') ?>
          </a></li>
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_conditioning') ?>
          </a></li>
        </ul>
      </div>
      <div>
        <h3 class="subtitle"><?= __('ai.category_strategy') ?></h3>
        <ul style="list-style: none; padding: 0;">
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_lineup') ?>
          </a></li>
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_opponent') ?>
          </a></li>
        </ul>
      </div>
      <div>
        <h3 class="subtitle"><?= __('ai.category_performance') ?></h3>
        <ul style="list-style: none; padding: 0;">
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_players') ?>
          </a></li>
          <li><a href="#" class="text-sm" onclick="fillQuestion(this.innerText); return false;">
            <?= __('ai.suggest_attendance') ?>
          </a></li>
        </ul>
      </div>
    </div>
  </div>
</div>

<script>
function fillQuestion(text) {
  const textarea = document.querySelector('textarea[name="q"]');
  if (textarea) {
    textarea.value = text;
    textarea.focus();
  }
}
</script>

<?php
$content = ob_get_clean();
require __DIR__ . '/app_layout.php';
