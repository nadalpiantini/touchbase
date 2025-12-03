"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { supabaseClient } from "@/lib/supabase/client";
import { callAIGateway } from "@/lib/services/ai";

interface AICoachProps {
  moduleTitle: string;
  stepContent: string;
  question?: string;
}

export default function AICoach({ moduleTitle, stepContent, question }: AICoachProps) {
  const t = useTranslations("student.aiCoach");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const supabase = supabaseClient!;
      const context = `You are a helpful educational coach for TouchBase Academy. The student is learning about "${moduleTitle}". Current step content: ${stepContent}${question ? `\nCurrent question: ${question}` : ""}`;
      
      const result = await callAIGateway(supabase, {
        prompt: userMessage,
        context,
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

  const handleGetHint = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const supabase = supabaseClient!;
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleTitle,
          stepContent,
          question,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.hint },
        ]);
        setIsOpen(true);
      }
    } catch (error: any) {
      console.error("Failed to get hint:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-[--color-tb-red] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition"
          aria-label={t('openCoach')}
        >
          <span className="text-2xl">🤖</span>
        </Button>
        {question && (
          <Button
            onClick={handleGetHint}
            disabled={loading}
            className="mt-2 bg-[--color-tb-navy] text-white rounded-full p-3 shadow-lg hover:shadow-xl transition block w-full"
          >
            {t('getHint')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] z-50 flex flex-col shadow-2xl">
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
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-[--color-tb-shadow] py-8">
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
                      ? "bg-[--color-tb-red] text-white"
                      : "bg-[--color-tb-beige] text-[--color-tb-navy]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[--color-tb-beige] rounded-lg p-3">
                {t('thinking')}...
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={t('typeMessage')}
            className="flex-1 px-4 py-2 border border-[--color-tb-line] rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-tb-stitch]/60 focus:border-[--color-tb-stitch] font-sans transition"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-[--color-tb-red] text-white"
          >
            {t('send')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

