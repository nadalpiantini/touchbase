<?php
declare(strict_types=1);

namespace TouchBase\Utils;

/**
 * Input validation and sanitization utilities
 */
final class Validator
{
    /**
     * Validate and sanitize integer
     *
     * @param mixed $value
     * @param int $min Minimum value
     * @param int|null $max Maximum value
     * @return int|null
     */
    public static function int(mixed $value, int $min = 1, ?int $max = null): ?int
    {
        if (!is_numeric($value)) {
            return null;
        }

        $int = (int) $value;

        if ($int < $min) {
            return null;
        }

        if ($max !== null && $int > $max) {
            return null;
        }

        return $int;
    }

    /**
     * Validate and sanitize string
     *
     * @param mixed $value
     * @param int $minLength
     * @param int $maxLength
     * @return string|null
     */
    public static function string(mixed $value, int $minLength = 0, int $maxLength = 255): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $str = trim($value);
        $len = mb_strlen($str);

        if ($len < $minLength || $len > $maxLength) {
            return null;
        }

        return $str;
    }

    /**
     * Validate email address
     *
     * @param mixed $value
     * @return string|null
     */
    public static function email(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $email = filter_var(trim($value), FILTER_VALIDATE_EMAIL);

        return $email !== false ? $email : null;
    }

    /**
     * Validate date in Y-m-d format
     *
     * @param mixed $value
     * @return string|null
     */
    public static function date(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $date = \DateTime::createFromFormat('Y-m-d', $value);

        return $date && $date->format('Y-m-d') === $value ? $value : null;
    }

    /**
     * Validate datetime in Y-m-d H:i:s format
     *
     * @param mixed $value
     * @return string|null
     */
    public static function datetime(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $datetime = \DateTime::createFromFormat('Y-m-d H:i:s', $value);

        return $datetime && $datetime->format('Y-m-d H:i:s') === $value ? $value : null;
    }

    /**
     * Validate value is in allowed list
     *
     * @param mixed $value
     * @param array<string> $allowed
     * @return string|null
     */
    public static function enum(mixed $value, array $allowed): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        return in_array($value, $allowed, true) ? $value : null;
    }

    /**
     * Sanitize HTML to prevent XSS
     *
     * @param string $value
     * @return string
     */
    public static function sanitizeHtml(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Sanitize filename to prevent directory traversal
     *
     * @param string $filename
     * @return string
     */
    public static function sanitizeFilename(string $filename): string
    {
        // Remove path separators
        $filename = str_replace(['/', '\\', '..'], '', $filename);

        // Remove special characters
        $filename = preg_replace('/[^a-zA-Z0-9_.-]/', '', $filename);

        return $filename;
    }

    /**
     * Validate array has required keys
     *
     * @param array<string, mixed> $data
     * @param array<string> $required
     * @return bool
     */
    public static function hasRequired(array $data, array $required): bool
    {
        foreach ($required as $key) {
            if (!isset($data[$key]) || $data[$key] === '' || $data[$key] === null) {
                return false;
            }
        }

        return true;
    }
}
