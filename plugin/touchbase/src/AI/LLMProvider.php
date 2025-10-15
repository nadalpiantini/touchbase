<?php
declare(strict_types=1);

namespace TouchBase\AI;

/**
 * LLM Provider Interface
 * Abstraction for different LLM backends (DeepSeek, Claude, GPT, etc.)
 */
interface LLMProvider
{
    /**
     * Send chat completion request
     *
     * @param array<array{role: string, content: string}> $messages Chat messages
     * @param array<string, mixed> $opts Optional parameters (temperature, max_tokens, etc.)
     * @return array{content: string, tokens?: int, model?: string} Response
     */
    public function chat(array $messages, array $opts = []): array;

    /**
     * Get provider name
     *
     * @return string Provider identifier
     */
    public function getProviderName(): string;

    /**
     * Check if provider is available/configured
     *
     * @return bool
     */
    public function isAvailable(): bool;
}
