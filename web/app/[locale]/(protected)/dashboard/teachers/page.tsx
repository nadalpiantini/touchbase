"use client";

import { useState } from "react";
import TeacherRegistrationWizard from "@/components/teachers/TeacherRegistrationWizard";
import TeachersTable from "@/components/teachers/TeachersTable";
import { Button } from "@/components/ui";

export default function TeachersPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-tb-navy]">Profesores</h1>
        <p className="text-[--color-tb-shadow] mt-1 font-sans">Gestiona los profesores de tu organización</p>
      </div>
      
      {showWizard ? (
        <TeacherRegistrationWizard
          onComplete={() => {
            setShowWizard(false);
            window.location.reload();
          }}
          onCancel={() => setShowWizard(false)}
        />
      ) : (
        <>
          <div className="bg-white border border-[--color-tb-line] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[--color-tb-navy]">Registrar nuevo profesor</h2>
              <Button onClick={() => setShowWizard(true)}>
                + Nuevo Profesor
              </Button>
            </div>
            <p className="text-[--color-tb-shadow] font-sans">Haz clic en el botón para iniciar el registro completo de profesor.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-[--color-tb-navy]">Lista de Profesores</h2>
            <TeachersTable />
          </div>
        </>
      )}
    </main>
  );
}

