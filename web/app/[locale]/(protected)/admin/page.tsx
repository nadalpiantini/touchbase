"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";

type SystemStats = {
  organizations: number;
  users: number;
  teachers: number;
  students: number;
  classes: number;
  modules: number;
  activeModules: number;
  totalProgress: number;
  completedModules: number;
};

type RecentActivity = {
  id: string;
  type: "user_signup" | "class_created" | "module_completed" | "org_created";
  description: string;
  timestamp: string;
  user?: string;
};

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load system stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        // Mock data for development
        setStats({
          organizations: 5,
          users: 100,
          teachers: 15,
          students: 80,
          classes: 25,
          modules: 50,
          activeModules: 45,
          totalProgress: 350,
          completedModules: 200,
        });
      }

      // Load recent activity
      const activityRes = await fetch("/api/admin/activity");
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      } else {
        // Mock activity data
        setActivities([
          {
            id: "1",
            type: "user_signup",
            description: "New student registered",
            timestamp: new Date().toISOString(),
            user: "student1@touchbase.academy",
          },
          {
            id: "2",
            type: "class_created",
            description: "New class created: Life Skills 101",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: "teacher1@touchbase.academy",
          },
          {
            id: "3",
            type: "module_completed",
            description: "Module completed: Active Listening",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            user: "student5@touchbase.academy",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user_signup":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        );
      case "class_created":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "module_completed":
        return (
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "org_created":
        return (
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tb-bone flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tb-rust"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tb-bone">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-tb-navy">
            {t("dashboard.title") || "Admin Dashboard"}
          </h1>
          <p className="mt-2 text-tb-shadow">
            {t("dashboard.subtitle") || "System-wide overview and management"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link href={`/${locale}/admin/organizations`}>
            <Button variant="primary">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                />
              </svg>
              {t("dashboard.manageOrgs") || "Manage Organizations"}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/users`}>
            <Button variant="outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {t("dashboard.manageUsers") || "Manage Users"}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/billing`}>
            <Button variant="outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              {t("dashboard.billing") || "Billing"}
            </Button>
          </Link>
          <Link href={`/${locale}/admin/settings`}>
            <Button variant="outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t("dashboard.settings") || "Settings"}
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-tb-shadow">
                  {t("stats.organizations") || "Organizations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-tb-navy">
                  {stats.organizations}
                </div>
                <p className="text-xs text-tb-shadow mt-1">
                  Active organizations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-tb-shadow">
                  {t("stats.totalUsers") || "Total Users"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-tb-navy">
                  {stats.users}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="info">{stats.teachers} teachers</Badge>
                  <Badge variant="success">{stats.students} students</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-tb-shadow">
                  {t("stats.classes") || "Classes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-tb-navy">
                  {stats.classes}
                </div>
                <p className="text-xs text-tb-shadow mt-1">Active classes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-tb-shadow">
                  {t("stats.modules") || "Modules"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-tb-navy">
                  {stats.modules}
                </div>
                <p className="text-xs text-tb-shadow mt-1">
                  {stats.activeModules} active modules
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Learning Stats */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {t("stats.learningProgress") || "Learning Progress Overview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-tb-rust">
                      {stats.totalProgress}
                    </div>
                    <p className="text-sm text-tb-shadow mt-1">
                      Total Progress Records
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {stats.completedModules}
                    </div>
                    <p className="text-sm text-tb-shadow mt-1">
                      Modules Completed
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {stats.totalProgress > 0
                        ? Math.round(
                            (stats.completedModules / stats.totalProgress) * 100
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-tb-shadow mt-1">
                      Completion Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("stats.quickStats") || "Quick Stats"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-tb-shadow">Avg. class size</span>
                    <span className="font-semibold">
                      {stats.classes > 0
                        ? Math.round(stats.students / stats.classes)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-tb-shadow">
                      Modules per class
                    </span>
                    <span className="font-semibold">
                      {stats.classes > 0
                        ? (stats.modules / stats.classes).toFixed(1)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-tb-shadow">
                      Student/Teacher ratio
                    </span>
                    <span className="font-semibold">
                      {stats.teachers > 0
                        ? (stats.students / stats.teachers).toFixed(1)
                        : 0}
                      :1
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {t("activity.title") || "Recent Activity"}
              </CardTitle>
              <Link href={`/${locale}/dashboard/audit`}>
                <Button variant="ghost" size="sm">
                  {t("activity.viewAll") || "View All"}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-tb-shadow text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-tb-bone/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-tb-navy">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-tb-shadow truncate">
                          {activity.user}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-tb-shadow whitespace-nowrap">
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
