<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\AI\{CoachAssistant, DeepSeekBedrock, LLMProvider};
use function TouchBase\__;

/**
 * AI Assistant Controller
 * Handles LLM-powered coaching assistant interactions
 */
final class AIController
{
    private LLMProvider $llm;
    private CoachAssistant $assistant;

    public function __construct(?LLMProvider $llm = null)
    {
        // Initialize LLM provider (DeepSeek via Bedrock)
        $this->llm = $llm ?? new DeepSeekBedrock(
            getenv('AWS_REGION') ?: 'us-east-2',
            getenv('DEEPSEEK_MODEL') ?: 'deepseek.r1',
            getenv('AWS_ACCESS_KEY_ID') ?: null,
            getenv('AWS_SECRET_ACCESS_KEY') ?: null
        );

        $this->assistant = new CoachAssistant($this->llm);
    }

    /**
     * Show assistant interface
     * GET /ai/assistant
     */
    public function index(Request $request): Response
    {
        $teamId = (int) ($request->get['team_id'] ?? 0);
        $answer = '';

        return new Response(view('assistant', [
            'teamId' => $teamId,
            'answer' => $answer,
            'providerAvailable' => $this->llm->isAvailable(),
            'providerName' => $this->llm->getProviderName(),
        ]));
    }

    /**
     * Ask coaching question
     * POST /ai/ask
     */
    public function ask(Request $request): Response
    {
        $question = $request->input('q', '');
        $teamId = (int) ($request->input('team_id') ?? 0);

        if (empty($question)) {
            return new Response(view('assistant', [
                'teamId' => $teamId,
                'answer' => '',
                'error' => __('error.question_required'),
                'providerAvailable' => $this->llm->isAvailable(),
                'providerName' => $this->llm->getProviderName(),
            ]));
        }

        // Get AI answer
        $answer = $this->assistant->ask($question, [
            'team_id' => $teamId,
        ]);

        return new Response(view('assistant', [
            'teamId' => $teamId,
            'question' => $question,
            'answer' => $answer,
            'providerAvailable' => $this->llm->isAvailable(),
            'providerName' => $this->llm->getProviderName(),
        ]));
    }

    /**
     * API endpoint for assistant chat
     * POST /api/ai/chat
     */
    public function chat(Request $request): Response
    {
        $question = $request->input('question', '');
        $teamId = (int) ($request->input('team_id') ?? 0);

        if (empty($question)) {
            return Response::error(__('error.question_required'), 400);
        }

        $answer = $this->assistant->ask($question, [
            'team_id' => $teamId,
        ]);

        return Response::json([
            'ok' => true,
            'question' => $question,
            'answer' => $answer,
            'provider' => $this->llm->getProviderName(),
        ]);
    }

    /**
     * Get suggested questions based on team context
     * GET /api/ai/suggestions
     */
    public function suggestions(Request $request): Response
    {
        $teamId = (int) ($request->get['team_id'] ?? 0);

        $suggestions = [
            'practice' => [
                'What drills should we focus on this week?',
                'How can we improve our batting practice?',
                'What conditioning exercises are recommended?',
            ],
            'strategy' => [
                'What batting order do you suggest?',
                'How should we prepare for the next opponent?',
                'What defensive shifts should we consider?',
            ],
            'performance' => [
                'Which players need extra attention?',
                'How can we improve team attendance?',
                'What are our key performance metrics?',
            ],
        ];

        return Response::json([
            'ok' => true,
            'suggestions' => $suggestions,
        ]);
    }
}
