<?php
declare(strict_types=1);

namespace TouchBase\AI;

use TouchBase\Database;

/**
 * Coach Assistant Service
 * Provides AI-powered coaching insights grounded in team data (RAG-lite)
 */
final class CoachAssistant
{
    private LLMProvider $llm;
    private int $maxContextTokens;

    public function __construct(LLMProvider $llm, int $maxContextTokens = 2048)
    {
        $this->llm = $llm;
        $this->maxContextTokens = $maxContextTokens;
    }

    /**
     * Ask a coaching question with team context
     *
     * @param string $question User's question
     * @param array<string, mixed> $context Optional context (team_id, season_id, etc.)
     * @return string AI response
     */
    public function ask(string $question, array $context = []): string
    {
        // Gather relevant data for context (RAG-lite)
        $teamId = (int) ($context['team_id'] ?? 0);
        $seasonId = (int) ($context['season_id'] ?? 0);
        $dataContext = $this->buildContext($teamId, $seasonId);

        // Build system prompt with guardrails
        $systemPrompt = $this->buildSystemPrompt($dataContext);

        // Build user prompt with question and context
        $userPrompt = $this->buildUserPrompt($question, $dataContext);

        // Call LLM
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userPrompt],
        ];

        $response = $this->llm->chat($messages, [
            'temperature' => 0.7,
            'max_tokens' => 512,
        ]);

        return $response['content'] ?? '[No response generated]';
    }

    /**
     * Build system prompt with guardrails
     *
     * @param string $dataContext Formatted data context
     * @return string System prompt
     */
    private function buildSystemPrompt(string $dataContext): string
    {
        return <<<PROMPT
You are a professional baseball coaching assistant. Your role is to provide actionable, data-driven insights to help coaches improve team performance.

## Guidelines:
- Answer concisely and focus on practical actions
- Base recommendations on the provided team data
- If data is insufficient, ask clarifying questions
- Never invent statistics or fake data
- Focus on skill development, strategy, and team dynamics
- Use coaching terminology appropriately (OBP, ERA, WHIP, etc.)
- Be supportive and constructive

## Data Context:
{$dataContext}

## Restrictions:
- Do not share personal information about players
- Do not make medical recommendations
- Do not guarantee specific outcomes
- Stay focused on baseball coaching topics
PROMPT;
    }

    /**
     * Build user prompt with question and context
     *
     * @param string $question User's question
     * @param string $dataContext Formatted data context
     * @return string User prompt
     */
    private function buildUserPrompt(string $question, string $dataContext): string
    {
        return "Question: {$question}";
    }

    /**
     * Build context from team data (RAG-lite)
     *
     * @param int $teamId Team ID
     * @param int $seasonId Season ID
     * @return string Formatted context
     */
    private function buildContext(int $teamId, int $seasonId): string
    {
        $context = [];

        // Team stats summary
        if ($teamId > 0) {
            $stats = Database::fetchAll(
                'SELECT metric, AVG(value) as avg_value, COUNT(*) as count
                 FROM pelota_stats
                 WHERE team_id = ?
                 GROUP BY metric
                 LIMIT 20',
                [$teamId]
            );

            if (!empty($stats)) {
                $context[] = "Team Statistics:";
                foreach ($stats as $stat) {
                    $context[] = sprintf(
                        "  - %s: %.2f (n=%d)",
                        $stat['metric'],
                        $stat['avg_value'],
                        $stat['count']
                    );
                }
            }
        }

        // Attendance summary
        if ($teamId > 0) {
            $attendance = Database::fetchOne(
                'SELECT
                    COUNT(*) as total_events,
                    SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present_count,
                    SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent_count,
                    ROUND(100.0 * SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) / COUNT(*), 1) as attendance_rate
                 FROM pelota_attendance
                 WHERE team_id = ?',
                [$teamId]
            );

            if ($attendance && $attendance['total_events'] > 0) {
                $context[] = "\nAttendance:";
                $context[] = sprintf(
                    "  - Rate: %s%% (%d/%d events)",
                    $attendance['attendance_rate'],
                    $attendance['present_count'],
                    $attendance['total_events']
                );
            }
        }

        // Recent schedule/games
        if ($teamId > 0) {
            $upcoming = Database::fetchAll(
                'SELECT event_type, opponent, venue, start_time
                 FROM pelota_schedule
                 WHERE team_id = ? AND start_time >= NOW()
                 ORDER BY start_time ASC
                 LIMIT 5',
                [$teamId]
            );

            if (!empty($upcoming)) {
                $context[] = "\nUpcoming Events:";
                foreach ($upcoming as $event) {
                    $context[] = sprintf(
                        "  - %s vs %s at %s (%s)",
                        $event['event_type'],
                        $event['opponent'] ?? 'TBD',
                        $event['venue'] ?? 'TBD',
                        date('M j', strtotime($event['start_time']))
                    );
                }
            }
        }

        return !empty($context)
            ? implode("\n", $context)
            : "No team data available. Please specify team_id in context.";
    }

    /**
     * Get conversation history for multi-turn chat
     *
     * @param int $userId User ID
     * @param int $limit Max history items
     * @return array<array{role: string, content: string}>
     */
    public function getHistory(int $userId, int $limit = 10): array
    {
        // Implementation note: Requires tb_ai_conversations table
        // CREATE TABLE tb_ai_conversations (
        //     id INT AUTO_INCREMENT PRIMARY KEY,
        //     user_id INT NOT NULL,
        //     role VARCHAR(10) NOT NULL,
        //     content TEXT NOT NULL,
        //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        //     INDEX idx_user (user_id, created_at)
        // );

        try {
            $history = Database::fetchAll(
                'SELECT role, content
                 FROM tb_ai_conversations
                 WHERE user_id = ?
                 ORDER BY created_at DESC
                 LIMIT ?',
                [$userId, $limit]
            );
            return array_reverse($history);
        } catch (\Exception $e) {
            // Table might not exist yet
            return [];
        }
    }

    /**
     * Save conversation turn
     *
     * @param int $userId User ID
     * @param string $question User question
     * @param string $answer Assistant answer
     * @return void
     */
    public function saveConversation(int $userId, string $question, string $answer): void
    {
        try {
            // Save user question
            Database::execute(
                'INSERT INTO tb_ai_conversations (user_id, role, content) VALUES (?, ?, ?)',
                [$userId, 'user', $question]
            );

            // Save assistant answer
            Database::execute(
                'INSERT INTO tb_ai_conversations (user_id, role, content) VALUES (?, ?, ?)',
                [$userId, 'assistant', $answer]
            );
        } catch (\Exception $e) {
            // Table might not exist yet - log error but don't fail
            error_log('Failed to save conversation: ' . $e->getMessage());
        }
    }
}
