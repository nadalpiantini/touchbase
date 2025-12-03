# Task ID: 9

**Title:** AI Integration: Player Coach, Teacher Assistant & Adaptive Learning

**Status:** pending

**Dependencies:** 7

**Priority:** low

**Description:** Build AI Gateway via Cloud Functions, player AI coach chat, teacher AI assistant for lesson planning, and adaptive learning engine with safety filters

**Details:**

1. Create AI Gateway Cloud Function (OpenAI/Gemini integration)
2. Build player AI coach chat interface (contextual hints, explanations, reflection prompts)
3. Implement teacher AI assistant (generate discussion prompts, lesson plans, adaptations)
4. Create adaptive learning engine (personalized content recommendations)
5. Add safety filters (content moderation, age-appropriate tone)
6. Implement opt-out controls for AI features
7. Add rate limiting and usage tracking

API Routes: /api/ai/coach, /api/ai/explanation, /api/ai/hint
Cloud Functions: ai-gateway (with guardrails, rate limiting)
Safety: Content filters, moderation API integration

**Test Strategy:**

Test AI responses, verify safety filters, test rate limiting, validate adaptive recommendations, and check opt-out functionality
