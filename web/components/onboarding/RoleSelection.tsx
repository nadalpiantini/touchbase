"use client";

import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
type OnboardingRole = 'teacher' | 'student';

export default function RoleSelection() {
  const t = useTranslations('onboarding');
  const locale = useLocale();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null);
  const [orgName, setOrgName] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !orgName.trim()) {
      setError("Por favor selecciona un rol y proporciona un nombre para tu organización");
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
      setError(e instanceof Error ? e.message : "Error al crear cuenta");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-bold text-[--color-tb-navy]">
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
            <label className="block text-sm font-medium text-[--color-tb-navy] mb-3">
              {t('selectRole')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedRole === 'teacher'
                    ? 'border-[--color-tb-red] bg-[--color-tb-red]/5'
                    : 'border-[--color-tb-line] hover:border-[--color-tb-red]/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'teacher' ? 'border-[--color-tb-red]' : 'border-[--color-tb-shadow]'
                  }`}>
                    {selectedRole === 'teacher' && (
                      <div className="w-3 h-3 rounded-full bg-[--color-tb-red]" />
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-[--color-tb-navy]">
                    {t('roles.teacher.title')}
                  </h3>
                </div>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('roles.teacher.description')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selectedRole === 'student'
                    ? 'border-[--color-tb-red] bg-[--color-tb-red]/5'
                    : 'border-[--color-tb-line] hover:border-[--color-tb-red]/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedRole === 'student' ? 'border-[--color-tb-red]' : 'border-[--color-tb-shadow]'
                  }`}>
                    {selectedRole === 'student' && (
                      <div className="w-3 h-3 rounded-full bg-[--color-tb-red]" />
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-[--color-tb-navy]">
                    {t('roles.student.title')}
                  </h3>
                </div>
                <p className="text-sm font-sans text-[--color-tb-shadow]">
                  {t('roles.student.description')}
                </p>
              </button>
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-[--color-tb-navy] mb-2">
              {t('orgName')}
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder={t('orgNamePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-[--color-tb-line] focus:border-[--color-tb-red] focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={status === "running" || !selectedRole || !orgName.trim()}
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

