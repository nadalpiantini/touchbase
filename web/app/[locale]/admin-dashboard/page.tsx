import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const headersList = await headers();
  const referer = headersList.get("referer");
  
  // Redirect to dashboard with bypass parameter
  redirect(`/${locale}/dashboard?admin=true`);
}

