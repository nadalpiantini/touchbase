import { Suspense } from "react";
import { useTranslations } from "next-intl";
import ClassesList from "@/components/classes/ClassesList";
import { LoadingSpinner } from "@/components/ui";

export default function ClassesPage() {
  const t = useTranslations("classes");

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ClassesList />
      </Suspense>
    </div>
  );
}
