"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, ProgressBar, Badge } from "@/components/ui";
import { getUserXPSummary } from "@/lib/services/xp";
import { getUserStreak } from "@/lib/services/streaks";
import { SkillCategory, xpProgressToNextLevel } from "@/lib/types/gamification";
import { supabaseClient } from "@/lib/supabase/client";

export default function StudentSkillsPage() {
  const t = useTranslations("student.skills");
  const [loading, setLoading] = useState(true);
  const [xpSummary, setXpSummary] = useState<{
    totalXp: number;
    level: number;
    xpForNextLevel: number;
    xpProgress: number;
  } | null>(null);
  const [streak, setStreak] = useState<{
    current_streak: number;
    longest_streak: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadXPSummary();
  }, []);

  const loadXPSummary = async () => {
    try {
      const supabase = supabaseClient!;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError(t('errors.notAuthenticated'));
        return;
      }

      const [summary, streakData] = await Promise.all([
        getUserXPSummary(supabase, user.id),
        (async () => {
          const { data: profile } = await supabase
            .from("touchbase_profiles")
            .select("default_org_id")
            .eq("id", user.id)
            .single();
          
          if (profile?.default_org_id) {
            const { getUserStreak } = await import("@/lib/services/streaks");
            return await getUserStreak(supabase, user.id, profile.default_org_id);
          }
          return null;
        })(),
      ]);
      
      setXpSummary(summary);
      if (streakData) {
        setStreak({
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (error || !xpSummary) {
    return <div className="text-center py-12 text-red-600">{error || t('errors.loadFailed')}</div>;
  }

  const progress = xpProgressToNextLevel(xpSummary.totalXp, xpSummary.level);

  const skillCategories: SkillCategory[] = [
    "Communication",
    "Self-Management",
    "Decision-Making",
    "Collaboration",
    "Other",
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Overall Level Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('overallLevel')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-[--color-tb-red] mb-2">
                {xpSummary.level}
              </div>
              <div className="text-sm text-[--color-tb-shadow]">{t('level')}</div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm text-[--color-tb-shadow] mb-2">
                <span>{t('totalXp')}</span>
                <span className="font-semibold text-[--color-tb-navy]">
                  {xpSummary.totalXp} XP
                </span>
              </div>
              <ProgressBar value={progress.percentage} showLabel color="primary" />
              <div className="flex justify-between text-xs text-[--color-tb-shadow] mt-2">
                <span>
                  {progress.current} / {progress.required} {t('xpToNextLevel')}
                </span>
                <span>{t('nextLevel')} {xpSummary.level + 1}</span>
              </div>
            </div>
            {streak && (
              <div className="text-center">
                <div className="text-4xl font-bold text-[--color-tb-red] mb-2">
                  🔥 {streak.current_streak}
                </div>
                <div className="text-sm text-[--color-tb-shadow]">{t('dayStreak')}</div>
                <div className="text-xs text-[--color-tb-shadow] mt-1">
                  {t('longestStreak')}: {streak.longest_streak}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skill Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillCategories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category}</CardTitle>
                <Badge variant="info">Level 1</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-[--color-tb-shadow] mb-1">
                    <span>{t('xp')}</span>
                    <span className="font-semibold text-[--color-tb-navy]">0 XP</span>
                  </div>
                  <ProgressBar value={0} color="primary" />
                </div>
                <p className="text-xs text-[--color-tb-shadow]">
                  {t('skillDescription', { skill: category })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Achievements */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('recentAchievements')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[--color-tb-shadow]">
            {t('noAchievementsYet')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

