"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

// Use the singleton client at module level
const supabase = supabaseClient!;

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState("Autenticando…");

  useEffect(() => {
    const run = async () => {
      try {
        // Para OAuth con PKCE (cuando se usa code)
        const { data, error } = await supabase.auth.getSession();
        // detectSessionInUrl ya gestiona magic links (#access_token)
        if (error) throw error;

        setMsg("¡Sesión iniciada! Redirigiendo…");
        window.location.replace("/dashboard");
      } catch (e: any) {
        setMsg(`Error: ${e?.message || "No se pudo iniciar sesión"}`);
      }
    };
    run();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-lg">{msg}</p>
      </div>
    </main>
  );
}