<?php
declare(strict_types=1);

namespace TouchBase;

/**
 * Internationalization helper
 * Handles translation lookups with fallback support
 */
final class I18n
{
    private static ?string $currentLang = null;
    private static array $translations = [];

    /**
     * Initialize i18n system with language detection
     */
    public static function init(): void
    {
        self::$currentLang = self::detectLanguage();
        self::loadTranslations(self::$currentLang);
    }

    /**
     * Detect user language from multiple sources
     * Priority: Session > Cookie > Browser > Default
     *
     * @return string Language code (e.g., 'en', 'es')
     */
    private static function detectLanguage(): string
    {
        $supported = Config::supportedLanguages();

        // Check session
        if (isset($_SESSION['touchbase_lang']) && in_array($_SESSION['touchbase_lang'], $supported)) {
            return $_SESSION['touchbase_lang'];
        }

        // Check cookie
        if (isset($_COOKIE['touchbase_lang']) && in_array($_COOKIE['touchbase_lang'], $supported)) {
            return $_COOKIE['touchbase_lang'];
        }

        // Check browser Accept-Language header
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            $browserLang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
            if (in_array($browserLang, $supported)) {
                return $browserLang;
            }
        }

        // Fallback to default
        return DEFAULT_LANG;
    }

    /**
     * Load translation file for given language
     *
     * @param string $lang Language code
     */
    private static function loadTranslations(string $lang): void
    {
        $file = TOUCHBASE_BASE . "/lang/{$lang}.php";

        if (file_exists($file)) {
            self::$translations[$lang] = require $file;
        }

        // Always load default language as fallback
        if ($lang !== DEFAULT_LANG) {
            $defaultFile = TOUCHBASE_BASE . '/lang/' . DEFAULT_LANG . '.php';
            if (file_exists($defaultFile)) {
                self::$translations[DEFAULT_LANG] = require $defaultFile;
            }
        }
    }

    /**
     * Translate a key with optional parameter substitution
     *
     * @param string $key Translation key
     * @param array<string, mixed> $params Parameters for interpolation
     * @return string Translated string
     */
    public static function translate(string $key, array $params = []): string
    {
        if (self::$currentLang === null) {
            self::init();
        }

        // Try current language
        $text = self::$translations[self::$currentLang][$key]
            ?? self::$translations[DEFAULT_LANG][$key]
            ?? $key;

        // Replace parameters
        foreach ($params as $k => $v) {
            $text = str_replace("{{$k}}", (string) $v, $text);
        }

        return $text;
    }

    /**
     * Get current active language
     *
     * @return string
     */
    public static function getCurrentLang(): string
    {
        if (self::$currentLang === null) {
            self::init();
        }

        return self::$currentLang;
    }

    /**
     * Set language manually
     *
     * @param string $lang Language code
     * @return bool Success
     */
    public static function setLanguage(string $lang): bool
    {
        if (!in_array($lang, Config::supportedLanguages())) {
            return false;
        }

        self::$currentLang = $lang;
        self::loadTranslations($lang);

        // Persist in session and cookie
        $_SESSION['touchbase_lang'] = $lang;
        setcookie('touchbase_lang', $lang, time() + (365 * 24 * 60 * 60), '/');

        return true;
    }
}

/**
 * Global translation helper function
 *
 * @param string $key Translation key
 * @param array<string, mixed> $params Parameters for interpolation
 * @return string
 */
function __(string $key, array $params = []): string
{
    return I18n::translate($key, $params);
}
