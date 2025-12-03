"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { UserBadge } from "@/lib/types/badge";
import { useCurrentOrg } from "@/lib/hooks/useCurrentOrg";
import { supabaseClient } from "@/lib/supabase/client";

export default function StudentBadgesPage() {
  const t = useTranslations("student.badges");
  const { currentOrg } = useCurrentOrg();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrg?.id) {
      loadBadges();
    }
  }, [currentOrg]);

  const loadBadges = async () => {
    if (!currentOrg?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/badges/user?orgId=${currentOrg.id}`);
      const json = await res.json();

      if (res.ok) {
        setBadges(json.badges || []);
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

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, userBadge) => {
    const category = userBadge.badge?.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(userBadge);
    return acc;
  }, {} as Record<string, UserBadge[]>);

  const categoryLabels: Record<string, string> = {
    achievement: t('categories.achievement'),
    milestone: t('categories.milestone'),
    skill: t('categories.skill'),
    streak: t('categories.streak'),
    special: t('categories.special'),
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-[--color-tb-navy] mb-8">
        {t('title')}
      </h1>

      {badges.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[--color-tb-shadow] mb-4">{t('noBadges')}</p>
            <p className="text-sm text-[--color-tb-shadow]">{t('earnBadgesHint')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold text-[--color-tb-navy] mb-4">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryBadges.map((userBadge) => (
                  <Card key={userBadge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{userBadge.badge?.name || "Unknown Badge"}</CardTitle>
                        {userBadge.badge?.xp_reward && userBadge.badge.xp_reward > 0 && (
                          <Badge variant="info">+{userBadge.badge.xp_reward} XP</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userBadge.badge?.icon_url && (
                        <div className="mb-4">
                          <img
                            src={userBadge.badge.icon_url}
                            alt={userBadge.badge.name}
                            className="w-16 h-16 mx-auto"
                          />
                        </div>
                      )}
                      {userBadge.badge?.description && (
                        <p className="text-sm text-[--color-tb-shadow] mb-4">
                          {userBadge.badge.description}
                        </p>
                      )}
                      <div className="text-xs text-[--color-tb-shadow]">
                        {t('earnedOn')}: {new Date(userBadge.awarded_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

