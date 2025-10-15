import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingKickoff from "@/components/onboarding/OnboardingKickoff";
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const s = supabaseServer();

  // 1) Obtener usuario autenticado
  const { data: { user }, error: userError } = await s.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  // 2) Obtener profile para ver si tiene default_org_id
  const { data: profile } = await s
    .from("touchbase_profiles")
    .select("id, full_name, default_org_id")
    .eq("id", user.id)
    .single();

  // 3) Si NO tiene org aún, mostrar onboarding
  if (!profile?.default_org_id) {
    return (
      <main className="min-h-screen bg-[--color-tb-bone]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-dugout rounded-2xl border border-[--color-tb-line]">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-display font-bold text-[--color-tb-navy] mb-4">
                {t('onboarding.title')}
              </h1>
              <p className="text-[--color-tb-shadow] mb-6">
                {t('onboarding.subtitle')}
              </p>
              {/* Kickoff auto-ejecutará la creación */}
              <OnboardingKickoff suggestedName="Mi Academia" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 4) Si tiene org, obtener datos y mostrar dashboard normal
  const { data: org } = await s
    .from("touchbase_organizations")
    .select("id, name, slug")
    .eq("id", profile.default_org_id)
    .single();

  const { data: membership } = await s
    .from("touchbase_memberships")
    .select("role")
    .eq("org_id", profile.default_org_id)
    .eq("user_id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-[--color-tb-bone]">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="bg-white overflow-hidden shadow-dugout rounded-2xl mb-6 border border-[--color-tb-line]">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-3xl font-display font-bold text-[--color-tb-navy]">
                {t('header.title', { orgName: org?.name || "TouchBase" })}
              </h1>
              <p className="mt-1 text-sm text-[--color-tb-shadow]">
                {t('header.welcome', { userName: profile?.full_name || user.email })} • {t('header.role', { role: membership?.role || "viewer" })}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow-dugout rounded-2xl border border-[--color-tb-line]">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-xl bg-[--color-tb-navy] p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[--color-tb-shadow] truncate">
                        {t('stats.players')}
                      </dt>
                      <dd className="text-lg font-display font-semibold text-[--color-tb-navy]">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-dugout rounded-2xl border border-[--color-tb-line]">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-xl bg-[--color-tb-stitch] p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[--color-tb-shadow] truncate">
                        {t('stats.games')}
                      </dt>
                      <dd className="text-lg font-display font-semibold text-[--color-tb-navy]">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-dugout rounded-2xl border border-[--color-tb-line]">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-xl bg-[--color-tb-red] p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[--color-tb-shadow] truncate">
                        {t('stats.teams')}
                      </dt>
                      <dd className="text-lg font-display font-semibold text-[--color-tb-navy]">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-dugout rounded-2xl border border-[--color-tb-line]">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="rounded-xl bg-[--color-tb-shadow] p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[--color-tb-shadow] truncate">
                        {t('stats.nextGame')}
                      </dt>
                      <dd className="text-lg font-display font-semibold text-[--color-tb-navy]">
                        {t('stats.noData')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-display font-semibold text-[--color-tb-navy] mb-4">
              {t('quickActions.title')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button className="relative rounded-2xl border border-[--color-tb-line] bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-[--color-tb-red] hover:shadow-dugout focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[--color-tb-stitch]/60 transition-all">
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[--color-tb-navy]">
                    {t('quickActions.addPlayer.title')}
                  </p>
                  <p className="text-sm text-[--color-tb-shadow]">
                    {t('quickActions.addPlayer.description')}
                  </p>
                </div>
              </button>

              <button className="relative rounded-2xl border border-[--color-tb-line] bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-[--color-tb-red] hover:shadow-dugout focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[--color-tb-stitch]/60 transition-all">
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[--color-tb-navy]">
                    {t('quickActions.scheduleGame.title')}
                  </p>
                  <p className="text-sm text-[--color-tb-shadow]">
                    {t('quickActions.scheduleGame.description')}
                  </p>
                </div>
              </button>

              <button className="relative rounded-2xl border border-[--color-tb-line] bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-[--color-tb-red] hover:shadow-dugout focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[--color-tb-stitch]/60 transition-all">
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[--color-tb-navy]">
                    {t('quickActions.viewStats.title')}
                  </p>
                  <p className="text-sm text-[--color-tb-shadow]">
                    {t('quickActions.viewStats.description')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}