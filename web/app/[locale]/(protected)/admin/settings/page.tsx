"use client";

import React, { useState, ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Select,
  Checkbox,
} from "@/components/ui";

type SettingsSection = "general" | "security" | "notifications" | "integrations";

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [saving, setSaving] = useState(false);

  // General settings state
  const [siteName, setSiteName] = useState("TouchBase Academy");
  const [defaultLocale, setDefaultLocale] = useState("es");
  const [timezone, setTimezone] = useState("America/Mexico_City");

  // Security settings state
  const [requireMfa, setRequireMfa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [passwordMinLength, setPasswordMinLength] = useState("8");

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [newUserAlerts, setNewUserAlerts] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Show success toast
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const sections: { key: SettingsSection; label: string; icon: ReactNode }[] = [
    {
      key: "general",
      label: t("sections.general") || "General",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: "security",
      label: t("sections.security") || "Security",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      key: "notifications",
      label: t("sections.notifications") || "Notifications",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      key: "integrations",
      label: t("sections.integrations") || "Integrations",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-tb-bone">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href={`/${locale}/admin`}
              className="text-tb-shadow hover:text-tb-navy"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <span className="text-tb-shadow">{t("breadcrumb.admin") || "Admin"}</span>
            <span className="text-tb-shadow">/</span>
            <span className="text-tb-navy font-medium">{t("title") || "Settings"}</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-tb-navy">
            {t("title") || "Platform Settings"}
          </h1>
          <p className="text-tb-shadow mt-1">
            {t("subtitle") || "Configure global platform settings and preferences"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.key
                          ? "bg-tb-rust/10 text-tb-rust"
                          : "text-tb-shadow hover:bg-tb-bone/50 hover:text-tb-navy"
                      }`}
                    >
                      {section.icon}
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeSection === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("general.title") || "General Settings"}</CardTitle>
                  <CardDescription>
                    {t("general.description") || "Basic platform configuration options"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      {t("general.siteName") || "Site Name"}
                    </label>
                    <Input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="TouchBase Academy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      {t("general.defaultLanguage") || "Default Language"}
                    </label>
                    <Select
                      value={defaultLocale}
                      onChange={(e) => setDefaultLocale(e.target.value)}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      {t("general.timezone") || "Timezone"}
                    </label>
                    <Select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="America/Mexico_City">Mexico City (GMT-6)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="UTC">UTC</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("security.title") || "Security Settings"}</CardTitle>
                  <CardDescription>
                    {t("security.description") || "Authentication and access control options"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Checkbox
                    label={t("security.requireMfa") || "Require Two-Factor Authentication"}
                    checked={requireMfa}
                    onChange={(e) => setRequireMfa(e.target.checked)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      {t("security.sessionTimeout") || "Session Timeout (minutes)"}
                    </label>
                    <Select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="480">8 hours</option>
                      <option value="1440">24 hours</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tb-navy mb-2">
                      {t("security.passwordMinLength") || "Minimum Password Length"}
                    </label>
                    <Select
                      value={passwordMinLength}
                      onChange={(e) => setPasswordMinLength(e.target.value)}
                    >
                      <option value="6">6 characters</option>
                      <option value="8">8 characters</option>
                      <option value="10">10 characters</option>
                      <option value="12">12 characters</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("notifications.title") || "Notification Settings"}</CardTitle>
                  <CardDescription>
                    {t("notifications.description") || "Configure email and alert preferences"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Checkbox
                    label={t("notifications.emailNotifications") || "Enable Email Notifications"}
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <Checkbox
                    label={t("notifications.weeklyDigest") || "Send Weekly Activity Digest"}
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                  />
                  <Checkbox
                    label={t("notifications.newUserAlerts") || "Alert on New User Registration"}
                    checked={newUserAlerts}
                    onChange={(e) => setNewUserAlerts(e.target.checked)}
                  />
                </CardContent>
              </Card>
            )}

            {activeSection === "integrations" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("integrations.title") || "Integrations"}</CardTitle>
                  <CardDescription>
                    {t("integrations.description") || "Connect external services and APIs"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* PostHog */}
                    <div className="flex items-center justify-between p-4 border border-tb-line rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-tb-navy/10 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-tb-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-tb-navy">PostHog Analytics</p>
                          <p className="text-sm text-tb-shadow">Product analytics and session recording</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        {t("integrations.connected") || "Connected"}
                      </span>
                    </div>

                    {/* Supabase */}
                    <div className="flex items-center justify-between p-4 border border-tb-line rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-tb-navy/10 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-tb-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-tb-navy">Supabase</p>
                          <p className="text-sm text-tb-shadow">Database, Auth, and Storage</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                        {t("integrations.connected") || "Connected"}
                      </span>
                    </div>

                    {/* Email Service */}
                    <div className="flex items-center justify-between p-4 border border-tb-line rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-tb-navy/10 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-tb-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-tb-navy">Email Service</p>
                          <p className="text-sm text-tb-shadow">Transactional email delivery</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {t("integrations.configure") || "Configure"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t("saving") || "Saving..."}
                  </>
                ) : (
                  t("save") || "Save Settings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
