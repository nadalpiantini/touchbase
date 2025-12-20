"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { supabaseClient } from "@/lib/supabase/client";
import { callAIGateway } from "@/lib/services/ai";

interface AIAssistantProps {
  context?: {
    classId?: string;
    moduleId?: string;
    studentId?: string;
  };
}

export default function AIAssistant({ context }: AIAssistantProps) {
  const t = useTranslations("teacher.aiAssistant");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const buildContext = () => {
    let ctx = "You are an AI assistant helping a teacher manage their classes and students on TouchBase Academy.";
    if (context?.classId) {
      ctx += ` The teacher is currently viewing class ${context.classId}.`;
    }
    if (context?.moduleId) {
      ctx += ` They are working with module ${context.moduleId}.`;
    }
    if (context?.studentId) {
      ctx += ` They are viewing student ${context.studentId}.`;
    }
    return ctx;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const supabase = supabaseClient!;
      const result = await callAIGateway(supabase, {
        prompt: userMessage,
        context: buildContext(),
        provider: "openai",
      });

      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t('errors.failed') || "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    if (loading) return;

    setLoading(true);
    const prompts: Record<string, string> = {
      createModule: t('quickActions.createModulePrompt'),
      analyzeProgress: t('quickActions.analyzeProgressPrompt'),
      suggestContent: t('quickActions.suggestContentPrompt'),
    };

    const prompt = prompts[action];
    if (!prompt) return;

    try {
      const supabase = supabaseClient!;
      const result = await callAIGateway(supabase, {
        prompt,
        context: buildContext(),
        provider: "openai",
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.response },
      ]);
      setIsOpen(true);
    } catch (error: any) {
      // Failed to execute quick action - handled by UI state
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-tb-navy text-white rounded-full p-4 shadow-lg hover:shadow-xl transition"
          aria-label={t('openAssistant')}
        >
          <span className="text-2xl">🤖</span>
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 left-4 sm:left-auto w-auto sm:w-96 h-[500px] z-50 flex flex-col shadow-2xl">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('title')}</CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="p-1 h-auto"
            aria-label={t('close')}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Quick Actions */}
        <div className="flex-shrink-0 mb-4 space-y-2">
          <p className="text-sm font-semibold text-tb-navy">{t('quickActions.title')}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleQuickAction("createModule")}
              disabled={loading}
              className="text-xs bg-tb-beige text-tb-navy hover:bg-tb-beige/80"
            >
              {t('quickActions.createModule')}
            </Button>
            <Button
              onClick={() => handleQuickAction("analyzeProgress")}
              disabled={loading}
              className="text-xs bg-tb-beige text-tb-navy hover:bg-tb-beige/80"
            >
              {t('quickActions.analyzeProgress')}
            </Button>
            <Button
              onClick={() => handleQuickAction("suggestContent")}
              disabled={loading}
              className="text-xs bg-tb-beige text-tb-navy hover:bg-tb-beige/80"
            >
              {t('quickActions.suggestContent')}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-tb-shadow py-8">
              <p className="mb-2">{t('welcome')}</p>
              <p className="text-sm">{t('askQuestion')}</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-tb-navy text-white"
                      : "bg-tb-beige text-tb-navy"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-tb-beige rounded-lg p-3">
                {t('thinking')}...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={t('typeMessage')}
            className="flex-1 px-4 py-2 border border-tb-line rounded-lg focus:outline-none focus:ring-2 focus:ring-tb-stitch/60 focus:border-tb-stitch font-sans transition"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-tb-navy text-white"
          >
            {t('send')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

