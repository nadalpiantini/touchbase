"use client";

import { useState, useDeferredValue, useCallback, memo } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

type OnboardingRole = 'teacher' | 'student';

// Memoized role button to prevent re-renders on input changes
const RoleButton = memo(function RoleButton({
  role,
  isSelected,
  onSelect,
  title,
  description,
}: {
  role: OnboardingRole;
  isSelected: boolean;
  onSelect: (role: OnboardingRole) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className={`p-6 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-tb-red bg-tb-red/5'
          : 'border-tb-line hover:border-tb-red/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-tb-red' : 'border-tb-shadow'
        }`}>
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-tb-red" />
          )}
        </div>
        <h3 className="font-display font-semibold text-lg text-tb-navy">
          {title}
        </h3>
      </div>
      <p className="text-sm font-sans text-tb-shadow">
        {description}
      </p>
    </button>
  );
});

export default function RoleSelection() {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null);
  const [orgName, setOrgName] = useState("");
  // Deferred value for non-urgent UI updates (button disabled state)
  const deferredOrgName = useDeferredValue(orgName);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");

  // Memoized handlers to prevent child re-renders
  const handleRoleSelect = useCallback((role: OnboardingRole) => {
    setSelectedRole(role);
  }, []);

  const handleOrgNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOrgName(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !orgName.trim()) {
      setError(t('errors.selectRoleAndOrg'));
      return;
    }

    setStatus("running");
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: orgName.trim(),
          role: selectedRole
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Onboarding failed");

      setStatus("done");
      // Redirect based on role
      setTimeout(() => {
        router.push(`/${locale}/${selectedRole}/dashboard`);
      }, 1000);
    } catch (e: unknown) {
      setStatus("error");
      setError(e instanceof Error ? e.message : t('errors.createFailed'));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold text-tb-navy">
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-tb-navy mb-3">
              {t('selectRole')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RoleButton
                role="teacher"
                isSelected={selectedRole === 'teacher'}
                onSelect={handleRoleSelect}
                title={t('roles.teacher.title')}
                description={t('roles.teacher.description')}
              />
              <RoleButton
                role="student"
                isSelected={selectedRole === 'student'}
                onSelect={handleRoleSelect}
                title={t('roles.student.title')}
                description={t('roles.student.description')}
              />
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label htmlFor="orgName" className="block text-sm font-sans font-medium text-tb-navy mb-2">
              {t('orgName')}
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={handleOrgNameChange}
              placeholder={t('orgNamePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-tb-line focus:border-tb-red focus:outline-none font-sans"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-sans">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={status === "running" || !selectedRole || !deferredOrgName.trim()}
            loading={status === "running"}
            fullWidth
            size="lg"
          >
            {status === "running" ? t('creating') : t('createAccount')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

