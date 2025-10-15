<?php
use function TouchBase\__;
$tenant = $tenant ?? ['code' => 'DEFAULT', 'name' => '', 'logo_url' => '', 'color1' => '#0284c7', 'color2' => '#16a34a', 'color3' => '#ea580c', 'color4' => '#dc2626', 'theme' => 'dark'];
?>

<div class="grid" style="grid-template-columns: 1fr; gap: var(--space-6)">
    <div class="card">
        <h2 class="section-title"><?= __('settings.branding') ?></h2>

        <?php if (isset($_SESSION['flash_message'])): ?>
            <div class="alert alert-success" style="padding: var(--space-3); margin-bottom: var(--space-4); background: var(--brand-2); color: #072b12; border-radius: var(--radius)">
                <?= htmlspecialchars($_SESSION['flash_message']) ?>
            </div>
            <?php unset($_SESSION['flash_message']); ?>
        <?php endif; ?>

        <form method="POST" action="<?= BASE_PATH ?>/settings" enctype="multipart/form-data">
            <!-- Tenant Identity -->
            <div class="form-section" style="margin-bottom: var(--space-6)">
                <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-3)"><?= __('settings.identity') ?></h3>

                <div class="form-group" style="margin-bottom: var(--space-4)">
                    <label for="code" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                        <?= __('settings.tenant_code') ?>
                    </label>
                    <input type="text" id="code" name="code" class="input"
                           value="<?= htmlspecialchars($tenant['code']) ?>"
                           placeholder="DEFAULT"
                           style="width: 100%; max-width: 300px"
                           required>
                    <p class="form-help" style="margin-top: var(--space-2); font-size: 14px; color: var(--muted)">
                        <?= __('settings.code_help') ?>
                    </p>
                </div>

                <div class="form-group" style="margin-bottom: var(--space-4)">
                    <label for="name" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                        <?= __('settings.league_name') ?>
                    </label>
                    <input type="text" id="name" name="name" class="input"
                           value="<?= htmlspecialchars($tenant['name']) ?>"
                           placeholder="My Baseball League"
                           style="width: 100%"
                           required>
                </div>
            </div>

            <!-- Logo -->
            <div class="form-section" style="margin-bottom: var(--space-6)">
                <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-3)"><?= __('settings.logo') ?></h3>

                <?php if (!empty($tenant['logo_url'])): ?>
                    <div style="margin-bottom: var(--space-4)">
                        <img src="<?= htmlspecialchars($tenant['logo_url']) ?>" alt="Current logo"
                             style="max-width: 200px; max-height: 80px; border-radius: 8px; border: 1px solid var(--border)">
                    </div>
                <?php endif; ?>

                <div class="form-group" style="margin-bottom: var(--space-4)">
                    <label for="logo" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                        <?= __('settings.upload_logo') ?>
                    </label>
                    <input type="file" id="logo" name="logo" accept="image/png,image/jpeg,image/svg+xml,image/webp" class="input">
                    <p class="form-help" style="margin-top: var(--space-2); font-size: 14px; color: var(--muted)">
                        <?= __('settings.logo_help') ?>
                    </p>
                </div>

                <div class="form-group">
                    <label for="logo_url" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                        <?= __('settings.or_logo_url') ?>
                    </label>
                    <input type="url" id="logo_url" name="logo_url" class="input"
                           value="<?= htmlspecialchars($tenant['logo_url'] ?? '') ?>"
                           placeholder="https://example.com/logo.png"
                           style="width: 100%">
                </div>
            </div>

            <!-- Colors -->
            <div class="form-section" style="margin-bottom: var(--space-6)">
                <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-3)"><?= __('settings.brand_colors') ?></h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4)">
                    <div class="form-group">
                        <label for="color1" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                            <?= __('settings.color_primary') ?>
                        </label>
                        <div style="display: flex; align-items: center; gap: var(--space-2)">
                            <input type="color" id="color1" name="color1" value="<?= htmlspecialchars($tenant['color1']) ?>"
                                   style="width: 50px; height: 40px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer">
                            <input type="text" value="<?= htmlspecialchars($tenant['color1']) ?>" class="input"
                                   style="flex: 1" readonly
                                   onclick="document.getElementById('color1').click()">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="color2" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                            <?= __('settings.color_secondary') ?>
                        </label>
                        <div style="display: flex; align-items: center; gap: var(--space-2)">
                            <input type="color" id="color2" name="color2" value="<?= htmlspecialchars($tenant['color2']) ?>"
                                   style="width: 50px; height: 40px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer">
                            <input type="text" value="<?= htmlspecialchars($tenant['color2']) ?>" class="input"
                                   style="flex: 1" readonly
                                   onclick="document.getElementById('color2').click()">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="color3" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                            <?= __('settings.color_accent') ?>
                        </label>
                        <div style="display: flex; align-items: center; gap: var(--space-2)">
                            <input type="color" id="color3" name="color3" value="<?= htmlspecialchars($tenant['color3']) ?>"
                                   style="width: 50px; height: 40px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer">
                            <input type="text" value="<?= htmlspecialchars($tenant['color3']) ?>" class="input"
                                   style="flex: 1" readonly
                                   onclick="document.getElementById('color3').click()">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="color4" class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                            <?= __('settings.color_error') ?>
                        </label>
                        <div style="display: flex; align-items: center; gap: var(--space-2)">
                            <input type="color" id="color4" name="color4" value="<?= htmlspecialchars($tenant['color4']) ?>"
                                   style="width: 50px; height: 40px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer">
                            <input type="text" value="<?= htmlspecialchars($tenant['color4']) ?>" class="input"
                                   style="flex: 1" readonly
                                   onclick="document.getElementById('color4').click()">
                        </div>
                    </div>
                </div>

                <p class="form-help" style="margin-top: var(--space-3); font-size: 14px; color: var(--muted)">
                    <?= __('settings.colors_help') ?>
                </p>
            </div>

            <!-- Theme -->
            <div class="form-section" style="margin-bottom: var(--space-6)">
                <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-3)"><?= __('settings.theme') ?></h3>

                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: var(--space-2); font-weight: 600">
                        <?= __('settings.theme_mode') ?>
                    </label>

                    <div style="display: flex; gap: var(--space-3)">
                        <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer">
                            <input type="radio" name="theme" value="dark" <?= ($tenant['theme'] ?? 'dark') === 'dark' ? 'checked' : '' ?>>
                            <span><?= __('settings.dark_mode') ?></span>
                        </label>

                        <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer">
                            <input type="radio" name="theme" value="light" <?= ($tenant['theme'] ?? 'dark') === 'light' ? 'checked' : '' ?>>
                            <span><?= __('settings.light_mode') ?></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="form-actions" style="display: flex; gap: var(--space-3); justify-content: flex-end; padding-top: var(--space-4); border-top: 1px solid var(--border)">
                <a href="<?= BASE_PATH ?>/" class="btn btn-secondary"><?= __('common.cancel') ?></a>
                <button type="submit" class="btn btn-primary"><?= __('common.save') ?></button>
            </div>
        </form>
    </div>
</div>

<script>
// Sync color input with text display
document.querySelectorAll('input[type="color"]').forEach(input => {
    input.addEventListener('input', function() {
        const textInput = this.nextElementSibling;
        if (textInput) {
            textInput.value = this.value;
        }
    });
});
</script>
