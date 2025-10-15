"use client";
import { useEffect, useState } from "react";

export default function OnboardingKickoff({ suggestedName }: { suggestedName?: string }) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        setStatus("running");
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgName: suggestedName }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Onboarding failed");
        setStatus("done");
        setMsg("¡Listo! Redirigiendo…");
        // refresca para que el server ya vea default_org_id
        setTimeout(() => location.reload(), 800);
      } catch (e: unknown) {
        setStatus("error");
        setMsg(e instanceof Error ? e.message : "Error inesperado");
      }
    };

    if (status === "idle") {
      run();
    }
  }, [suggestedName, status]);

  return (
    <div className="text-sm">
      {status === "running" && (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Creando organización y permisos…</span>
        </div>
      )}
      {status === "done" && (
        <div className="text-green-600 font-medium">
          ✅ {msg}
        </div>
      )}
      {status === "error" && (
        <div className="text-red-600">
          ⚠️ {msg}
        </div>
      )}
    </div>
  );
}