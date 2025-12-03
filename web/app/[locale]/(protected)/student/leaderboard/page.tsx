"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { LeaderboardEntry, LeaderboardType } from "@/lib/services/leaderboards";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";

export default function StudentLeaderboardPage() {
  const t = useTranslations("student.leaderboard");
  const { currentOrg } = useCurrentOrg();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [type, setType] = useState<LeaderboardType>("xp");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadLeaderboard();
    }
  }, [currentOrg, type]);

  const loadLeaderboard = async () => {
    if (!currentOrg?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/leaderboards/org?orgId=${currentOrg.id}&type=${type}`);
      const json = await res.json();

      if (res.ok) {
        setLeaderboard(json.leaderboard || []);
      } else {
        setError(json.error || t('errors.loadFailed'));
      }
    } catch (e: any) {
      setError(e.message || t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {/* Type Selector */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            type === "xp"
              ? "bg-[--color-tb-red] text-white"
              : "bg-white text-[--color-tb-navy] border border-[--color-tb-line] hover:bg-[--color-tb-beige]"
          }`}
          onClick={() => setType("xp")}
        >
          {t('tabs.xp')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            type === "streak"
              ? "bg-[--color-tb-red] text-white"
              : "bg-white text-[--color-tb-navy] border border-[--color-tb-line] hover:bg-[--color-tb-beige]"
          }`}
          onClick={() => setType("streak")}
        >
          {t('tabs.streak')}
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium transition ${
            type === "modules"
              ? "bg-[--color-tb-red] text-white"
              : "bg-white text-[--color-tb-navy] border border-[--color-tb-line] hover:bg-[--color-tb-beige]"
          }`}
          onClick={() => setType("modules")}
        >
          {t('tabs.modules')}
        </button>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>{t('leaderboardTitle', { type: t(`tabs.${type}`) })}</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-[--color-tb-shadow]">
              {t('noEntries')}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className="flex items-center justify-between p-4 bg-[--color-tb-beige]/50 rounded-lg hover:bg-[--color-tb-beige] transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-[--color-tb-navy] w-12 text-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <div className="font-semibold text-[--color-tb-navy]">
                        {entry.user_name || entry.user_email || "Anonymous"}
                      </div>
                      <div className="text-sm text-[--color-tb-shadow]">
                        Level {entry.level}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {type === "xp" && (
                      <Badge variant="info">{entry.total_xp} XP</Badge>
                    )}
                    {type === "streak" && (
                      <Badge variant="info">🔥 {entry.current_streak} {t('days')}</Badge>
                    )}
                    {type === "modules" && (
                      <Badge variant="info">{entry.modules_completed} {t('modules')}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

